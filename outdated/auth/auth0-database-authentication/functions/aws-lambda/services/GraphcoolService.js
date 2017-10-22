const fromEvent = require('graphcool-lib').fromEvent;
const fetch = require('isomorphic-fetch');

function GraphcoolService(req) {
  this.graphcool = fromEvent(req.body);
  this.api = this.graphcool.api('simple/v1');
}

GraphcoolService.prototype.getOrCreateGraphcoolUser = function (userId, auth0AccessToken) {
  return this.getGraphcoolUser(userId)
    .then(graphcoolUser => {
      if (graphcoolUser === null) {
        return this.createGraphcoolUser(auth0AccessToken);
      } else {
        return graphcoolUser.id;
      }
    })
}

GraphcoolService.prototype.getGraphcoolUser = function (userId) {
  return this.api.request(`
    query {
      User(auth0UserId: "${userId}") {
        id
      }
    }`)
    .then((userQueryResult) => {
      if (userQueryResult.error) {
        return Promise.reject(userQueryResult.error)
      } else {
        return userQueryResult.User
      }
    })
}

GraphcoolService.prototype.createGraphcoolUser = function (auth0AccessToken) {

  this.fetchAuth0UserProfile(auth0AccessToken)
    .then(auth0User => {
      /*
        The Auth0 response for profiles using a token from the oAuth endpoint
        can look different than those from the lock mechanism. This has to do
        with the main source of connection using to authenticate.

        In our example we're assuming you're authenticating against either
        the default or custom database option which will yield a payload
        like:

        {
          "sub": "auth0|id",
          "name": string,
          "nickname": string,
          "picture": string,
          "updated_at": DateString
        }

        Your implementation might contain different fields to use in the
        mutation below. However the important part is storing the unique
        auth0| id within our GraphCool instance.
      */

      return this.api.request(`
        mutation {
          createUser(
            auth0UserId: "${auth0User.sub}"
            email: "${auth0User.name}"
            picture: "${auth0User.picture}"
          ) {
            id
          }
        }`)
        .then((userMutationResult) => {
          return userMutationResult.createUser.id
        })
    })
}

GraphcoolService.prototype.fetchAuth0UserProfile = function (auth0AccessToken) {
  const profileUrl = `https://${process.env.AUTH0_DOMAIN}/userinfo?access_token=${auth0AccessToken}`;

  return fetch(profileUrl)
    .then(response => response.json())
}

GraphcoolService.prototype.generateGraphcoolToken = function (graphcoolUserId) {
  return this.graphcool.generateAuthToken(graphcoolUserId, 'User')
}

module.exports = GraphcoolService;
