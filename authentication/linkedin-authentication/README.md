# linkedin-authentication

Create LinkedIn users and sign in with Schema Extensions and Graphcool Functions ⚡️

> Note: Schema Extensions are currently only available in the Beta Program.

## Getting Started

```sh
npm -g install graphcool
graphcool init --schema linkedin-authentication.graphql
```

## Authentication flow in app

1. The user clicks the `Sign in with LinkedIn` button
2. The LinkedIn UI is loaded and the user accepts
3. The app receives a LinkedIn Access Token
4. Your app calls the Graphcool mutation `authenticateLinkedInUser(linkedInToken: String!)`
5. If no user exists yet that corresponds to the passed `linkedInToken`, a new `User` node will be created
6. In any case, the `authenticateLinkedInUser(linkedInToken: String!)` mutation returns a valid token for the user
7. Your app stores the token and uses it in its `Authorization` header for all further requests to Graphcool

## Setup the Authentication Function

* Create a new Schema Extension Function and paste the schema from `schema-extension.graphql` and code from `linkedin-authentication.js`.
* Create a new Permanent Access Token (PAT) in project settings. *It needs to have the same name as the function to make it available in the execution context of the function.*
* Remove all Create permissions for the `User` type. The function uses a Permanent Access Token to create users via the API so the permissions are not needed.

## LinkedIn App Setup

### Create a LinkedIn App

To use LinkedIn Authentication you need to create a LinkedIn app.

Once you created a new App, copy its Client-id. Replace `__CLIENT_ID__` in `login.html` with your Client-id.

Add `http://localhost:8000` and `http://localhost:8000/login.html` to your valid OAuth 2.0 URLs.  
Add `http://localhost:8000` to your valid Javascript SDK domains.

### Create a LinkedIn Token

To create a test LinkedIn Token, run `login.html`, for example using Python's `SimpleHTTPServer`:

```sh
python -m SimpleHTTPServer
```

Open `http://localhost:8000/login.html` in your browser and use the login button to create a new LinkedIn Token.

## Test the Code

First, obtain a valid LinkedIn token with the small app in `login.html` as mentioned above.

Go to the Graphcool Playground:

```sh
graphcool playground
```

Run this mutation to authenticate a user:

```graphql
mutation {
  # replace __LINKEDIN_TOKEN__!
  authenticateLinkedInUser(linkedInToken: "__LINKEDIN_TOKEN__") {
    token
  }
}
```

You should see that a new user has been created. The returned token can be used to authenticate requests to your Graphcool API as that user. Note that running the mutation again with the same LinkedIn token will not add a new user.
