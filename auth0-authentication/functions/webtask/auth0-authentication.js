'use latest';

import express from 'express';
import cors from 'cors';
import { fromExpress } from 'webtask-tools';
import bodyParser from 'body-parser';
import fetch from 'isomorphic-fetch';
import jwksRsa from 'jwks-rsa';
import jwt from 'express-jwt';
import { fromEvent } from 'graphcool-lib';

// Graphcool service
function GraphcoolService(req) {
  this.graphcool = fromEvent(req.body);
  this.api = this.graphcool.api('simple/v1');
}

GraphcoolService.prototype.getOrCreateGraphcoolUser = function (req, userId, auth0AccessToken) {
  return this.getGraphcoolUser(userId)
    .then(graphcoolUser => {
      if (graphcoolUser === null) {
        return this.createGraphcoolUser(req, auth0AccessToken);
      } else {
        return graphcoolUser.id;
      }
    })
}

GraphcoolService.prototype.getGraphcoolUser = function (userId) {
  return this.api.request(`
    query {
      User(auth0UserId: "${userId}"){
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

GraphcoolService.prototype.createGraphcoolUser = function (req, auth0AccessToken) {

  this.fetchAuth0UserProfile(req, auth0AccessToken)
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
          ){
            id
          }
        }`)
        .then((userMutationResult) => {
          return userMutationResult.createUser.id
        })
    })
}

GraphcoolService.prototype.fetchAuth0UserProfile = function (req, auth0AccessToken) {
  const profileUrl = `https://${req.webtaskContext.secrets.AUTH0_DOMAIN}/userinfo?access_token=${auth0AccessToken}`;

  return fetch(profileUrl)
    .then(response => response.json())
}

GraphcoolService.prototype.generateGraphcoolToken = function (graphcoolUserId) {
  return this.graphcool.generateAuthToken(graphcoolUserId, 'User')
}

// Express
const app = express();
app.use(cors());
app.use(bodyParser.json());

// all routes will check the JWT
app.use((req, res, next) => {
  const issuer = `https://${req.webtaskContext.secrets.AUTH0_DOMAIN}/`;

  jwt({
    secret: jwksRsa.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: `${issuer}.well-known/jwks.json`
    }),
    audience: req.webtaskContext.secrets.AUTH0_CLIENT_ID,
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

  graphcoolService.getOrCreateGraphcoolUser(req, userId, auth0AccessToken)
    .then(graphcoolUserId => graphcoolService.generateGraphcoolToken(graphcoolUserId))
    .then(token => res.json({ data: { token: token } }))
    .catch(err => {
      console.log(err);
      return res.status(400).json('Error when fetching userinfo')
    });
});

module.exports = fromExpress(app);
