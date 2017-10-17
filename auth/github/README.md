# github-authentication

Add Github Authentication to your Graphcool project 🎁


## Getting Started

### 1. Add the template to your Graphcool service

```sh
graphcool add-template graphcool/templates/auth/github
```

### 2. Uncomment lines in `graphcool.yml` and `types.graphql`

The [`add-template`](https://docs-next.graph.cool/reference/graphcool-cli/commands-aiteerae6l#graphcool-add-template) command is performing three major steps:

1. Download the source files from the [`src`](./src) directory and put them into your service's `src` directory (into a subdirectory called `email-password`).
2. Download the contents from [`graphcool.yml`](./graphcool.yml) and append them as comments to your service's `graphcool.yml`.
3. Download the contents from [`types.graphql`](./types.graphql) and append them as comments to your service's `types.graphql`.

In order for the changes to take effect, you need to manually uncomment all the lines that have been added by the `add-template` command.

### 3. Deploy the service

Finally, you need to apply all the changes you just made by deploying the service:

```sh
graphcool deploy
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
