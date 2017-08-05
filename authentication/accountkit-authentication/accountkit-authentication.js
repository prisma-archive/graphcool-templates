const fromEvent = require('graphcool-lib').fromEvent

module.exports = function(event) {
  const accountKitToken = event.data.accountKitToken
  const graphcool = fromEvent(event)
  const api = graphcool.api('simple/v1')

  function getAccountKitAccountData(accountKitToken) {
    const version = 'v1.1'
    return fetch(
      `https://graph.accountkit.com/${version}/me?access_token=${accountKitToken}`)
      .then(response => response.json())
      .then((parsedResponse) => {
        console.log(parsedResponse)
        if (parsedResponse.error) {
          return Promise.reject(parsedResponse.error.message)
        } else {
          return parsedResponse
        }
      })
  }

  function getGraphcoolUser(accountKitUser) {
    return api.request(`
    query {
      User(accountKitUserId: "${accountKitUser.id}"){
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

  function createGraphcoolUser(accountKitUser) {
    return api.request(`
      mutation {
        createUser(
          accountKitUserId:"${accountKitUser.id}"
        ){
          id
        }
      }`)
      .then((userMutationResult) => {
        return userMutationResult.createUser.id
      })
  }

  function generateGraphcoolToken(graphcoolUserId) {
    return graphcool.generateAuthToken(graphcoolUserId, 'User')
  }

  return getAccountKitAccountData(accountKitToken)
    .then((accountKitUser) => {
      return getGraphcoolUser(accountKitUser)
        .then((graphcoolUser) => {
          if (graphcoolUser === null) {
            return createGraphcoolUser(accountKitUser)
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
      return { error: error.toString() }
    })
}
