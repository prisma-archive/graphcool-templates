const fromEvent = require('graphcool-lib').fromEvent
const bcrypt = require('bcrypt')
const validator = require('validator')

module.exports = function(event) {
  const phoneNumber = event.data.phoneNumber
  const newPhoneNumber = event.data.newPhoneNumber
  const deviceId = event.data.deviceId
  const graphcool = fromEvent(event)
  const api = graphcool.api('simple/v1')

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

  function updateGraphcoolUser(id, newphoneNumber) {
    return api.request(`
      mutation {
        updateUser(
          id: "${id}",
          phoneNumber: "${newPhoneNumber}"
        ) {
          id
        }
      }`)
      .then((userMutationResult) => {
        return userMutationResult.updateUser.id
      })
  }

  if (validator.isMobilePhone(newPhoneNumber, 'any')) {
    return getGraphcoolUser(phoneNumber)
      .then((graphcoolUser) => {
        if (graphcoolUser === null) {
          return Promise.reject("Invalid Credentials")
        } else {
          return bcrypt.compare(deviceId, graphcoolUser.deviceId)
            .then((res) => {
              if (res == true) {
                return updateGraphcoolUser(graphcoolUser.id, newPhoneNumber)
              } else {
                return Promise.reject("Invalid Credentials")
              }
            })
        }
      })
      .then((id) => {
        return { data: { id, phoneNumber: newPhoneNumber } }
      })
      .catch((error) => {
        return { error: error.toString() }
      })
  } else {
    return { error: "Not a valid phone number" }
  }
}
