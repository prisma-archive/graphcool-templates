const fromEvent = require('graphcool-lib').fromEvent;

function GraphcoolClient(req) {
  this.graphcool = fromEvent(req.body);
  this.api = this.graphcool.api('simple/v1');
}

GraphcoolClient.prototype.getGraphcoolUser = function (user) {
  return this.api.request(`
  query {
    User(auth0UserId: "${user.user_id}"){
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

GraphcoolClient.prototype.createGraphcoolUser = function (user) {

  const graphcoolUser = Object.assign({
    family_name: '',
    given_name: '',
  }, user);

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
    ){
      id
    }
  }`)
    .then((userMutationResult) => {
      return userMutationResult.createUser.id
    })
}

GraphcoolClient.prototype.generateGraphcoolToken = function (graphcoolUserId) {
  return this.graphcool.generateAuthToken(graphcoolUserId, 'User')
}

module.exports = GraphcoolClient;