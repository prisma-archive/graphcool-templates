const fromEvent = require('graphcool-lib').fromEvent
const bcrypt = require('bcrypt')
const validator = require('validator')

function getGraphcoolUser(api, email) {
  return api.request(`
    query {
      EmailUser(email: "${email}") {
        id
      }
    }`)
    .then((userQueryResult) => {
      if (userQueryResult.error) {
        return Promise.reject(userQueryResult.error)
      } else {
        return userQueryResult.EmailUser
      }
    })
}

function createGraphcoolUser(api, email, passwordHash) {
  return api.request(`
    mutation {
      createEmailUser(
        email: "${email}",
        password: "${passwordHash}"
      ) {
        id
      }
    }`)
    .then((userMutationResult) => {
      return userMutationResult.createEmailUser.id
    })
}

module.exports = function(event) {
  if (!event.context.graphcool.pat) {
    console.log('Please provide a valid root token!')
    return { error: 'Email Signup not configured correctly.'}
  }

  const email = event.data.email
  const password = event.data.password
  const graphcool = fromEvent(event)
  const api = graphcool.api('simple/v1')
  const SALT_ROUNDS = 10

  if (validator.isEmail(email)) {
    return getGraphcoolUser(api, email)
      .then(graphcoolUser => {
        if (graphcoolUser === null) {
          return bcrypt.hash(password, SALT_ROUNDS)
            .then(hash => createGraphcoolUser(api, email, hash))
        } else {
          return Promise.reject("Email already in use")
        }
      })
      .then(graphcoolUserId => {
        return graphcool.generateAuthToken(graphcoolUserId, 'EmailUser')
          .then(token => {
            return { data: {id: graphcoolUserId, token}}
        })
      })
      .catch((error) => {
        console.log(error)

        // don't expose error message to client!
        return { error: 'An unexpected error occured.' }
      })
  } else {
    return { error: "Not a valid email" }
  }
}
