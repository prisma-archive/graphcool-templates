const fromEvent = require('graphcool-lib').fromEvent
const crypto = require('crypto')

module.exports = function (event) {
  const email = event.data.email
  const platform = event.data.platform

  const graphcool = fromEvent(event)
  const api = graphcool.api('simple/v1')

  var apikey = ''

  switch (platform) {
    // Add your API keys here
    case 'web': apikey = __WEB_API_KEY__; break;
    case 'ios': apikey = __IOS_API_KEY__; break;
    case 'android': apikey = __ANDROID_API_KEY__; break;
    default: apikey = __WEB_API_KEY__
  }

  function getGraphcoolUser(email) {
    return api.request(`
      query {
        User(email: "${email}") {
          id
        }
      }`)
      .then(userQueryResult => {
        if (userQueryResult.error) {
          return Promise.reject(userQueryResult.error)
        } else if (!userQueryResult.User || !userQueryResult.User.id) {
          return Promise.reject('Invalid credentials')
        }
        return userQueryResult.User
      })
  }

  function generateHash(userId) {
    const hmac = crypto.createHmac('sha256', apikey)
    hmac.update(userId)
    return hmac.digest('hex')
  }

  return getGraphcoolUser(email)
    .then(graphcoolUser => {
      return generateHash(graphcoolUser.id)
    })
    .then(hash => {
      return { data: { hash } }
    })
    .catch(error => {
      console.log(error)
      return { error: 'An unexpected error occured. Please contact customer support.' }
    })
}
