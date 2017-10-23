import { fromEvent, FunctionEvent } from 'graphcool-lib'
import { GraphQLClient } from 'graphql-request'

// Read Auth0 credentials from environment variables
const auth0 = {
 domain: process.env.AUTH0_DOMAIN,
 clientId: process.env.AUTH0_CLIENT_ID,
 clientSecret: process.env.AUTH0_CLIENT_SECRET
}

export default async (event: FunctionEvent<EventData>) => {
  console.log(event)

  // TODO Awesome code here \o/
}