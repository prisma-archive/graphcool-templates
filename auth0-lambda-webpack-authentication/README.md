# auth0-lambda-webpack-authentication

Create Auth0 users and sign in with Schema Extensions and Graphcool Functions ⚡️

## Introduction

This is very similar to the approach taken in the [auth0-authentication](../auth0-authentication) example. This example focuses purely on the AWS Lambda implementation, offering an alternative that may suit some people. If you prefer this method, follow the implementation process defined in the other example but replace the Lambda function with this one.

This example differs in a few ways:

- Express is not used. Instead, this Lambda function reduces dependencies by using AWS API Gateway directly. 
- Webpack is added, allowing support for ES6+ features, like async/await. [`babel-preset-env`](https://github.com/babel/babel-preset-env) and [Babili](https://github.com/babel/babili) are used to reduce the amount of parsing that is actually required and minify our ES6 code, respectively.
- Token validation happens within the Lambda function, reducing the calls made to Auth0. This requires you to configure a signing certificate, detailed below.
- ESLint and Prettier are used because, well, we're not animals, right?!
- You can run the function locally by running `yarn start`.
- Deploy the function (once AWS is set up) using `yarn build`.

## Getting your PEM Key for Auth0 token validation
This is perhaps the most significant change in this example. You will need your signing certificate from Auth0, which can be found by logging into your Auth0 account and navigating to Clients > [Your Client] > Settings > 'Show Advanced Settings' (at the bottom of the page) > Certificates. Create a new file in the root directory called 'cert.pem' and copy your signing certificate there. This is included in the webpack bundling stage (see `webpack.config.js` for more). This will then be used to decrypt your token in the Lambda function at runtime.

## Environment Variables
Rename `env.dev.yml.template` to `env.dev.yml` and then set your Auth0 domain and clientId.

## Test Locally
You can run the function locally by running `yarn start`. Open Postman (or whatever method you use for testing HTTP requests) and send a POST request to http://localhost:3000/auth with `Content-Type` set to `application/json` and a body payload of:

```
{
  "data": {
    "idToken":"YOUR_ID_TOKEN",
    "accessToken":"YOUR_ACCESS_TOKEN"
  }
}

```
## Deployment
To deploy the function, ensure you have your AWS credentials configured. Then, simply run `yarn build` and the Serverless framework will automatically package and deploy your Lambda function.