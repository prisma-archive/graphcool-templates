# sms-authentication

Authenticate users using Twilio SMS API, Schema Extensions and Graphcool Functions

> Note: Schema Extensions are currently only available in the Beta Program.

## Getting Started

```sh
npm -g install graphcool
graphcool init --schema sms-authentication.graphql
```

## Authentication flow in app
1. The user enters his/her phone number
2. Your app receives a phone number
3. Your app calls the Graphcool mutation `authenticateSmsUser(phone: String!)`
4. The `authenticateSmsUser` function checks if the user exists, if not, a new `User` will be created
5. The app will generate an SMS code and a JWT token that will be saved under `User`
6. Twilio sends that sms code to the phone number provided
7. Your `User` model is updated with the JWT-encrypted sms code
8. Your user will receive a text message. Your app will take that sms code, unencrypt it and check to make sure its correct

## Setup the Authentication Function

* Create a new Schema Extension Function and paste the schema from `schema-extension.graphql` and code from `sms-authentication.js`.
* Create a new Permanent Access Token (PAT) in project settings. *It needs to have the same name as the function to make it available in the execution context of the function.*
* Remove all Create permissions from the `User` type. The function uses a Permanent Access Token to create users via the API so the permissions are not needed.

## Twilio App Setup

Copy the `TWILIO_SID` and `TWILIO_AUTH_TOKEN` over to your new inline function.

## Test the Code

Enter in your phone number. Wait for a text message. Check your `User` data for a token~

```sh
graphcool playground
```

Run this mutation to authenticate a user:

```graphql
mutation {
  # replace __PHONE_NUMBER__!
  authenticateSmsUser(phone: "__PHONE_NUMBER__") {
    token
  }
}
```

You should see that a new user has been created. The returned token can be used to authenticate requests to your Graphcool API as that user. Note that running the mutation again with the same SMS Token token will not add a new user.
