import { fromEvent, FunctionEvent } from 'graphcool-lib'
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

export default async (event: FunctionEvent<EventData>) => {
  console.log(event)

  try {
    const graphcool = fromEvent(event)
    const api = graphcool.api('simple/v1')

    const { facebookToken } = event.data

    // call Facebook API to obtain user data
    const facebookUser = await getFacebookUser(facebookToken)

    // get graphcool user by facebook id
    const user: User = await getGraphcoolUser(api, facebookUser.id)
      .then(r => r.User)

    // check if graphcool user exists, and create new one if not
    let userId: string | null = null

    if (!user) {
      userId = await createGraphcoolUser(api, facebookUser)
    } else {
      userId = user.id
    }

    // generate node token for User node
    const token = await graphcool.generateNodeToken(userId!, 'User')

    return { data: { id: userId, token} }
  } catch (e) {
    console.log(e)
    return { error: 'An unexpected error occured during authentication.' }
  }
}

async function getFacebookUser(facebookToken: string): Promise<FacebookUser> {
  const endpoint = `https://graph.facebook.com/v2.9/me?fields=id%2Cemail&access_token=${facebookToken}`
  const data = await fetch(endpoint)
    .then(response => response.json())

  if (data.error) {
    throw new Error(JSON.stringify(data.error))
  }

  return data
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
