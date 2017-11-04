function displayAuthResults(accessToken) {
  var el = document.getElementById('mutation');
  el.style.visibility = 'visible';
  var mutation = `
  # Run this mutation in the Graphcool Playground to authenticate a user

  mutation {
    authenticateUser(
      accessToken: "${accessToken}"
    ) {
      id
      token
    }
  }
  `;
  el.innerHTML = mutation;
}

//Replace __AUTH0_CLIENT_ID__, __AUTH0_DOMAIN__ and __AUTH0_AUDIENCE__ with your Auth0 ClientId and Domain
document.addEventListener('DOMContentLoaded', function(event) {
  var webAuth = new auth0.WebAuth({
    audience: '__AUTH0_AUDIENCE__',
    clientID: '__AUTH0_CLIENT_ID__',
    domain: '__AUTH0_DOMAIN__',
    redirectUri: 'http://localhost:8080',
    responseType: 'token',
    scope: 'openid email'
  });

  var elButton = document.getElementById('authenticate');
  elButton.addEventListener('click', function() {
    webAuth.authorize();
  });

  webAuth.parseHash(function(err, authResult) {
    if (err) return console.error(err);
    if (authResult && authResult.accessToken) {
      window.location.hash = '';
      displayAuthResults(authResult.accessToken);
    }
    console.log(authResult);
  });
});
