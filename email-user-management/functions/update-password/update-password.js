const fromEvent = require('graphcool-lib').fromEvent
const bcrypt = require('bcrypt')
const validator = require('validator')

module.exports = function(event) {
  const email = event.data.email
  const oldPass = event.data.oldPassword
  const newPass = event.data.newPassword
  const graphcool = fromEvent(event)
  const api = graphcool.api('simple/v1')
  const saltRounds = 10

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

  function updateGraphcoolUser(id, newPasswordHash) {
    return api.request(`
      mutation {
        updateUser(
          id:"${id}",
          password:"${newPasswordHash}"
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

  if (validator.isEmail(email)) {
    return getGraphcoolUser(email)
      .then((graphcoolUser) => {
        if (graphcoolUser === null) {
          return Promise.reject("User does not exist")
        } else {
          return bcrypt.compare(oldPass, graphcoolUser.password)
            .then((res) => {
              if (res == true) {
                return bcrypt.hash(newPass, saltRounds)
                .then(hash => updateGraphcoolUser(graphcoolUser.id, hash))
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