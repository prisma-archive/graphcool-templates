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
8. Your user will receive a text message and enter in the 5 digit code.
9. You will pass `userId` and`confirmCode` to the `confirmUserSmsToken` function which will:
  - Decrypt your JWT token
  - Check expiration date / token
  - Resolve the promise if details are correct
  - Throw an error if details are incorrect
10. If the details are correct, GraphCool will generate an auth token and return an object with `data.token` that you should store as an auth header.
11. If details are incorrect, it will return an error object.

## Setup the Authentication Function

* Create a new Schema Extension Function called `authenticateSmsUser` and paste the schema from `sms-authentication-schema-extension.graphql` and code from `confirm-code.js`.
* Create a new Schema Extension Function called `confirmUserSmsToken` and paste the schema from `confirm-code-schema-extension.graphql` and code from `sms-authentication.js`.
* Create a new Permanent Access Token (PAT) in project settings. *It needs to have the same name as the function to make it available in the execution context of the function.*
* Remove all Create permissions from the `User` type. The function uses a Permanent Access Token to create users via the API so the permissions are not needed.

## Twilio App Setup

Required Variables from Twilio:
- `TWILIO_SID`
- `TWILIO_TOKEN`
- `TWILIO_NUMBER`

Copy these variables over to your new inline function.

- Sign up at https://www.twilio.com
- Under the console dashboard, you will see:
  - `Account SID`. This will be your `TWILIO_SID`
  - `AUTH TOKEN`. This is hidden by default. Click it. This will be your `TWILIO_TOKEN`
  - Under "Recently Used Products" or "All Twilio Products" click "Phone Numbers" and/or "Buy a number". Once you have it, this will be your `TWILIO_NUMBER`. **Phone numbers have a monthly cost associated to them**.

## Test the Code

Enter in your phone number. Wait for a text message. Check your `User` data for a token.

```sh
graphcool playground
```

Run this mutation to generate and send a 5-digit token to your user's phone and return a `userId`.

```graphql
mutation {
  # replace __PHONE_NUMBER__!
  authenticateSmsUser(phone: "__PHONE_NUMBER__") {
    userId
  }
}
```

Run this mutation to confirm a token and send an auth token to your app:

```graphql
mutation {
  # replace __CONFIRM_CODE__ !
  # replace __USER_ID__ !
  confirmUserSmsToken(userId: "__USER_ID__", confirmCode: "__CONFIRM_CODE__") {
     token
  }
}
```

You should see that a new user has been created. The returned token can be used to authenticate requests to your Graphcool API as that user. Note that running the mutation again with the same SMS Token token will not add a new user.

## Contributions

Thanks so much [@peterpme](https://github.com/peterpme) for contributing this example! :tada:
