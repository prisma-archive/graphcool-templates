# email-user-creation

Signup new users in your app using email and password and receive a token in return.

## Signup flow in app

1. Your app calls the Graphcool mutation `signupEmailUser(email: String!, password: String!)`.
2. If no user exists yet that corresponds to the passed `email`, a new `User` node will be created with the password (after being hashed and salted) and a token will be generated with an expiration time.
3. If a user with the passed `email` exists, a `User` node is not created and an error is returned.
4. If a user is created, then the `signupEmailUser(email: String!, password: String!)` mutation returns the id for the new user.
5. A `CREATED` subscription on `User` automatically sends an email to the user’s email address. That email contains a link in this format: `https://www.MyWebsite.com/confirm?token=__TOKEN__&email=__EMAIL__`.
6. Your app calls the Graphcool mutation `confirmEmail(confirmToken: String!)`.
7. If the token exists, the field `confirmed` is set to `true` and the fields `confirmToken` and `confirmExpires` are set to `null`.
8. If the user needs to have the confirmation email resent, your app calls the Graphcool mutation `resendConfirmation(email: String!)`, which generates a token with an expiration time.
9. As in step 5, a subscription is triggered, but this time through an `UPDATED` subscription, which automatically sends an email to the user’s email address.

## Setup the Create User Function

* Create a new Schema Extension Function and paste the schema from `1-signup-schema.graphql` and code from `1-signup.js`.
* Add a PAT to the project *called the same as your function*. The token can be obtained from the Authentication tab in the project settings.
* Remove all Create permissions for the `User` type. The function uses a Permanent Access Token to create users via the API so the permissions are not needed.
* Create a new Server-Side Subscription and past the schema from `2-send-schema.graphql` and code from `2-send.js` (if you use SendGrid; modify code for other email service providers as needed).
* Create a new Schema Extension Function and paste the schema from `3-confirm-schema.graphql` and code from `3-confirm.js`.
* Add a PAT to the project *called the same as your function*.
* Create a new Schema Extension Function and paste the schema from `4-resend-schema.graphql` and code from `4-resend.js`.
* Add a PAT to the project *called the same as your function*.
* Create a new Server-Side Subscription and past the schema from `5-send-schema.graphql` and the same code from `2-send.js`.

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

You should see that a new user has been created and should hopefully receive an email with a confirmation link. The returned id can be used to query your Graphcool API for that user. Note that running the mutation again with the same email will return an error stating that the email is already in use.
