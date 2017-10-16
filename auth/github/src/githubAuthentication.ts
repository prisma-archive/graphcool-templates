import { fromEvent } from 'graphcool-lib'
import { GraphQLClient } from 'graphql-request'
import * as fetch from 'isomorphic-fetch'

interface User {
  id: string
}

interface GithubUser {
  id: string
}

interface EventData {
  githubCode: string
}

// temoparily needed, remove when graphcool-lib exposes FunctionEvent + Context
interface FunctionEvent {
  data: EventData
  context: any
}

// read Github credentials from environment variables
const client_id = process.env.GITHUB_CLIENT_ID
const client_secret = process.env.GITHUB_CLIENT_SECRET

export default async (event: FunctionEvent) => {
  console.log(event)

  if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
    console.log('Please provide a valid client id and secret!')
    return { error: 'Github Authentication not configured correctly.'}
  }

  return authenticate(event)
    .then(r => r)
    .catch(err => {
      return { error: err.message }
    })
}

const authenticate = async (event: FunctionEvent) => {
  const graphcool = fromEvent(event)
  const api = graphcool.api('simple/v1')

  const { githubCode } = event.data

  // get github token
  const githubToken: string = await getGithubToken(githubCode)

  // call github API to obtain user data
  const githubUser = await getGithubUser(githubToken)

  // get graphcool user by github id
  const user: User = await getGraphcoolUser(api, githubUser.id)
    .then(r => r.User)
    .catch(err => {
      console.log(err)
      throw new Error('An unexpected error occured during authentication.')
    })

  // check if graphcool user exists, and create new one if not
  let userId: string | null = null

  if (!user) {
    userId = await createGraphcoolUser(api, githubUser.id)
  } else {
    userId = user.id
  }

  // generate node token for User node
  const token = await graphcool.generateAuthToken(userId!, 'User')
    .catch(err => {
      console.log(err)
      throw new Error('An unexpected error occured during authentication.')
    })

  console.log('f')

  return { data: { id: userId, token} }
}

async function getGithubToken(githubCode) {
  const endpoint = 'https://github.com/login/oauth/access_token'
  console.log(client_id)
  console.log(client_secret)
  console.log(githubCode)

  const data = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      client_id,
      client_secret,
      code: githubCode,
    })
  })
    .then(response => response.json())
    .catch(err => {
      console.log(err)
      throw new Error('An unexpected error occured during authentication.')
    })

  if (data.error) {
    console.log(data)
    throw new Error('An unexpected error occured during authentication.')
  }

  return data.access_token
}

async function getGithubUser(githubToken: string): Promise<any> {
  const endpoint = `https://api.github.com/user?access_token=${githubToken}`
  const data = await fetch(endpoint)
    .then(response => response.json())
    .catch(err => {
      console.log(err)
      throw new Error('An unexpected error occured during authentication.')
    })

  if (data.error) {
    console.log(data.error)
    throw new Error('An unexpected error occured during authentication.')
  }

  console.log(data)

  return data
}

async function getGraphcoolUser(api: GraphQLClient, githubUserId: string): Promise<{ User }> {
  const query = `
    query getUser($githubUserId: String!) {
      User(githubUserId: $githubUserId) {
        id
      }
    }
  `

  const variables = {
    // need to 'cast' to string, otherwise it will be seen as integer by GraphQL (because it's a number string)
    githubUserId: `${githubUserId}`
  }

  return api.request<{ User }>(query, variables)
}

async function createGraphcoolUser(api: GraphQLClient, githubUserId: string): Promise<string> {
  const mutation = `
    mutation createUser($githubUserId: String!) {
      createUser(
        githubUserId: $githubUserId
      ) {
        id
      }
    }
  `

  const variables = {
    // need to 'cast' to string, otherwise it will be seen as integer by GraphQL (because it's a number string)
    githubUserId: `${githubUserId}`
  }

  return api.request<{ createUser: User }>(mutation, variables)
    .then(r => r.createUser.id)
}
