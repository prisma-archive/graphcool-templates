const fromEvent = require('graphcool-lib').fromEvent
const bcrypt = require('bcrypt')

module.exports = function(event) {
  const phoneNumber = event.data.phoneNumber
  const deviceId = event.data.deviceId
  const newDeviceId = event.data.newDeviceId
  const graphcool = fromEvent(event)
  const api = graphcool.api('simple/v1')
  const saltRounds = 10

  function getGraphcoolUser(phoneNumber) {
    return api.request(`
    query {
      User(phoneNumber: "${phoneNumber}") {
        id
        deviceId
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

  function updateGraphcoolUser(id, newDeviceIdHash) {
    return api.request(`
      mutation {
        updateUser(
          id:"${id}",
          deviceId:"${newDeviceIdHash}"
        ) {
          id
        }
      }`)
      .then((userMutationResult) => {
        return userMutationResult.updateUser.id
      })
  }

  return getGraphcoolUser(phoneNumber)
    .then((graphcoolUser) => {
      if (graphcoolUser === null) {
        return Promise.reject("Invalid Credentials")
      } else {
        return bcrypt.compare(deviceId, graphcoolUser.deviceId)
          .then((res) => {
            if (res == true) {
              return bcrypt.hash(newDeviceId, saltRounds)
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
      return { error: error.toString() }
    })
}
