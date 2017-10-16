import { fromEvent } from 'graphcool-lib'
import { GraphQLClient } from 'graphql-request'
import * as bcrypt from 'bcryptjs'

interface User {
  id: string
  password: string
}

interface EventData {
  email: string
  password: string
}

// temoparily needed, remove when graphcool-lib exposes FunctionEvent + Context
interface FunctionEvent<T extends any> {
  data: T
  context: any
}

const SALT_ROUNDS = 10

export default async (event: FunctionEvent<EventData>) => {
  console.log(event)

  return authenticate(event)
    .then(r => r)
    .catch(err => {
      return { error: err.message }
    })
}

const authenticate = async (event: FunctionEvent<EventData>) => {
  const graphcool = fromEvent(event)
  const api = graphcool.api('simple/v1')

  const { email, password } = event.data

  // get user by email
  const user: User = await getUserByEmail(api, email)
    .then(r => r.User)
    .catch(err => {
      console.log(err)
      throw new Error('An unexpected error occured during authentication.')
    })

  // no user with this email
  if (!user) {
    throw new Error('Invalid credentials!')
  }

  const passwordIsCorrect = await bcrypt.compare(password, user.password)
  if (!passwordIsCorrect) {
    throw new Error('Invalid credentials!')
  }

  // generate node token for existing User node
  const token = await graphcool.generateAuthToken(user.id, 'User')
    .catch(err => {
      console.log(err)
      throw new Error('An unexpected error occured during authentication.')
    })

  return { data: { id: user.id, token} }
}

async function getUserByEmail(api: GraphQLClient, email: string): Promise<{ User }> {
  const query = `
    query getUserByEmail($email: String!) {
      User(email: $email) {
        id
        password
      }
    }
  `

  const variables = {
    email,
  }

  return api.request<{ User }>(query, variables)
}
