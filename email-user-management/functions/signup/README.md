# email-user-creation

Signup new users in your app using email and password and receive a token in return.

## Signup flow in app

1. Your app calls the Graphcool mutation `signupEmailUser(email: String!, password: String!)`
2. If no user exists yet that corresponds to the passed `email`, a new `User` node will be created with the password (after being hashed and salted)
3. If a user with the passed `email` exists, a `User` node is not created and an error is returned
4. If a user is created, then the `singupEmailUser(email: String!, password: String!)` mutation returns the id for the new user

## Setup the Create User Function

* Create a new Schema Extension Function and paste the schema from `schema-extension.graphql` and code from `signup.js`.
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
  # replace __EMAIL__ and __PASSWORD__
  signupEmailUser(email: "__EMAIL__", password: "__PASSWORD__") {
    id
  }
}
```

You should see that a new user has been created. The returned id can be used to query your Graphcool API for that user. Note that running the mutation again with the same email will return an error stating that the email is already in use.
