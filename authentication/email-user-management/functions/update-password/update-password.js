const fromEvent = require('graphcool-lib').fromEvent
const bcrypt = require('bcrypt')

module.exports = function(event) {
  const email = event.data.email
  const password = event.data.password
  const newPassword = event.data.newPassword
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

  return getGraphcoolUser(email)
    .then((graphcoolUser) => {
      if (graphcoolUser === null) {
        return Promise.reject("Invalid Credentials")
      } else {
        return bcrypt.compare(password, graphcoolUser.password)
          .then((res) => {
            if (res == true) {
              return bcrypt.hash(newPassword, saltRounds)
              .then(hash => updateGraphcoolUser(graphcoolUser.id, hash))
            } else {
              return Promise.reject("Invalid Credentials")
            }
          })
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
}
