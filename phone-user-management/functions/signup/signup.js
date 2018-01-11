const fromEvent = require('graphcool-lib').fromEvent
const bcrypt = require('bcrypt')
const validator = require('validator')

module.exports = function(event) {
  const phoneNumber = event.data.phoneNumber
  const deviceId = event.data.deviceId
  const graphcool = fromEvent(event)
  const api = graphcool.api('simple/v1')
  const SALT_ROUNDS = 10

  function getGraphcoolUser(phoneNumber) {
    return api.request(`
    query {
      User(phoneNumber: "${phoneNumber}") {
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

  function createGraphcoolUser(phoneNumber, deviceIdHash) {
    return api.request(`
      mutation {
        createUser(
          phoneNumber: "${phoneNumber}",
          deviceId: "${deviceIdHash}"
        ) {
          id
        }
      }`)
      .then((userMutationResult) => {
        return userMutationResult.createUser.id
      })
  }

  if (validator.isMobilePhone(phoneNumber, 'any')) {
    return getGraphcoolUser(phoneNumber)
      .then((graphcoolUser) => {
        if (graphcoolUser === null) {
          return bcrypt.hash(deviceId, SALT_ROUNDS)
            .then(hash => createGraphcoolUser(phoneNumber, hash))
        } else {
          return Promise.reject("phone number already in use")
        }
      })
      .then((id) => {
        return { data: { id } }
      })
      .catch((error) => {
        return { error: error.toString() }
      })
  } else {
    return { error: "Not a valid phone number" }
  }
}
