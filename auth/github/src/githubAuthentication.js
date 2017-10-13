const fromEvent = require('graphcool-lib').fromEvent

// read Github credentials from environment variables
const client_id = process.env.CLIENT_ID
const client_secret = process.env.CLIENT_SECRET

module.exports = event => {

  if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
    console.log('Please provide a valid client id and secret!')
    return { error: 'Github Authentication not configured correctly.'}
  }

  if (!event.context.graphcool.pat) {
    console.log('Please provide a valid root token!')
    return { error: 'Github Authentication not configured correctly.'}
  }

  const code = event.data.githubCode
  const graphcool = fromEvent(event)
  const api = graphcool.api('simple/v1')

  function getGithubToken () {
    console.log('Getting access token...')

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
    .then(json => {
      if (json.error) {
        throw new Error(json)
      } else {
        console.log(json)

        return json.access_token
      }
    })
    .catch(error => {
      console.log(error)

      return Promise.reject({ message: 'Error while authenticating with Github' })
    })
  }

  function getGithubAccountData (githubToken) {
    console.log('Getting account data...')

    return fetch(`https://api.github.com/user?access_token=${githubToken}`)
      .then(response => response.json())
      .then(json => {
        if (json.error) {
          throw new Error(json)
        } else {
          console.log(json)

          return json
        }
      })
      .catch(error => {
        console.log(error)

        return Promise.reject({ message: 'Error while getting Github user data' })
      })
  }

  function getGraphcoolUser (githubUser) {
    console.log('Getting Graphcool user...')

    return api.request(`
      query {
        User(githubUserId: "${githubUser.id}") {
          id
        }
      }
    `)
    .then(response => {
      if (response.error) {
        throw new Error(response)
      } else {
        console.log(response)

        return response.User
      }
    })
    .catch(error => {
      console.log(error)

      return Promise.reject({ message: 'Error while getting Graphcool user' })
    })
  }

  function createGraphcoolUser (githubUser) {
    console.log('Creating Graphcool user...')

    return api.request(`
      mutation {
        createUser(
          githubUserId:"${githubUser.id}"
        ) {
          id
        }
      }
    `)
    .then(response => {
      if (response.error) {
        throw new Error(response)
      } else {
        console.log(response)

        return response.createUser.id
      }
    })
    .catch(error => {
      console.log(error)

      return Promise.reject({ message: 'Error while creating Graphcool user' })
    })
  }

  function generateGraphcoolToken (graphcoolUserId) {
    return graphcool.generateAuthToken(graphcoolUserId, 'User')
      .catch(error => {
        console.log(error)

        return Promise.reject({ message: 'Error while generating token' })
      })
  }

  return getGithubToken()
    .then(githubToken => {
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
          return { data: { token } }
        })
    })
    .catch((error) => {
      console.log(error)

      return { error: error.message }
    })
}
