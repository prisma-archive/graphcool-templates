'use strict';

const awsServerlessExpress = require('aws-serverless-express')
const app = require('./app')

const server = awsServerlessExpress.createServer(app)

module.exports.auth0Authentication = (event, context) => awsServerlessExpress.proxy(server, event, context);
