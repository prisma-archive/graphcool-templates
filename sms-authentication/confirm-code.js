const fromEvent = require('graphcool-lib').fromEvent
const jwt = require('jsonwebtoken')
const JWT_SECRET_KEY = 'abc123'

function decryptSmsToken (payload) {
  const smsToken = payload.smsToken
  const confirmCode = payload.confirmCode
  try {
    const decoded = jwt.verify(smsToken, JWT_SECRET_KEY)
    if (decoded.smsCode == confirmCode) {
      return Promise.resolve(decoded.id)
    }
  } catch (error) {
    console.log('decryption error', error)
	return Promise.reject(error)
  }
}

module.exports = function sum(event) {
  const userId = event.data.userId;
  const confirmCode = event.data.confirmCode;
  const graphcool = fromEvent(event)
  const api = graphcool.api('simple/v1')
  
  function generateGraphcoolToken (graphcoolUserId) {
    return graphcool.generateAuthToken(graphcoolUserId, 'User');
  }
  
  function getGraphcoolUser (userId) {
    return api.request(`
      query {
        User(id: "${userId}") {
          smsToken
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
  
  function updateGraphcoolUser (userId) {
    return api.request(`
		mutation {
		   updateUser(id: "${userId}", smsToken: null, hasVerifiedPhone: true) {
				id
			}
		}
	`)
    .then(userMutationResult => {
      return userMutationResult.updateUser.id
    })
  }

  if (!userId) {
    return {
      error: 'Missing userId'
    }
  }
  
  if (!confirmCode) {
    return {
      error: 'Missing confirmCode'
    }
  }
  
  return getGraphcoolUser(userId)
    .then(graphcoolUser => {
    	return {
          smsToken: graphcoolUser.smsToken,
          confirmCode: confirmCode
        }
  	})
  	.then(decryptSmsToken)
  	.then(updateGraphcoolUser)
  	.then(generateGraphcoolToken)
  	.then(token => {
    	return {
          data: {
            token: token
          }
        }
  	})
    .catch(error => {
      return {
        error: error.toString()
      }
    })
  
}
