import { fromEvent } from 'graphcool-lib'
import { GraphQLClient } from 'graphql-request'

interface User {
  id: string
}

// temporarily needed, remove when graphcool-lib exposes FunctionEvent + Context
interface FunctionEvent {
  data: any
  context: any
}

export default async (event: FunctionEvent) => {
  try {
    if (!event.context.auth || !event.context.auth.nodeId) {
      return { data: null }
    }

    const userId = event.context.auth.nodeId
    const graphcool = fromEvent(event)
    const api = graphcool.api('simple/v1')

    // get user by id
    const user: User = await getUserById(api, userId)
      .then(r => r.User)

    // no logged in user
    if (!user || !user.id) {
      return { data: null }
    }

    // return user data 
    return { data: { id: user.id } }
  } catch (e) {
    console.log(e)
    return { error: 'An unexpected error occured during signup.' }
  }
}

async function getUserById(api: GraphQLClient, id: string): Promise<{ User }> {
  const query = `
    query getUserByEmail($id: ID!) {
      User(id: $id) {
        id
      }
    }
  `

  const variables = {
    id,
  }

  return api.request<{ User }>(query, variables)
}