const fromEvent = require('graphcool-lib').fromEvent;

function GraphcoolClient(req) {
  this.graphcool = fromEvent(req.body);
  this.api = this.graphcool.api('simple/v1');
}

GraphcoolClient.prototype.getGraphcoolUser = function(user) {
  return this.api.request(`
  query {
    User(auth0UserId: "${user.id}"){
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

GraphcoolClient.prototype.createGraphcoolUser = function(user) {
  return this.api.request(`
  mutation {
    createUser(
      auth0UserId:"${user.user_id}"
      name: "${user.name}"
      nickname: "${user.nickname}"
      picture: "${user.picture}"
    ){
      id
    }
  }`)
  .then((userMutationResult) => {
    return userMutationResult.createUser.id
  })
}

GraphcoolClient.prototype.generateGraphcoolToken = function(graphcoolUserId) {
  return this.graphcool.generateAuthToken(graphcoolUserId, 'User')
}

module.exports = GraphcoolClient;