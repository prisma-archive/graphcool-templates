# update-email

Update the email for users in your app who login using email and password.

## Update email flow in app

1. Your app calls the Graphcool mutation `updateEmail(email: String!, password: String!, newEmail: String!)`
2. If `newEmail` passed is not a valid format, an error is returned
3. If a user with the passed `email` and `password` combination is not found, an error is returned
4. If a user with the passed `email` exists and the `password` matches, the user's `email` field is updated to the new email
5. The mutation returns the id and new email of the updated user

## Setup the Email Update Function

* Create a new Schema Extension Function and paste the schema from `schema-extension.graphql` and code from `update-email.js`.
* add a PAT to the project *called the same as your function*. The token can be obtained from the Authentication tab in the project settings.

## Test the Code

First, you need to create a new user with the `signup` function. Then, go to the Graphcool Playground:

```sh
graphcool playground
```

Run this mutation to change a user's email:

```graphql
mutation {
  # replace __EMAIL__ , __NEW_EMAIL__ , and __PASSWORD__
  updateEmail(email: "__EMAIL__", password: "__PASSWORD__", newEmail: "__NEW_EMAIL__") {
    id
    email
  }
}
```

If the email/password combo are valid, and the newEmail is a valid format, you should see that it updates the user's email field and returns the user's id and new email.
