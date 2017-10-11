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
      const graphcoolUser = Object.assign({
        family_name: '',
        given_name: '',
      }, auth0User);

      return this.api.request(`
        mutation {
          createUser(
            auth0UserId:"${graphcoolUser.user_id}"
            name: "${graphcoolUser.name}"
            familyName: "${graphcoolUser.family_name}"
            givenName: "${graphcoolUser.given_name}"
            picture: "${graphcoolUser.picture}"
            email: "${graphcoolUser.email}"
            emailVerified: ${graphcoolUser.email_verified}
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
