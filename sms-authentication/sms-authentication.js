const fromEvent = require('graphcool-lib').fromEvent
const twilio = require('twilio')
const jwt = require('jsonwebtoken')

const JWT_SECRET_KEY = 'abc123'
const TWILIO_SID = ''
const TWILIO_AUTH_TOKEN = ''
const TWILIO_NUMBER = ''

function generateJwtSmsDigitsAndToken(userId) {
  const smsCode = Math.floor(Math.random() * 90000) + 10000
  const jwtPayload = {
    id: userId,
    smsCode: smsCode
  }

  const options = {
    expiresIn: '6h'
  }

  const jwtSmsToken = jwt.sign(jwtPayload, JWT_SECRET_KEY, options);

  return {
    smsCode: smsCode,
    smsToken: jwtSmsToken
  }
}

function setupTwilio () {
  const client = new twilio(TWILIO_SID, TWILIO_AUTH_TOKEN)
  return client;
}

const TwilioClient = setupTwilio();
function sendTextAsync (to, smsToken, body) {
    const getDefaultText = token => `Your confirmation code is: ${token}`
	return TwilioClient.messages.create({
      body: body || getDefaultText(smsToken),
      to,
      from: TWILIO_NUMBER
    })
}

module.exports = function (event) {
  const phoneNumber = event.data.phone
  const graphcool = fromEvent(event)
  const api = graphcool.api('simple/v1')

  function getGraphcoolUser (phoneNumber) {
    return api.request(`
      query {
        User(phone: "${phoneNumber}") {
          id
        }
      }
    `)
    .then(userQueryResult => {
      const error = userQueryResult.error;
      const User = userQueryResult.User;
      if (error) {
        return Promise.reject(error)
      } else {
        return User
      }
    })
  }

  function createGraphcoolUser (phoneNumber) {
    return api.request(`
      mutation CreateUserWithPhoneNumber {
        createUser(phone: "${phoneNumber}") {
          id
        }
      }
    `)
    .then(userMutationResult => {
      return userMutationResult.createUser.id
    })
  }

  function updateGraphcoolUser (userId, smsToken) {
    return api.request(`
		mutation {
		   updateUser(id: "${userId}", smsToken: "${smsToken}") {
				id
			}
		}
	`)
    .then(userMutationResult => {
      return userMutationResult.updateUser.id
    })
  }

  function generateGraphcoolToken (graphcoolUserId) {
    return graphcool.generateAuthToken(graphcoolUserId, 'User');
  }

  function generateAndSaveSmsToken (userId, phoneNumber) {
    const smsPayload = generateJwtSmsDigitsAndToken(userId)
    sendTextAsync(phoneNumber, smsPayload.smsCode);

    return updateGraphcoolUser(userId, smsPayload.smsToken);
  }

  return getGraphcoolUser(phoneNumber)
  .then(graphcoolUser => {
    if (graphcoolUser === null) {
      return createGraphcoolUser(phoneNumber)
    } else {
      return graphcoolUser.id
    }
  })
  .then(userId => generateAndSaveSmsToken(userId, phoneNumber))
  .then(userId => {
    return {
      data: {
        userId: userId
      }
    }
  })
  .catch((error) => {
    console.log(error)

    // don't expose error message to client!
    return { error: 'An unexpected error occured.' }
  })

}
