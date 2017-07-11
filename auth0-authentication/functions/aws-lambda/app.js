const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')
const fetch = require('isomorphic-fetch');
const jwksRsa = require('jwks-rsa');
const jwt = require('express-jwt');
const GraphcoolClient = require('./services/GraphcoolClient');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// all routes will check the JWT
app.use((req, res, next) => {
  const issuer = `https://${process.env.AUTH0_DOMAIN}/`;

  jwt({
    secret: jwksRsa.expressJwtSecret({ jwksUri: `${issuer}.well-known/jwks.json` }),
    audience: process.env.AUTH0_CLIENT_ID,
    issuer: issuer,
    algorithms: ['RS256'],
    getToken: function (req) { // pull Auth0 idToken out from body data
      if (req.body.data && req.body.data.idToken) {
        return req.body.data.idToken;
      }
      return null;
    }
  })(req, res, next);
});

// endpoint authenticated with JWT
app.post('/authenticate', (req, res) => {
  const graphcoolClient = new GraphcoolClient(req);
  const profileUrl = `https://${process.env.AUTH0_DOMAIN}/userinfo?access_token=${req.body.data.accessToken}`;

  fetch(profileUrl)
    .then(response => response.json())
    .then(auth0User => {
      return graphcoolClient.getGraphcoolUser(auth0User)
      .then(graphcoolUser => {
        if (graphcoolUser === null) {
          return graphcoolClient.createGraphcoolUser(auth0User);
        } else {
          return graphcoolUser.id;
        }
      })      
    })
    .then(graphcoolUserId => graphcoolClient.generateGraphcoolToken(graphcoolUserId))
    .then(token => res.json({ data: { token: token } }))
    .catch(err => {
      console.log(err); 
      return res.status(400).json('Error when fetching userinfo')
    });
});

module.exports = app;