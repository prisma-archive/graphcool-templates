const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')
const jwksRsa = require('jwks-rsa');
const jwt = require('express-jwt');
const GraphcoolService = require('./services/GraphcoolService');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// all routes will check the JWT
app.use((req, res, next) => {
  const issuer = `https://${process.env.AUTH0_DOMAIN}/`;

  jwt({
    secret: jwksRsa.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: `${issuer}.well-known/jwks.json`
    }),
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
  const graphcoolService = new GraphcoolService(req);

  if (!req.user) {
    return res.status(400).json("No user data in request");
  }

  if (!req.body.data.accessToken) {
    return res.status(400).json("Missing Auth0 access token");
  }

  const userId = req.user.sub;
  const auth0AccessToken = req.body.data.accessToken;

  graphcoolService.getOrCreateGraphcoolUser(userId, auth0AccessToken)
    .then(graphcoolUserId => graphcoolService.generateGraphcoolToken(graphcoolUserId))
    .then(token => res.json({ data: { token: token } }))
    .catch(err => {
      console.log(err);
      return res.status(400).json('Error when fetching userinfo')
    });
});

module.exports = app;