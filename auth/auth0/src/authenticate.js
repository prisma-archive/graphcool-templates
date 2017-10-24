const isomorphicFetch = require('isomorphic-fetch');
const jwt = require('jsonwebtoken');
const jwkRsa = require('jwks-rsa');
const fromEvent = require('graphcool-lib').fromEvent;

const verifyToken = token =>
  new Promise((resolve, reject) => {
    //First let's decode the token
    try {
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
        if (err) return reject(err);
        //If the JWT Token was valid, we now can verify its validity with our signingKey
        const signingKey = key.publicKey || key.rsaPublicKey;
        jwt.verify(
          token,
          signingKey,
          { algorithms: ['RS256'] },
          (err, decoded) => {
            if (err) return reject(err);
            return resolve(decoded.sub);
          }
        );
      });
    } catch (err) {
      return reject(err);
    }
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

module.exports = event => {
  if (!process.env.AUTH0_DOMAIN) {
    console.error('Please provide a valid domain!');
    return { error: 'Auth0 Authentication not configured correctly.' };
  }

  const { accessToken, idToken } = event.data;

  const graphcool = fromEvent(event);
  const api = graphcool.api('simple/v1');

  return verifyToken(idToken)
    .then(auth0UserId => getGraphcoolUser(auth0UserId, api))
    .then(graphCoolUser => {
      if (graphCoolUser === null) {
        return fetchAuth0Profile(accessToken).then(auth0Profile =>
          createGraphCoolUser(auth0Profile, api)
        );
      }
      return Promise.resolve(graphCoolUser);
    })
    .then(graphCoolUser =>
      graphcool.generateAuthToken(graphCoolUser.id, 'User')
    )
    .then(token => {
      return { data: { token } };
    })
    .catch(error => {
      console.error(`Error: ${JSON.stringify(error)}`);
      return { error: 'An unexpected error occured' };
    });
};
