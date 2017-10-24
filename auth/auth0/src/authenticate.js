const isomorphicFetch = require('isomorphic-fetch');
const jwt = require('jsonwebtoken');
const jwkRsa = require('jwks-rsa');
const fromEvent = require('graphcool-lib').fromEvent;


const verifyToken = token =>
  new Promise(resolve => {
    //First let's decode the token
    const decoded = jwt.decode(token, { complete: true });
    if (!decoded || !decoded.header || !decoded.header.kid) {
      throw new Error('Unable to retrieve key identifier from token');
    }
    // Then retrieve the JKWS using the key identifier from our decode token
    const jkwsClient = jwkRsa({
      cache: true,
      jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
    });
    jkwsClient.getSigningKey(decoded.header.kid, (err, key) => {
      if (err) throw new Error(err);
      //If the JWT Token was valid, we now can verify its validity with our signingKey
      const signingKey = key.publicKey || key.rsaPublicKey;
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

const fetchAuth0Profile = accessToken =>
  fetch(
    `https://${process.env.AUTH0_DOMAIN}/userinfo?access_token=${accessToken}`
  )
    .then(response => response.json())
    .then(json => json);

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
    }`
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
