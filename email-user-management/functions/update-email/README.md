# update-email

Update the email for users in your app who login using email and password, with Schema Extensions and Graphcool Functions ⚡️

> Note: Schema Extensions are currently only available in the Beta Program.

## Getting Started

If you have not already done so, run the following to initialize the graphcool cli and your schema

```sh
npm -g install graphcool
graphcool init --schema email-user-management.graphql
```

## Update email flow in app

1. Your app calls the Graphcool mutation `updateUserEmail(email: String!, newEmail: String!, password: String!)`
2. If `newEmail` passed is not a valid format, an error is returned
3. If a user with the passed `email` is not found, an error is returned
4. If a user is found, the password is tested. If the credentials are invalid, an error is returned
5. If a user with the passed `email` exists and the `password` matches, the user's `email` field is updated to the new email
6. The mutation returns a valid token for the user
7. Your app stores the token and uses it in its `Authorization` header for all further requests to Graphcool

## Setup the Email Update Function

* Create a new Schema Extension Function and paste the schema from `schema-extension.graphql` and code from `update-email.js`.
* add a PAT to the project *called the same as your function*. The token can be obtained from the Authentication tab in the project settings.
* Remove Read and Update permissions for the `User` email/password types. The function uses a Permanent Access Token to query/mutate users via the API so the permissions are not needed.

## Test the Code

Go to the Graphcool Playground:

```sh
graphcool playground
```

Run this mutation to change a user's email:

```graphql
mutation {
  # replace __EMAIL__ , __NEW_EMAIL__ , and __PASSWORD__!
  updateUserEmail(email: "__EMAIL__", newEmail: "__NEW_EMAIL__", password: "__PASSWORD__") {
    token
  }
}
```

If the email/password combo are valid, and the newEmail is a valid format, you should see that it updates the user's password field and returns a token. The returned token can be used to authenticate requests to your Graphcool API as that user.