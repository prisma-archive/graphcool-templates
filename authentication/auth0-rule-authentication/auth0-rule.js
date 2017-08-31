function (user, context, callback) {
  var pat = `${context.clientMetadata.GRAPHCOOL_PAT1}.${context.clientMetadata.GRAPHCOOL_PAT2}.${context.clientMetadata.GRAPHCOOL_PAT3}`;
  var projectId = context.clientMetadata.GRAPHCOOL_PROJECTID;

  var request = require('request');

  var auth0UserId = user.user_id;
  
  var getUserQuery = `query { User(auth0UserId: "${auth0UserId}") { id } }`

  request
    .post({ url: `https://api.graph.cool/simple/v1/${projectId}`,
            body: JSON.stringify({ query: getUserQuery }),
            headers: { 'Content-Type': 'application/json'} },
      function(err,resp,body) {
        var result = JSON.parse(body);

        if (result.data.User == null)
        {
          // Create user
          createUser(auth0UserId, getAuthToken);
        }
        else
        {
          getAuthToken(result.data.User.id);
        }
      });

  function getAuthToken(graphcoolUserId)
  {
    generateAuthToken(graphcoolUserId, function(token) {
      context.idToken['https://graph.cool/token'] = token;
      callback(null, user, context);
    });
  }

  function createUser(auth0UserId, cb)
  {
    var createUserMutation = `
      mutation { createUser(auth0UserId: "${auth0UserId}") { id } }`

    return request
      .post({ url: `https://api.graph.cool/simple/v1/${projectId}`,
            body: JSON.stringify({ query: createUserMutation }),
            headers: { 'Content-Type': 'application/json'} },
      function(err,resp,body) {
        cb(JSON.parse(body).data.createUser.id);
      });
  }

  function generateAuthToken(userId, cb)
  {
    var generateTokenMutation = `
      mutation {
        generateUserToken(input:{
          pat:"${pat}", projectId:"${projectId}",
          userId:"${userId}", modelName:"User",
          clientMutationId:"static"
        }) { token }
      }`

    return request
      .post({ url: 'https://api.graph.cool/system',
            body: JSON.stringify({ query: generateTokenMutation }),
            headers: { 'Content-Type': 'application/json'} },
      function(err,resp,body) {
        cb(JSON.parse(body).data.generateUserToken.token);
      });
  }
}
