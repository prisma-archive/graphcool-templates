# authenticate

Authenticate users in your app using email and password and receive a token in return.

## Authentication flow in app

1. Your app calls the Graphcool mutation `authenticateEmailUser(email: String!, password: String!)`
2. If no user exists yet that corresponds to the passed `email`, or the `password` does not match, an error will be returned
3. If a user with the passed `email` exists and the `password` matches, the mutation returns a valid token for the user
4. Your app stores the token and uses it in its `Authorization` header for all further requests to Graphcool

## Setup the Authentication Function

* Create a new Schema Extension Function and paste the schema from `schema-extension.graphql` and code from `authenticate.js`.
* add a PAT to the project *called the same as your function*. The token can be obtained from the Authentication tab in the project settings.

## Test the Code

First, you need to create a new user with the `signup` function. Then, go to the Graphcool Playground:

```sh
graphcool playground
```

and run this mutation to authenticate as that user:

```graphql
mutation {
  # replace __EMAIL__ and __PASSWORD__
  authenticateEmailUser(email: "__EMAIL__", password: "__PASSWORD__") {
    token
  }
}
```

If the email/password combo are valid you should see that it returns a token. The returned token can be used to authenticate requests to your Graphcool API as that user.
