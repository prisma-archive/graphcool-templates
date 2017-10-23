const isomorphicFetch = require('isomorphic-fetch');
const jwt = require('jsonwebtoken');
const fromEvent = require('graphcool-lib').fromEvent;

const logger = message => (process.env.DEBUG === true ? logger(message) : null);

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

const createGraphCoolUser = ({ email }, api) => {
  return api
    .request(
      `
    mutation {
      createUser(
        auth0UserId:"${user_id}"
        email: "${email}"
      ){
        id
      }
    }
  `
    )
    .then(queryResult => queryResult.createUser);
};

module.exports = event => {
  const { accessToken, idToken } = event.data;
  //TODO Check if Token is R256 or H256 and pass the correct encryption param to the verify method below
  const { sub: auth0UserId } = jwt.verify(idToken, process.env.AUTH0_SECRET);

  const graphcool = fromEvent(event);
  const api = graphcool.api('simple/v1');

  return getGraphcoolUser(auth0UserId, api)
    .then(graphCoolUser => {
      if (graphCoolUser === null) {
        return fetchAuth0Profile(accessToken).then(auth0Profile =>
          createGraphCoolUser(auth0Profile, api)
        );
      }
      return Promise.resolve(graphCoolUser);
    })
    .then(graphCoolUser =>
      graphcool.generateAuthToken(graphCoolUser.id, 'Auth0User')
    )
    .then(token => {
      return { data: { token } };
    })
    .catch(error => {
      console.log(`Error: ${JSON.stringify(error)}`);
      return { error: 'An unexpected error occured' };
    });
};
