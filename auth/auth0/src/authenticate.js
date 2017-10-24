const isomorphicFetch = require('isomorphic-fetch');
const jwt = require('jsonwebtoken');
const jwkRsa = require('jwks-rsa');
const fromEvent = require('graphcool-lib').fromEvent;

//Validates the request JWT token
const verifyToken = token =>
  new Promise(resolve => {
    //Decode the JWT Token
    const decoded = jwt.decode(token, { complete: true });
    if (!decoded || !decoded.header || !decoded.header.kid) {
      throw new Error('Unable to retrieve key identifier from token');
    } 
    const jkwsClient = jwkRsa({
      cache: true,
      jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
    });
     //Retrieve the JKWS's signing key using the decode token's key identifier (kid)
    jkwsClient.getSigningKey(decoded.header.kid, (err, key) => {
      if (err) throw new Error(err);
      const signingKey = key.publicKey || key.rsaPublicKey;
      //If the JWT Token was valid, verify its validity against the JKWS's signing key
      jwt.verify(
        token,
        signingKey,
        { algorithms: ['RS256'] },
        (err, decoded) => {
          if (err) throw new Error(err);
          return resolve(decoded.sub);
        }
      );
    });
  });

//Retrieves the Graphcool user record using the Auth0 user id
const getGraphcoolUser = (auth0UserId, api) =>
  api
    .request(
      `
        query {
          User(auth0UserId: "${auth0UserId}"){
            id
          }
        }
      `
    )
    .then(queryResult => queryResult.User);

//Fetches the user's Auth0 profile
const fetchAuth0Profile = accessToken =>
  fetch(
    `https://${process.env.AUTH0_DOMAIN}/userinfo?access_token=${accessToken}`
  )
    .then(response => response.json())
    .then(json => json);

//Creates a new User record. It is possible to save more information from Auth0 here, email profile, name ...
//by destructuring the first parameter and adding them to the mutation.
//More info about the user info obkect here : https://auth0.com/docs/api/authentication#get-user-info
const createGraphCoolUser = ({ user_id }, api) =>
  api
    .request(
      `
        mutation {
          createUser(
            auth0UserId:"${user_id}"
          ){
            id
          }
        }
      `
    )
    .then(queryResult => queryResult.createUser);

export default async event => {
  try {
    if (!process.env.AUTH0_DOMAIN) {
      throw new Error('Missing AUTH0_DOMAIN environment variable');
    }
    const { accessToken, idToken } = event.data;

    const auth0UserId = await verifyToken(idToken);
    const graphcool = fromEvent(event);
    const api = graphcool.api('simple/v1');

    let graphCoolUser = null;

    graphCoolUser = await getGraphcoolUser(auth0UserId, api);
    //If the user doesn't exist. a new record is created.
    if (graphCoolUser === null) {
      const auth0Profile = await fetchAuth0Profile(accessToken);
      graphCoolUser = await createGraphCoolUser(auth0Profile, api);
    }
    const token = await graphcool.generateAuthToken(graphCoolUser.id, 'User');

    return { data: { id: graphCoolUser.id, token } };
  } catch (err) {
    console.log(err);
    return { error: 'An unexpected error occured' };
  }
};
