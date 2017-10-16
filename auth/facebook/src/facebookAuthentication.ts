import { fromEvent } from 'graphcool-lib'
import { GraphQLClient } from 'graphql-request'

interface User {
  id: string
}

interface FacebookUser {
  id: string
  email: string | null
}

interface EventData {
  facebookToken: string
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

  const { facebookToken } = event.data

  // call Facebook API to obtain user data
  const facebookUser = await getFacebookUser(facebookToken)

  // get graphcool user by facebook id
  const user: User = await getGraphcoolUser(api, facebookUser.id)
    .then(r => r.User)
    .catch(err => {
      console.log(err)
      throw new Error('An unexpected error occured during authentication.')
    })


  // check if graphcool user exists, and create new one if not
  let userId: string | null = null

  if (!user) {
    userId = await createGraphcoolUser(api, facebookUser)
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

async function getGraphcoolUser(api: GraphQLClient, facebookUserId: string): Promise<{ User }> {
  const query = `
    query getUser($facebookUserId: String!) {
      User(facebookUserId: $facebookUserId) {
        id
      }
    }
  `

  const variables = {
    facebookUserId,
  }

  return api.request<{ User }>(query, variables)
}

async function getFacebookUser(facebookToken: string): Promise<FacebookUser> {
  const endpoint = `https://graph.facebook.com/v2.9/me?fields=id%2Cemail&access_token=${facebookToken}`
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

  return data
}

async function createGraphcoolUser(api: GraphQLClient, facebookUser: FacebookUser): Promise<string> {
  const mutation = `
    mutation createUser($facebookUserId: String!, $email: String) {
      createUser(
        facebookUserId: $facebookUserId
        email: $email
      ) {
        id
      }
    }
  `

  const variables = {
    facebookUserId: facebookUser.id,
    email: facebookUser.email,
  }

  return api.request<{ createUser: User }>(mutation, variables)
    .then(r => r.createUser.id)
}
