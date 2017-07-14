# email-user-creation

Create users in your app using email and password, with Schema Extensions and Graphcool Functions ⚡️

> Note: Schema Extensions are currently only available in the Beta Program.

## Getting Started

If you have not already done so, run the following to initialize the graphcool cli and your schema

```sh
npm -g install graphcool
graphcool init --schema email-user-management.graphql
```

## Creation flow in app

1. Your app calls the Graphcool mutation `createEmailUser(email: String!, password: String!)`
2. If no user exists yet that corresponds to the passed `email`, a new `User` node will be created with the password (after being hashed)
3. If a user with the passed `email` exists, a `User` node is not created and an error is returned
4. If a user is created, then the `createEmailUser(email: String!, password: String!)` mutation returns the id for the new user

## Setup the Create User Function

* Create a new Schema Extension Function and paste the schema from `schema-extension.graphql` and code from `email-user-creation.js`.
* add a PAT to the project *called the same as your function*. The token can be obtained from the Authentication tab in the project settings.
* Remove all Create permissions for the `User` type. The function uses a Permanent Access Token to create users via the API so the permissions are not needed.

## Test the Code

Go to the Graphcool Playground:

```sh
graphcool playground
```

Run this mutation to create a user:

```graphql
mutation {
  # replace __EMAIL__ and __PASSWORD__!
  createEmailUser(email: "__EMAIL__", password: "__PASSWORD__") {
    id
  }
}
```

You should see that a new user has been created. The returned id can be used to query your Graphcool API for that user. Note that running the mutation again with the same email will return an error stating that the email is already in use.


