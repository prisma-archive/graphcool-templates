/**
 * Basic test
 * 1. run `npm run build:watch`
 * 2. run `node dist/test.js`
 */

import auth0Auth from "./auth0Authentication";

process.env.AUTH0_DOMAIN = "{domain}"
process.env.AUTH0_AUDIENCE = "{aud}"

// From `/demo` localstorage
const idToken = "{idToken}"
const graphcool = {
  // From graph.cool console/settings
  projectId: "{projectId}",
  rootToken: "{rootToken}"
}

const event: any = {
  data: { idToken },
  context: {
    graphcool
  }
}

auth0Auth(event).then(console.log).catch(console.error);