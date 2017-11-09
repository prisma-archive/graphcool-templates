const { fromEvent } = require('graphcool-lib')

module.exports = function(event) {
  const { linkedInToken } = event.data
  const graphcool = fromEvent(event)
  const api = graphcool.api('simple/v1')

  function getLinkedInAccountData(linkedInToken) {
    return fetch(
      `https://api.linkedin.com/v1/people/~?format=json`,
      { headers: { 'oauth_token': linkedInToken } })
      .then(response => response.json())
  }

  function getGraphcoolUser(linkedInUser) {
    return api.request(`
    query {
      User(linkedInUserId: "${linkedInUser.id}"){
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

  function createGraphcoolUser(linkedInUser) {
    return api.request(`
      mutation {
        createUser(
          linkedInUserId:"${linkedInUser.id}"
        ){
          id
        }
      }`)
      .then((userMutationResult) => {
        return userMutationResult.createUser.id
      })
  }

  function generateGraphcoolToken(graphcoolUserId) {
    return graphcool.generateNodeToken(graphcoolUserId, 'User')
  }

  return getLinkedInAccountData(linkedInToken)
    .then((linkedInUser) => {
      return getGraphcoolUser(linkedInUser)
        .then((graphcoolUser) => {
          if (graphcoolUser === null) {
            return createGraphcoolUser(linkedInUser)
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
