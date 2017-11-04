import { fromEvent, FunctionEvent } from 'graphcool-lib'
import { GraphQLClient } from 'graphql-request'
import { decode } from 'jsonwebtoken'
import * as fetch from 'isomorphic-fetch'
import * as jwt from 'express-jwt'
import * as jwksRsa from 'jwks-rsa'

interface User {
  id: string
}

// https://auth0.com/docs/user-profile/normalized/auth0
// with scope="openid email profile"
interface Auth0User {
  sub: string
  email?: string
  email_verified?: boolean
  given_name?: string
  family_name?: string
  nickname?: string
  name?: string
  picture?: string
}

interface EventData {
  accessToken: string
}

export default async (event: FunctionEvent<EventData>) => {
  if (!process.env.AUTH0_DOMAIN || !process.env.AUTH0_AUDIENCE) {
    console.log('Please provide a valid auth0 domain and audience!')
    return { error: 'Auth0 Authentification not configured correctly.' }
  }

  try {
    const graphcool = fromEvent(event)
    const api = graphcool.api('simple/v1')
    const { accessToken } = event.data

    // check auth0 access token
    await checkJwt(accessToken)

    // call auth0 API to obtain user data
    const auth0User = await getAuth0User(accessToken)
    const auth0UserId = auth0User.sub

    // get graphcool user with auth0UserId
    const user: User = await getGraphcoolUser(api, auth0UserId)

    // check if graphcool user exists, and create new one if not
    const userId = user ? user.id : await createGraphcoolUser(api, auth0User)

    // generate node token for User node
    const token = await graphcool.generateNodeToken(userId!, 'User')
    return { data: { id: userId, token } }
  } catch (e) {
    console.log(e)
    return { error: 'An unexpected error occured during authentication.' }
  }
}

async function checkJwt(accessToken: string) {
  // Inject accessToken in a header to permit express middleware usage.
  const req: any = { headers: { authorization: `Bearer ${accessToken}` } }

  return new Promise((resolve, reject) => {
    const next = (err) => err ? reject(err) : resolve();
    jwt({
      // Dynamically provide a signing key based on the kid in the header and the singing keys provided by the JWKS endpoint.
      secret: jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
      }),

      // Validate the audience and the issuer.
      audience: process.env.AUTH0_AUDIENCE,
      issuer: `https://${process.env.AUTH0_DOMAIN}/`,
      algorithms: ['RS256']
    })(req, null, next)
  })
}

async function getAuth0User(accessToken: string) {
  const endpoint = `https://${process.env.AUTH0_DOMAIN}/userinfo?access_token=${accessToken}`
  const data = await fetch(endpoint)
    .then(response => response.json())

  if (data.error) {
    throw new Error(JSON.stringify(data.error))
  }

  return data
}

async function getGraphcoolUser(api: GraphQLClient, auth0UserId: string): Promise<User> {
  return api
    .request<{ User: User }>(
    `
        query getUser($auth0UserId: String!) {
          User(auth0UserId: $auth0UserId) {
            id
          }
        }
      `,
    { auth0UserId }
    ).then(res => res.User)
}

async function createGraphcoolUser(api: GraphQLClient, auth0User: Auth0User): Promise<string> {
  return api
    .request<{ createUser: User }>(
    `
      mutation createUser($auth0UserId: String!, $email: String) {
        createUser(
          auth0UserId: $auth0UserId,
          email: $email
        ){
          id
        }
      }
    `,
    { auth0UserId: auth0User.sub, email: auth0User.email }
    ).then(res => res.createUser.id)
}
