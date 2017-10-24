function displayAuthResults(idToken) {
  var el = document.getElementById('mutation');
  el.style.visibility = 'visible';
  var mutation = `
  # Run this mutation in the Graphcool Playground to authenticate a user

  mutation {
    authenticateUser(
      idToken: "${idToken}"
    ) {
      token
    }
  }
  `;
  el.innerHTML = mutation;
}

//Replace __CLIENT_ID__ and __AUTH0_DOMAIN__ with your Auth0 ClientId and Domain
var lock = new Auth0Lock('__CLIENT_ID__', '__AUTH0_DOMAIN__', {
  container: 'lock',
  auth: {
    redirect: true,
    redirectUrl: 'http://localhost:8080',
    responseType: 'token'
  }
});

lock.show();

lock.on('authenticated', function(authResult) {
  displayAuthResults(authResult.idToken);
});
