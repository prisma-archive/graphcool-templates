const fromEvent = require('graphcool-lib').fromEvent

const client_id = '__CLIENT_ID__'
const client_secret = '__CLIENT_SECRET__'

module.exports = function (event) {
  const code = event.data.githubCode
  const graphcool = fromEvent(event)
  const api = graphcool.api('simple/v1')

  function getGithubToken () {
    return fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id,
        client_secret,
        code
      })
    })
      .then(data => data.json())
      .then(json => json.access_token)
  }

  function getGithubAccountData (githubToken) {
    if (!githubToken) {
      return Promise.reject('Github access_token is undefined.')
    }

    return fetch(`https://api.github.com/user?access_token=${githubToken}`)
      .then(response => response.json())
      .then(parsedResponse => {
        console.log(parsedResponse)
        if (parsedResponse.error) {
          return Promise.reject(parsedResponse.error.message)
        } else {
          return parsedResponse
        }
      })
  }

  function getGraphcoolUser (githubUser) {
    return api
      .request(
        `
    query {
      User(githubUserId: "${githubUser.id}") {
        id
      }
    }`
      )
      .then(userQueryResult => {
        if (userQueryResult.error) {
          return Promise.reject(userQueryResult.error)
        } else {
          return userQueryResult.User
        }
      })
  }

  function createGraphcoolUser (githubUser) {
    return api
      .request(
        `
      mutation {
        createUser(
          githubUserId:"${githubUser.id}"
        ) {
          id
        }
      }`
      )
      .then(userMutationResult => {
        return userMutationResult.createUser.id
      })
  }

  function generateGraphcoolToken (graphcoolUserId) {
    return graphcool.generateAuthToken(graphcoolUserId, 'User')
  }

  return getGithubToken().then(githubToken => {
    return getGithubAccountData(githubToken)
      .then(githubUser => {
        return getGraphcoolUser(githubUser).then(graphcoolUser => {
          if (graphcoolUser === null) {
            return createGraphcoolUser(githubUser)
          } else {
            return graphcoolUser.id
          }
        })
      })
      .then(generateGraphcoolToken)
      .then(token => {
        return { data: { token: token } }
      })
      .catch(error => {
        return { error: error.toString() }
      })
  })
}
