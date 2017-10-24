const isomorphicFetch = require('isomorphic-fetch');
const jwt = require('jsonwebtoken');
const fromEvent = require('graphcool-lib').fromEvent;

const verifyToken = (token, secretOrPublicKey) =>
  new Promise((resolve, reject) =>
    jwt.verify(token, secretOrPublicKey, (err, decoded) => {
      if (err) return reject(err);
      return resolve(decoded.sub);
    })
  );

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
  const secretOrPublicKey = process.env.AUTH0_CLIENT_ID || process.env.AUTH0_SECRET;

  if (!secretOrPublicKey || !process.env.AUTH0_DOMAIN) {
    console.error('Please provide a valid client id or secret and a domain!')
    return { error: 'Auth0 Authentication not configured correctly.' }
  }

  const { accessToken, idToken } = event.data;

  const graphcool = fromEvent(event);
  const api = graphcool.api('simple/v1');

  return verifyToken(idToken, secretOrPublicKey);
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
