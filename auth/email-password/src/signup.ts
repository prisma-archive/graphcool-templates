import { fromEvent, FunctionEvent } from 'graphcool-lib'
import { GraphQLClient } from 'graphql-request'
import * as bcrypt from 'bcrypt'
import * as validator from 'validator'

interface User {
  id: string
}

function getGraphcoolUser(api: GraphQLClient, email: string): Promise<User> {
  const query = `
  query {
    User(email: "${email}") {
      id
    }
  }`
  return api.request<{ User }>(query).then(r => r.User)
}

async function createGraphcoolUser(api: GraphQLClient, email: string, passwordHash: string): Promise<string> {
  const query = `
  mutation {
    createUser(
      email: "${email}",
      password: "${passwordHash}"
    ) {
      id
    }
  }`
  return api.request<{ createUser: User }>(query).then(r => r.createUser.id)
}

interface Data {
  email: string
  password: string
}

export default async (event: FunctionEvent<Data>) => {
  if (!event.context.graphcool.token) {
    console.log('Please provide a valid root token!')
    return { error: 'Email Signup not configured correctly.' }
  }

  const { email, password } = event.data
  const graphcool = fromEvent(event)
  const api = graphcool.api('simple/v1')
  const SALT_ROUNDS = 10

  if (!validator.isEmail(email)) {
    return { error: 'Not a valid email' }
  }

  const graphcoolUser = await getGraphcoolUser(api, email)

  if (graphcoolUser !== null) {
    throw new Error('Email already in use')
  }

  const hash = await bcrypt.hash(password, SALT_ROUNDS)
  const graphcoolUserId = await createGraphcoolUser(api, email, hash)
  const token = await graphcool.generateNodeToken(graphcoolUserId, 'User')

  return { data: { id: graphcoolUserId, token } }
}
