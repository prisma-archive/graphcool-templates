const fromEvent = require('graphcool-lib').fromEvent
const bcrypt = require('bcrypt')
const validator = require('validator')

module.exports = function(event) {
  const email = event.data.email
  const newEmail = event.data.newEmail
  const password = event.data.password
  const graphcool = fromEvent(event)
  const api = graphcool.api('simple/v1')

  function getGraphcoolUser(email) {
    return api.request(`
    query {
      User(email: "${email}"){
        id
        password
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

  function updateGraphcoolUser(id, newEmail) {
    return api.request(`
      mutation {
        updateUser(
          id:"${id}",
          email:"${newEmail}"
        ){
          id
        }
      }`)
      .then((userMutationResult) => {
        return userMutationResult.updateUser.id
      })
  }

  function generateGraphcoolToken(graphcoolUserId) {
    return graphcool.generateAuthToken(graphcoolUserId, 'User')
  }

  if (validator.isEmail(newEmail)) {
    return getGraphcoolUser(email)
      .then((graphcoolUser) => {
        if (graphcoolUser === null) {
          return Promise.reject("User does not exist")
        } else {
          return bcrypt.compare(password, graphcoolUser.password)
            .then((res) => {
              if (res == true) {
                return updateGraphcoolUser(graphcoolUser.id, newEmail)
              } else {
                return Promise.reject("Password does not match")
              }
            })
        }
      })
      .then(generateGraphcoolToken)
      .then((token) => {
        return { data: { token: token } }
      })
      .catch((error) => {
        return { error: error.toString() }
      })
  } else {
    return { error: "Not a valid email" }
  }
}