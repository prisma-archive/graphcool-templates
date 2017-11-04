import { fromEvent, FunctionEvent } from 'graphcool-lib'
import { GraphQLClient } from 'graphql-request'
import { decode } from 'jsonwebtoken'
import * as jwt from 'express-jwt'
import * as jwksRsa from 'jwks-rsa'
import * as pify from 'pify'

interface User {
  id: string
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

    // get graphcool user with auth0UserId
    const { sub: auth0UserId } = decode(accessToken);
    const user: User = await getGraphcoolUser(api, auth0UserId)

    // check if graphcool user exists, and create new one if not
    const userId = user ? user.id : await createGraphcoolUser(api, auth0UserId)

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

  return pify(
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
    })
  )(req, null)

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

async function createGraphcoolUser(api: GraphQLClient, auth0UserId: string): Promise<string> {
  return api
    .request<{ createUser: User }>(
    `
      mutation createUser($auth0UserId: String!) {
        createUser(
          auth0UserId: $auth0UserId
        ){
          id
        }
      }
    `,
    { auth0UserId }
    ).then(res => res.createUser.id)
}
