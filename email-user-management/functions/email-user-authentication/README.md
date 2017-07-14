# email-user-authentication

Authenticate users in your app using email and password, with Schema Extensions and Graphcool Functions ⚡️

> Note: Schema Extensions are currently only available in the Beta Program.

## Getting Started

If you have not already done so, run the following to initialize the graphcool cli and your schema

```sh
npm -g install graphcool
graphcool init --schema email-user-management.graphql
```

## Authentication flow in app

1. Your app calls the Graphcool mutation `authenticateEmailUser(email: String!, password: String!)`
2. If no user exists yet that corresponds to the passed `email`, or the `password` does not match, an error will be returned
3. If a user with the passed `email` exists and the `password` matches, the mutation returns a valid token for the user
4. Your app stores the token and uses it in its `Authorization` header for all further requests to Graphcool

## Setup the Authentication Function

* Create a new Schema Extension Function and paste the schema from `schema-extension.graphql` and code from `email-user-authentication.js`.
* add a PAT to the project *called the same as your function*. The token can be obtained from the Authentication tab in the project settings.
* Remove Read permissions for the `User` email/password types. The function uses a Permanent Access Token to query users via the API so the permissions are not needed.

## Test the Code

Go to the Graphcool Playground:

```sh
graphcool playground
```

Run this mutation to authenticate a user:

```graphql
mutation {
  # replace __EMAIL__ and __PASSWORD__!
  authenticateEmailUser(email: "__EMAIL__", password: "__PASSWORD__") {
    token
  }
}
```

If the email/password combo are valid you should see that it returns a token. The returned token can be used to authenticate requests to your Graphcool API as that user.


