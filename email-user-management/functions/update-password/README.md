# update-password

Update the password for users in your app who login using email and password.

## Update password flow in app

1. Your app calls the Graphcool mutation `updatePassword(email: String!, password: String!, newPassword: String!)`
2. If a user with the email and password combination is not found, an error is returned
3. If a user with the passed `email` exists and `password` matches, the user's `password` field is updated to the new password.
4. The mutation returns the id of the updated user

## Setup the Password Update Function

* Create a new Schema Extension Function and paste the schema from `schema-extension.graphql` and code from `update-password.js`.
* add a PAT to the project *called the same as your function*. The token can be obtained from the Authentication tab in the project settings.

## Test the Code

First, you need to create a new user with the `signup` function. Then, go to the Graphcool Playground:

```sh
graphcool playground
```

Run this mutation to change a user's password:

```graphql
mutation {
  # replace __EMAIL__ , __OLD_PASSWORD__ , and __NEW_PASSWORD__
  updatePassword(email: "__EMAIL__", password: "__OLD_PASSWORD__", newPassword: "__NEW_PASSWORD__") {
    id
  }
}
```

If the email/newPassword combo are valid you should see that it updates the user's password field and returns the user's id.
