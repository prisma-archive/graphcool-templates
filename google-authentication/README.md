# google-authentication

Create users and sign in with Schema Extensions and Graphcool Functions ⚡️

## Getting Started

```sh
npm -g install graphcool
graphcool init --schema google-authentication.graphql
```

## Setup the Authentication Function

 > Note: this is currently only available in the Beta Program.

* Create a new `schema extension` function and paste the schema from `schema-extension.graphql` and code from `google-authentication.js`.
* add a PAT to the project called `google-authentication`. This is done from the permissions tab in the project settings.
* Remove all Create permissions from the `User` model. This function uses a Permanent Access Token to query the API.

## Test the Code

Go to the Graphcool Playground:

```sh
graphcool playground
```

Run this mutation to authenticate a user:

```graphql
mutation {
  authenticateGoogleUser(googleToken: "google token"){
    token
  }
}
```

 > Note: you can use the small app in `login.html` to obtain a valid Facebook Token

You should see the token that can be used to make requests to your Graphcool API.

## Authentication flow in app

1. The user clicks authenticate with Google
2. Your app loads the Google ui to authenticate
3. Your app receives a Google Access Token
4. Your app calls the Graphcool mutation authenticateGoogleUser(googleToken: String!): {token: String!}
5. If the user doesn’t exist a new User will be created
6. Graphcool returns a valid token for the user
7. Your app stores the token and uses this for all further requests to Graphcool

## Google App Setup

Follow the steps on https://developers.google.com/identity/ for how to work with the Google Identity Platform
