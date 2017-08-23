const fromEvent = require('graphcool-lib').fromEvent
const bcrypt = require('bcrypt')
const validator = require('validator')

module.exports = function(event) {
  const email = event.data.email
  const password = event.data.password
  const graphcool = fromEvent(event)
  const api = graphcool.api('simple/v1')
  const SALT_ROUNDS = 10

  function getGraphcoolUser(email) {
    return api.request(`
    query {
      User(email: "${email}") {
        id
      }
    }`)
      .then((userQueryResult) => {
        if (userQueryResult.error) {
          return Promise.reject(userQueryResult.error)
        } else {
          return userQueryResult.User
        }
      })
  }

  function createGraphcoolUser(email, passwordHash) {
    return api.request(`
      mutation {
        createUser(
          email: "${email}",
          password: "${passwordHash}"
        ) {
          id
        }
      }`)
      .then((userMutationResult) => {
        return userMutationResult.createUser.id
      })
  }

  if (validator.isEmail(email)) {
    return getGraphcoolUser(email)
      .then((graphcoolUser) => {
        if (graphcoolUser === null) {
          return bcrypt.hash(password, SALT_ROUNDS)
            .then(hash => createGraphcoolUser(email, hash))
        } else {
          return Promise.reject("Email already in use")
        }
      })
      .then((id) => {
        return { data: { id } }
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
