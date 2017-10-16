import { fromEvent } from 'graphcool-lib'
import { GraphQLClient } from 'graphql-request'
import * as bcrypt from 'bcryptjs'
import * as validator from 'validator'

interface User {
  id: string
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

  return signup(event)
    .then(r => r)
    .catch(err => {
      return { error: err.message }
    })
}

const signup = async (event: FunctionEvent<EventData>) => {
  const graphcool = fromEvent(event)
  const api = graphcool.api('simple/v1')

  const { email, password } = event.data

  if (!validator.isEmail(email)) {
    throw new Error('Not a valid email')
  }

  // check if user exists already
  const userExists: boolean = await getUserByEmail(api, email)
    .then(r => r.User !== null)
    .catch(err => {
      console.log(err)
      throw new Error('An unexpected error occured during signup.')
    })

  if (userExists) {
    throw new Error('Email already in use')
  }

  // create password hash
  const salt = bcrypt.genSaltSync(SALT_ROUNDS)
  const hash = await bcrypt.hash(password, SALT_ROUNDS)

  // create new user
  const userId = await createGraphcoolUser(api, email, hash)
    .catch(err => {
      console.log(err)
      throw new Error('An unexpected error occured during signup.')
    })

  // generate node token for new User node
  const token = await graphcool.generateAuthToken(userId, 'User')
    .catch(err => {
      console.log(err)
      throw new Error('An unexpected error occured during signup.')
    })

  return { data: { id: userId, token } }
}

async function getUserByEmail(api: GraphQLClient, email: string): Promise<{ User }> {
  const query = `
    query getUserByEmail($email: String!) {
      User(email: $email) {
        id
      }
    }
  `

  const variables = {
    email,
  }

  return api.request<{ User }>(query, variables)
}

async function createGraphcoolUser(api: GraphQLClient, email: string, password: string): Promise<string> {
  const mutation = `
    mutation createGraphcoolUser($email: String!, $password: String!) {
      createUser(
        email: $email,
        password: $password
      ) {
        id
      }
    }
  `

  const variables = {
    email,
    password: password,
  }

  return api.request<{ createUser: User }>(mutation, variables)
    .then(r => r.createUser.id)
}
