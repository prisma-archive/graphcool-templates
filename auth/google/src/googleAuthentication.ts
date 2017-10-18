import { fromEvent, FunctionEvent } from 'graphcool-lib'
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

export default async (event: FunctionEvent<EventData>) => {
  console.log(event)

  try {
    const graphcool = fromEvent(event)
    const api = graphcool.api('simple/v1')

    const { googleToken } = event.data

    // call google API to obtain user data
    const googleUser = await getGoogleUser(googleToken)
    
    // get graphcool user by google id
    const user: User = await getGraphcoolUser(api, googleUser.sub)
      .then(r => r.User)

    // check if graphcool user exists, and create new one if not
    let userId: string | null = null

    if (!user) {
      userId = await createGraphcoolUser(api, googleUser.sub)
    } else {
      userId = user.id
    }

    // generate node token for User node
    const token = await graphcool.generateAuthToken(userId!, 'User')

    return { data: { id: userId, token} }
  } catch (e) {
    console.log(e)
    return { error: 'An unexpected error occured during authentication.' }
  }
}

async function getGoogleUser(googleToken: string): Promise<GoogleUser> {
  const endpoint = `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${googleToken}`
  const data = await fetch(endpoint)
    .then(response => response.json())

  if (data.error_description) {
    throw new Error(data.error_description)
  }

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
