# facebook-authentication

Create users and sign in with Schema Extensions and Graphcool Functions ⚡️

## Getting Started

```sh
npm -g install graphcool
graphcool init --schema facebook-authentication.graphql
```

## Setup the Authentication Function

 > Note: this is currently only available in the Beta Program.

* Create a new `schema extension` function and paste the schema from `schema-extension.graphql` and code from `facebook-authentication.js`.
* add a PAT to the project called `facebook-authentication`. This is done from the permissions tab in the project settings.
* Remove all Create permissions from the `User` model. This function uses a Permanent Access Token to query the API.

## Test the Code

Go to the Graphcool Playground:

```sh
graphcool playground
```

Run this mutation to authenticate a user:

```graphql
mutation {
  authenticateFacebookUser(facebookToken: "facebook token"){
    token
  }
}
```

 > Note: you can use the small app in `login.html` to obtain a valid Facebook Token

You should see the token that can be used to make requests to your Graphcool API.

## Authentication flow in app

1. The user clicks authenticate with Facebook
2. Your app loads the Facebook ui to authenticate
3. Your app receives a Facebook Access Token
4. Your app calls the Graphcool mutation authenticateFacebookUser(facebookToken: String!): {token: String!}
5. If the user doesn’t exist a new User will be created
6. Graphcool returns a valid token for the user
7. Your app stores the token and uses this for all further requests to Graphcool

## Facebook App Setup

### Create a Facebook App

To use Facebook Login you need to create a facebook app. Follow this guide to create an app in a few minutes https://developers.facebook.com/docs/apps/register

 > note: in order to test your web app locally you will need to include localhost in your App Domains and set the Site Url to something that includes localhost, for example http://localhost:8000

### Add the email permission

See https://developers.facebook.com/docs/facebook-login/permissions/#adding

By default you have access to the public_profile permission that includes information about the user such as name, age range and location. If you want to access the users email you need to additionally ask for the email permission.

