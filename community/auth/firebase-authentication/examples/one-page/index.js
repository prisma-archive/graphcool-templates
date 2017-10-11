import firebase from "firebase";
import { createApolloFetch } from "apollo-fetch";
import { createNetworkInterface, ApolloClient } from "apollo-client";
import gql from "graphql-tag";
const _ = require("lodash");
require("isomorphic-fetch");

// include your Firebase project's snippet
// as described here:
// https://firebase.google.com/docs/web/setup
//
const firebaseConfig = {
  apiKey: "*********",
  authDomain: "*********"
};

const debugFunctionEndpoint = "http://127.0.0.1:3000/authenticate";
const prodFunctionEndpoint = "*********"; // your lambda endpoint for POST testing
const graphcoolEndpoint = "*********"; // your Graphcool endpoint

firebase.initializeApp(firebaseConfig);

const getProvider = provider => {
  switch (provider) {
    case "google":
      return new firebase.auth.GoogleAuthProvider();
      break;
    case "github":
      return new firebase.auth.GithubAuthProvider();
      break;
  }
};

firebase
  .auth()
  .getRedirectResult()
  .then(function(result) {
    if (result.credential) {
      const user = result.user;
      populateFirebaseUser(user);
    }
  })
  .catch(function(error) {
    const errorCode = error.code;
    const errorMessage = error.message;
    alert(error.code + " : " + error.message);
  });

function authenticateWithProvider(providerName) {
  const provider = getProvider(providerName);
  populateFirebaseUser();
  if (firebase.auth().currentUser) {
    populateFirebaseUser(firebase.auth().currentUser);
    firebase.auth().currentUser.linkWithRedirect(provider);
  } else {
    firebase.auth().signInWithRedirect(provider);
  }
}

function logout() {
  firebase.auth().signOut();
}

function getFirebaseIdToken() {
  populateFirebaseIdToken("loading...");
  const currentUser = firebase.auth().currentUser;
  if (currentUser) {
    const firebaseIdToken = currentUser.getIdToken().then(
      function(token) {
        populateFirebaseIdToken(token);
      },
      function(error) {
        populateFirebaseIdToken("Error: " + error);
      }
    );
  } else {
    populateFirebaseIdToken("Error: not signed in");
  }
}

function getGraphcoolTokenViaPOST(endPoint) {
  populateGraphcoolIdToken("loading...");
  populateGraphcoolExp();
  const firebaseIdToken = _.escape(
    document.getElementById("firebaseIdTokenTextArea").value
  );
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "data/json");
  const reqInit = {
    url: endPoint,
    headers: myHeaders,
    method: "post",
    mode: "cors",
    body: JSON.stringify({
      data: {
        firebaseIdToken: firebaseIdToken
      }
    })
  };

  // all the thens to demonstrate unpacking of the object
  fetch(endPoint, reqInit)
    .then(res => {
      return res.json();
    })
    .then(json => {
      console.log(json);
      return json.data;
    })
    .then(data => {
      console.log(data);
      return JSON.parse(data.wrappedToken);
    })
    .then(wrappedToken => {
      console.log(wrappedToken);
      populateGraphcoolIdToken(wrappedToken.token);
      populateGraphcoolExp(wrappedToken.exp);
      return;
    })
    .catch(error => {
      populateGraphcoolIdToken(error);
    });
}

function getGraphcoolTokenViaGQL() {
  populateGraphcoolIdToken("loading...");
  const firebaseIdToken = _.escape(
    document.getElementById("firebaseIdTokenTextArea").value
  );
  const apolloFetch = createApolloFetch({ uri: graphcoolEndpoint });
  const authenticateFirebaseUser = `
    mutation ($firebaseIdToken: String!) {
      authenticateFirebaseUser(firebaseIdToken: $firebaseIdToken) {
        wrappedToken
      }
    }
  `;
  const variables = { firebaseIdToken: firebaseIdToken };

  apolloFetch({ query: authenticateFirebaseUser, variables: variables })
    .then(res => {
      if (res.errors) {
        var errMessages = "Errors:\n" + res.errors[0].message;
        populateGraphcoolIdToken(errMessages);
      } else if (res.error) {
        populateGraphcoolIdToken(res.error);
      } else {
        const wrappedToken = JSON.parse(res.data.authenticateFirebaseUser.wrappedToken);
        populateGraphcoolIdToken(wrappedToken.token);
        populateGraphcoolExp(wrappedToken.exp);
      }
    })
    .catch(err => {
      populateGraphcoolIdToken(err);
    });
}

function runUserQuery() {
  populateQueriedUser("loading...");
  const graphcoolIdToken = _.escape(
    document.getElementById("graphcoolIdTokenTextArea").value
  );
  const networkInterface = createNetworkInterface({ uri: graphcoolEndpoint });
  networkInterface.use([
    {
      applyMiddleware(request, next) {
        if (!request.options.headers) {
          request.options.headers = {};
        }
        request.options.headers["authorization"] = `Bearer ${graphcoolIdToken}`;
        next();
      }
    }
  ]);

  const apolloClient = new ApolloClient({ networkInterface });
  const userQuery = gql`
    query {
      user {
        id
      }
    }
  `;

  apolloClient
    .query({ query: userQuery })
    .then(data => {
      populateQueriedUser(JSON.stringify(data));
    })
    .catch(err => {
      populateQueriedUser(err);
    });
}

function populateFirebaseUser(user) {
  document.getElementById("firebaseUserName").innerText = user
    ? _.escape(user.displayName)
    : "";
  document.getElementById("firebaseUserEmail").innerText = user
    ? _.escape(user.email)
    : "";
  document.getElementById("firebaseUserEmailVerified").innerText = user
    ? _.escape(user.emailVerified)
    : "";
  document.getElementById("firebaseUserId").innerText = user
    ? _.escape(user.uid)
    : "";
  document.getElementById("firebaseUserAvatar").src = user
    ? user.photoURL
    : "//:0";
  if (user && user.email) {
    firebase.auth().fetchProvidersForEmail(user.email).then(arrProviders => {
      var providersText = "".concat(
        ...arrProviders.map(provider => provider.concat(" "))
      );
      document.getElementById("firebaseUserProvider").innerText = _.escape(
        providersText
      );
    });
  }
}

function populateFirebaseIdToken(token) {
  document.getElementById("firebaseIdTokenTextArea").value = token;
}

function populateGraphcoolIdToken(token) {
  document.getElementById("graphcoolIdTokenTextArea").value = token;
}

function populateGraphcoolExp(exp) {
  if (exp) {
    var myDate = new Date( exp *1000);
    // document.write(myDate.toGMTString()+"<br>"+myDate.toLocaleString());
    document.getElementById("graphcoolTokenExp").innerText = myDate.toLocaleString();
    }
    else {
      document.getElementById("graphcoolTokenExp").innerText = "";
    }
}

function populateQueriedUser(response) {
  document.getElementById("queriedGraphcoolUserTextArea").value = response;
}

window.onload = () => {
  document
    .getElementById("authenticateWithGoogle")
    .addEventListener("click", () => {
      authenticateWithProvider("google");
    });
  document
    .getElementById("authenticateWithGitHub")
    .addEventListener("click", () => {
      authenticateWithProvider("github");
    });
  document
    .getElementById("getFirebaseIdToken")
    .addEventListener("click", getFirebaseIdToken);
  document.getElementById("logout").addEventListener("click", logout);
  document
    .getElementById("testPostFunctionDebug")
    .addEventListener("click", () => {
      getGraphcoolTokenViaPOST(debugFunctionEndpoint);
    });
  document
    .getElementById("testGQL")
    .addEventListener("click", getGraphcoolTokenViaGQL);
  document
    .getElementById("runUserQuery")
    .addEventListener("click", runUserQuery);

  // check for already signed in
  firebase.auth().onAuthStateChanged(() => {
    if (firebase.auth().currentUser) {
      populateFirebaseUser(firebase.auth().currentUser);
    } else {
      populateFirebaseUser();
    }
  });
};
