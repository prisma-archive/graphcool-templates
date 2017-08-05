const fromEvent = require('graphcool-lib').fromEvent
const bcrypt = require('bcrypt')

module.exports = function (event) {
  const resetToken = event.data.resetToken
  const newPassword = event.data.password
  const graphcool = fromEvent(event)
  const api = graphcool.api('simple/v1')
  const saltRounds = 10

  function getUserWithToken (resetToken) {
    return api.request(`
      query {
        User(resetToken: "${resetToken}") {
          id
        }
      }`)
      .then(userQueryResult => {
        if (userQueryResult.error) {
          return Promise.reject(userQueryResult.error)
        } else if (!userQueryResult.User) {
          return Promise.reject('Not a valid token')
        } else {
          return userQueryResult.User.id
        }
      })
  }

  function updatePassword (id, newPasswordHash) {
    return api.request(`
      mutation {
        updateUser(
          id: "${id}",
          password: "${newPasswordHash}",
          resetToken: null,
          resetExpires: null
        ) {
          id
        }
      }`)
      .then(userMutationResult => (userMutationResult.updateUser.id))
  }

  return getUserWithToken(resetToken)
    .then(graphcoolUser => {
      console.log(graphcoolUser)
      const userId = graphcoolUser
      if (graphcoolUser === null) {
        return Promise.reject('Invalid credentials.')
      } else if (new Date() > new Date(graphcoolUser.resetExpires)) {
        return Promise.reject('Token expired.')
      } else {
        return bcrypt.hash(newPassword, saltRounds)
          .then(hash => updatePassword(userId, hash))
          .then(id => ({ data: { id } }))
          .catch(error => ({ error: error.toString() }))
      }
    })
    .catch(error => {
      return { error: error }
    })
}
