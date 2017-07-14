# update-password

Update the password for users in your app who login using email and password, with Schema Extensions and Graphcool Functions ⚡️

> Note: Schema Extensions are currently only available in the Beta Program.

## Getting Started

If you have not already done so, run the following to initialize the graphcool cli and your schema

```sh
npm -g install graphcool
graphcool init --schema email-user-management.graphql
```

## Update password flow in app

1. Your app calls the Graphcool mutation `updateUserPassword(email: String!, oldPassword: String!, newPassword: String!)`
2. If `email` passed is not a valid format, an error is returned
3. If a user with the passed `email` is not found, an error is returned
4. If a user is found, the password is tested. If the credentials are invalid, an error is returned.
5. If a user with the passed `email` exists and the `password` matches, the user's `password` field is updated to the new password.
6. The mutation returns a valid token for the user
7. Your app stores the token and uses it in its `Authorization` header for all further requests to Graphcool

## Setup the Password Update Function

* Create a new Schema Extension Function and paste the schema from `schema-extension.graphql` and code from `update-password.js`.
* add a PAT to the project *called the same as your function*. The token can be obtained from the Authentication tab in the project settings.
* Remove Read and Update permissions for the `User` email/password types. The function uses a Permanent Access Token to query/mutate users via the API so the permissions are not needed.

## Test the Code

Go to the Graphcool Playground:

```sh
graphcool playground
```

Run this mutation to change a user's password:

```graphql
mutation {
  # replace __EMAIL__ , __OLD_PASSWORD__ , and __NEW_PASSWORD__!
  updateUserPassword(email: "__EMAIL__", oldPassword: "__OLD_PASSWORD__", newPassword: "__NEW_PASSWORD__") {
    token
  }
}
```

If the email/newPassword combo are valid you should see that it updates the user's password field and returns a token. The returned token can be used to authenticate requests to your Graphcool API as that user.