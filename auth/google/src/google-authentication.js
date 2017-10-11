const fromEvent = require('graphcool-lib').fromEvent

module.exports = function(event) {
  if (!event.context.graphcool.pat) {
    console.log('Please provide a valid root token!')
    return { error: 'Google Authentication not configured correctly.'}
  }

  const googleToken = event.data.googleToken
  const graphcool = fromEvent(event)
  const api = graphcool.api('simple/v1')

  function getGoogleAccountData(googleToken) {
    return fetch(
      `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${googleToken}`)
      .then(response => response.json())
      .then(parsedResponse => {
        if (parsedResponse.error_description) {
          return Promise.reject(parsedResponse.error_description)
        } else {
          return parsedResponse
        }
      })
  }

  function getGraphcoolUser(googleUser) {
    return api.request(`
    query {
      GoogleUser(googleUserId: "${googleUser.sub}"){
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

  function createGraphcoolUser(googleUser) {
    return api.request(`
      mutation {
        createGoogleUser(
          googleUserId:"${googleUser.sub}"
        ){
          id
        }
      }`)
      .then((userMutationResult) => {
        return userMutationResult.createUser.id
      })
  }

  function generateGraphcoolToken(graphcoolUserId) {
    return graphcool.generateAuthToken(graphcoolUserId, 'GoogleUser')
  }

  return getGoogleAccountData(googleToken)
    .then((googleUser) => {
      return getGraphcoolUser(googleUser)
        .then((graphcoolUser) => {
          if (graphcoolUser === null) {
            return createGraphcoolUser(googleUser)
          } else {
            return graphcoolUser.id
          }
        })
    })
    .then(generateGraphcoolToken)
    .then((token) => {
      return { data: { token: token } }
    })
    .catch((error) => {
      console.log(error)

      // don't expose error message to client!
      return { error: 'An unexpected error occured.' }
    })
}
