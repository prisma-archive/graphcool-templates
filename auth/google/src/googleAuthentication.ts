import { fromEvent } from 'graphcool-lib'
import { GraphQLClient } from 'graphql-request'
import * as fetch from 'isomorphic-fetch'

interface User {
  id: string
}

interface GoogleUser {
  id: string
  email: string | null
}

interface EventData {
  googleToken: string
}

// temoparily needed, remove when graphcool-lib exposes FunctionEvent + Context
interface FunctionEvent {
  data: EventData
  context: any
}

export default async (event: FunctionEvent) => {
  console.log(event)

  return authenticate(event)
    .then(r => r)
    .catch(err => {
      return { error: err.message }
    })
}

const authenticate = async (event: FunctionEvent) => {
  const graphcool = fromEvent(event)
  const api = graphcool.api('simple/v1')

  const { googleToken } = event.data

  // call google API to obtain user data
  const googleUser = await getGoogleUser(googleToken)
  
  // get graphcool user by google id
  const user: User = await getGraphcoolUser(api, googleUser.sub)
    .then(r => r.User)
    .catch(err => {
      console.log(err)
      throw new Error('An unexpected error occured during authentication.')
    })

  // check if graphcool user exists, and create new one if not
  let userId: string | null = null

  if (!user) {
    userId = await createGraphcoolUser(api, googleUser.sub)
  } else {
    userId = user.id
  }

  // generate node token for User node
  const token = await graphcool.generateAuthToken(userId!, 'User')
    .catch(err => {
      console.log(err)
      throw new Error('An unexpected error occured during authentication.')
    })

  return { data: { id: userId, token} }
}

async function getGoogleUser(googleToken: string): Promise<any> {
  const endpoint = `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${googleToken}`
  const data = await fetch(endpoint)
    .then(response => response.json())
    .catch(err => {
      console.log(err)
      throw new Error('An unexpected error occured during authentication.')
    })

  if (data.error_description) {
    console.log(data.error_description)
    throw new Error('An unexpected error occured during authentication.')
  }

  console.log(data)

  return data
}

async function getGraphcoolUser(api: GraphQLClient, googleUserId: string): Promise<{ User }> {
  const query = `
    query getUser($googleUserId: String!) {
      User(googleUserId: $googleUserId) {
        id
      }
    }
  `

  const variables = {
    googleUserId,
  }

  return api.request<{ User }>(query, variables)
}

async function createGraphcoolUser(api: GraphQLClient, googleUserId: string): Promise<string> {
  const mutation = `
    mutation createUser($googleUserId: String!) {
      createUser(
        googleUserId: $googleUserId
      ) {
        id
      }
    }
  `

  const variables = {
    googleUserId,
  }

  return api.request<{ createUser: User }>(mutation, variables)
    .then(r => r.createUser.id)
}
