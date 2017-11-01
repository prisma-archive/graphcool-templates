# reset-password

Resets the password for users who have forgotten their password.

## Reset password flow

1. Your app calls the Graphcool mutation `triggerPasswordReset(email: String!)` from the password reset page (e.g. https://www.example.com/reset) (see `client/NewPassword.js`).
2. If no user with that email is found, an error is returned (see `server/triggerPasswordReset.js`).
3. If a user with that email is found, a new token and an expiration date of one hour is generated via an `updateUser` mutation (see `server/triggerPasswordReset.js` and `server/triggerPasswordReset.graphql`).
4. The mutation returns the id of the updated user.
5. A subscription triggers a transactional email to be sent to the user’s email address with a url that contains both the token and the user’s email address: https://www.example.com/reset?token=TOKEN&email=EMAIL (for examples, see either `server/sendgrid-email/sendPasswordResetEmail.js` or `server/postmark-email/sendPasswordResetEmail.js`).
6. User clicks on link and is brought to the same page in step 1 (see `client/NewPassword.js`), but this time the app renders different components because it understands the URL contains a token and an email address.
7. Your app calls the Graphcool mutation `resetPassword(resetToken: $resetToken, password: $password)` (see `client/NewPassword.js`).
8. If no user with that token is found, or if the token has expired, an error is returned (see `server/passwordReset.js`).
9. If a valid token has been found, the password for that user is first hashed and then updated, and the token and expiration date are `null`ed out.
10. The mutation returns the user id.

## Setup the Password Reset Feature

### Schema Modifications
* Add two fields to your `User` table: `resetExpires: DateTime` and `resetToken: String @isUnique`.
* Remove `READ` permissions for both `resetExpires` and `resetToken`.

### Trigger
* Create a new Schema Extension Function and paste the schema from `server/triggerPasswordReset.graphql` and code from `server/triggerPasswordReset.js` (save it, for example, as: `Password Reset: trigger`).
* Add a PAT to the project *called the same as your function* (save it, continuing our example, as: `Password Reset: trigger`). The token can be obtained from the Authentication tab in the project settings.

### Email
* Create a new server-side subscription and paste the subscription query from `server/*-email/sendPasswordResetEmail.graphql` and code from `server/*-email/sendPasswordResetEmail.js` (save it, for example, as: `Password Reset: email`)

### Reset
* Create a new Schema Extension Function and paste the schema from `server/passwordReset.graphql` and code from `server/passwordReset.js` (save it, for example: `Password Reset: reset`).
* Add a PAT to the project *called the same as your function* (save it, continuing our example, as: `Password Reset: reset`). The token can be obtained from the Authentication tab in the project settings.

## Test the Code

First, you need to create a new user with the `signup` function. Then, go to the Graphcool Playground:

```sh
graphcool playground
```

Run this mutation to reset a user's password:

```graphql
mutation {
  # replace __EMAIL__
  triggerPasswordReset(email: "__EMAIL__") {
    id
  }
}
```

If the email is valid, and if you have correctly set up all other steps, you should receive an email with a link to a url that contains a token and the user’s email address. Then run this mutation to set a new password:

```graphql
mutation {
  # replace __TOKEN__ and __NEW_PASSWORD__
  resetPassword(resetToken: "__TOKEN__", password: "__NEW_PASSWORD__") {
    id
  }
}
```
