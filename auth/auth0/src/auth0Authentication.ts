import { fromEvent, FunctionEvent } from 'graphcool-lib'
import { GraphQLClient } from 'graphql-request'
import { decode } from 'jsonwebtoken'
import * as jwt from 'express-jwt'
import * as jwksRsa from 'jwks-rsa'

interface EventData {
  idToken: string
}

export default async (event: FunctionEvent<EventData>) => {

  if (!process.env.AUTH0_DOMAIN || !process.env.AUTH0_AUDIENCE) {
    console.log('Please provide a valid auth0 domain and audience!')
    return { error: "Auth0 Authentification not configured correctly." }
  }

  try {
    // const graphcool = fromEvent(event)
    // const api = graphcool.api('simple/v1')
    const { idToken } = event.data

    // check auth0 token
    await checkJwt(idToken)

    console.log(decode(idToken));

  } catch (e) {
    console.log(e)
    return { error: 'An unexpected error occured during authentication.' }
  }
}


async function checkJwt(idToken: string) {
  // Inject idToken in a header to permit express middleware usage.
  const req: any = { headers: { authorization: `Bearer ${idToken}` } }

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