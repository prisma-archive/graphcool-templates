const fromEvent = require('graphcool-lib').fromEvent
const bcrypt = require('bcrypt')

module.exports = function(event) {
  const phoneNumber = event.data.phoneNumber
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

  function generateGraphcoolToken(graphcoolUserId) {
    return graphcool.generateAuthToken(graphcoolUserId, 'User')
  }

  return getGraphcoolUser(phoneNumber)
    .then((graphcoolUser) => {
      if (graphcoolUser === null) {
        return Promise.reject("Invalid Credentials") //returning same generic error so user can't find out what phoneNumbers are registered.
      } else {
        return bcrypt.compare(deviceId, graphcoolUser.deviceId)
          .then((res) => {
            if (res === true) {
              return graphcoolUser.id
            } else {
              return Promise.reject("Invalid Credentials")
            }
          })
      }
    })
    .then(generateGraphcoolToken)
    .then((token) => {
      return { data: { token } }
    })
    .catch((error) => {
      return { error: error.toString() }
    })
}
