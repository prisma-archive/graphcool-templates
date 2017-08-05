process.env.TZ = 'UTC'

const crypto = require('crypto')
const fromEvent = require('graphcool-lib').fromEvent

module.exports = function (event) {
  const email = event.data.email
  const graphcool = fromEvent(event)
  const api = graphcool.api('simple/v1')

  function generateResetToken () {
    return crypto.randomBytes(20).toString('hex')
  }

  function generateExpiryDate () {
    const now = new Date()
    return new Date(now.getTime() + 3600000).toISOString()
  }

  function getGraphcoolUser (email) {
    return api.request(`
    query {
      User(email: "${email}"){
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

  function toggleReset (graphcoolUserId) {
    return api.request(`
      mutation {
        updateUser(
          id: "${graphcoolUserId}",
          resetToken: "${generateResetToken()}",
          resetExpires: "${generateExpiryDate()}"
        ) {
          id
        }
      }
    `)
  }

  return getGraphcoolUser(email)
    .then((graphcoolUser) => {
      if (graphcoolUser === null) {
        return Promise.reject('Invalid Credentials') // returning same generic error so user can't find out what emails are registered.
      } else {
        return toggleReset(graphcoolUser.id)
      }
    })
    .then((response) => {
      const id = response.updateUser.id
      return { data: { id } }
    })
    .catch((error) => {
      return { error: error.toString() }
    })
}
