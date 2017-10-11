# github-authentication

Add Github Authentication to your Graphcool project 🎁

## Getting Started

```sh
npm -g install graphcool
graphcool init
graphcool modules add graphcool/modules/authentication/github
```

## Configuration

Setup a new OAuth app on Github according to this guide: https://developer.github.com/apps/building-integrations/setting-up-and-registering-oauth-apps/registering-oauth-apps/ and copy its **client id** and **client secret**.

In your base project, you need to configure the following **environment variables**.

- `CLIENT_ID`: Github Client ID
- `CLIENT_SECRET`: Github Client Secret


An easy way to set these up is using [direnv](https://direnv.net/).
To use `direnv`, put the following into `.envrc` in you project root:

```sh
export CLIENT_ID=xxx
export CLIENT_SECRET=xxx
```

Read on to see how to obtain a Github code to test the authentication function.

## Test the Code

### Obtaining a test code

First, update the configuration of the OAuth app on Github you just created:

* Set the **Homepage URL** to `http://localhost:8000/`
* Set the **Application Callback URL** to `http://localhost:8000/login.html`
* Replace `__CLIENT_ID__` in `login.html` with the **client id** of your OAuth app
* Server `login.html`, for example by using `python -m SimpleHTTPServer`
* Open `https://localhost:8000/login.html` in a browser, open the DevTools and authenticate with your Github account
* Copy the code printed in the Console of your DevTools

### Testing the authentication function

Go to the Graphcool Playground:

```sh
graphcool playground
```

Run this mutation to authenticate a user:

```graphql
mutation {
  # replace __GITHUB_CODE__ with the code from `login.html` from above!
  authenticateUser(githubCode: "__GITHUB_CODE__") {
    token
  }
}
```

You should see that a new user has been created. The returned token can be used to authenticate requests to your Graphcool API as that user. Note that running the mutation again with the same Github code will not add a new user.

![](http://i.imgur.com/5RHR6Ku.png)
