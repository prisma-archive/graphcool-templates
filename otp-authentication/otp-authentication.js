'use latest'
const express       = require('express');
const Webtask       = require('webtask-tools');
const { fromEvent } = require('graphcool-lib');
const bodyParser    = require('body-parser');
const stream        = require('stream');
const base32        = require('thirty-two');
const crypto        = require('crypto');
const request       = require('request');
const speakeasy     = require('speakeasy');
const qr            = require('node-qr-image');
const EasyPbkdf2    = require('easy-pbkdf2');

const app = express();

app.use(bodyParser.json());

// Add graphcool api client object to req
app.use((req, res, next) => {
  if (req.body.context.graphcool) {
    req.gc = fromEvent(req.body)
  };
  next()
});

app.post('/registerUser', (req,res) => {
  // { data: { email: "...", password: "..." } }
  var easyPbkdf2 = new EasyPbkdf2({"DEFAULT_HASH_ITERATIONS": 10000});
  var salt = easyPbkdf2.generateSalt(); // `salt` should be treated as opaque, as it captures iterations
  var password = req.body.data.password;
  easyPbkdf2.secureHash(password, salt, (err, passwordHash, originalSalt) => {
    const concatPassword = `${originalSalt}.${passwordHash}`
    req.gc.api('simple/v1')
      .request(
        `mutation ($email: String!, $password: String!) { createUser(email: $email, password: $password) { id } }`,
        { email: req.body.data.email, password: concatPassword })
      .then(data => {
        res.json({data: { id: data.createUser.id }})
      })
      .catch(err => res.json({error: err}))
    });
})

app.post('/authenticateUser', (req,res) => {
  // { data: { email: "...", password: "..." } }
  // { data: { email: "...", password: "...", code: "..." } }
  req.gc.api('simple/v1')
    .request(
      `query ($email: String!) { User(email: $email) { id password isOtpEnabled otpSecret } }`,
      { email: req.body.data.email })
    .then(data => {
      const passwordComponents = data.User.password.split('.')
      const salt = `${passwordComponents[0]}.${passwordComponents[1]}`
      const passwordHash = passwordComponents[2]

      var easyPbkdf2 = new EasyPbkdf2({"DEFAULT_HASH_ITERATIONS": 10000});
      easyPbkdf2.verify(salt, passwordHash, req.body.data.password, (err, valid) => {
        if (err) res.json({error: err})
        if (valid) {
          if (data.User.isOtpEnabled) {
            if (!req.body.data.code) {
                res.json({data: { preAuthenticated: true }})
            }
            else {
              const verified = verifyToken(data.User.otpSecret, req.body.data.code.split(/[\\(\\)]/g)[1])
              if (verified) {
                req.gc.generateAuthToken(data.User.id, "User").then(token => {
                  res.json({data: { token: token }})
                })
              }
              else {
                res.json({error: "OTP Authentication failed"})
              }
            }
          }
          else {
            req.gc.generateAuthToken(data.User.id, "User").then(token => {
              res.json({data: { token: token }})
            })
          }
        }
        else {
          res.json({error: "Authentication failed"})
        }
      });
    })
    .catch(err => res.json({error: err}))
});

app.post('/registerOtp', (req, res) => {
  // { data: { userId: "...", secret: "..." } }
  // { data: { userId: "..." } }
  req.gc.api('simple/v1')
    .request(
      `query ($userId: ID!) { User(id: $userId) { id email isOtpEnabled } }`,
      { userId: req.body.data.userId })
    .then(data => {
      // Validate user
      validateUserForRegistration(data.User, res)

      // Generate new secret if not provided
      let secret = req.body.data.secret || speakeasy.generateSecret({length: 20}).base32

      // Retrieve issuer from webtask secrets
      const issuer = req.header('X-OTP-Issuer')

      // Generate Key Uri for QR code
      const uri = speakeasy.otpauthURL({ secret: secret, label: data.User.email, issuer: issuer, encoding: 'base32' });

      // Upload QR Code image to File API, using chunked encoding,
      // because the QR Code is streamed from the qrCodeRequest
      request.post({
        url: 'https://api.graph.cool/file/v1/cj5g2p41dqlam01276n61qwsv',
        headers: { 'Accept': 'application/json', 'transfer-encoding': 'chunked' },
        formData: { 'data': { value: qr.image(uri, { type: 'png', size: 400 }), options: { filename: `${secret}.png`, contentType: 'image/png'} } }
      }, (err, httpResponse, body) => {
        // Get image url and id from response
        const {url: qrUrl, id: fileId } = JSON.parse(body)

        // Update user
        req.gc.api('simple/v1')
          .request(
            `mutation ($userId: ID!, $secret: String!, $fileId: ID!) { updateUser(id: $userId, otpSecret: $secret, qrImageId: $fileId) { id }}`,
            { userId: data.User.id, secret, fileId })
          .then(data => {
            // Format secret into readable format for manual entry
            const formattedSecret = secret.replace(/(.{4})/g, '$1 ').trim()

            // Send response back to Graphcool as RegisterOtpPayload
            res.json({ data: { secret: formattedSecret, uri, qrUrl }})
          })
          .catch(err => res.json({ error: err }))
      })
    })
    .catch(err => res.json({ error: err}))
});

app.post('/initializeOtp', function (req, res) {
  // { data: { userId: "...", code: "..." } }
  req.gc.api('simple/v1')
    .request(
      `query ($userId: ID!) { User(id: $userId) { id otpSecret isOtpEnabled } }`,
      { userId: req.body.data.userId })
    .then(data => {
      // Validate user
      validateUserForInitialization(data.User, res)

      // Verify OTP code
      const verified = verifyToken(data.User.otpSecret, req.body.data.code)

      if (verified)
      {
        // Enable OTP for user
        req.gc.api('simple/v1')
          .request(
            `mutation($userId: ID!) { updateUser(id: $userId, isOtpEnabled: true) { id }}`,
            { userId: data.User.id })
          .then(data =>
            res.json({data: { success: true }})
          )
          .catch(err => res.json({ error: err }))
      }
      else {
        res.json({ error: "Code verification failed"})
      }
    })
    .catch(err => res.json({ error: err }))
});

module.exports = Webtask.fromExpress(app);

function validateUserForInitialization(user, res) {
  validateUserForRegistration(user, res)
  if (!user.otpSecret) res.json({ error: `User '${user.id}' not registered for OTP`})
}

function validateUserForRegistration(user, res) {
  if (user == null) res.json({ error: `User '${user.id}' not found` })
  if (user.isOtpEnabled) res.json({ error: `OTP already enabled for user '${user.id}'`})
}

function verifyToken(secret, code) {
  return speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: code
  });
}
