# facebook

Add Facebook Authentication to your Graphcool project 🎁

## Getting Started

### 1. Add the template to your Graphcool service

```sh
graphcool add-template graphcool/templates/auth/facebook
```

### 2. Uncomment lines in `graphcool.yml` and `types.graphql`

The [`add-template`](https://www.graph.cool/docs/reference/graphcool-cli/commands-aiteerae6l#graphcool-add-template) command is performing three major steps:

1. Download the source files from the [`src`](./src) directory and put them into your service's `src` directory (into a subdirectory called `email-password`).
2. Download the contents from [`graphcool.yml`](./graphcool.yml) and append them as comments to your service's `graphcool.yml`.
3. Download the contents from [`types.graphql`](./types.graphql) and append them as comments to your service's `types.graphql`.

In order for the changes to take effect, you need to manually uncomment all the lines that have been added by the `add-template` command.

### 3. Deploy the service

Finally, you need to install the [node dependencies](./package.json#L2) and apply all the changes you just made by deploying the service:

```sh
npm install
graphcool deploy
```

## Configuration

### Create a Facebook App

To use Facebook Login you need to create a Facebook app and add the `Facebook Login` product. Follow [this guide to create an app](https://developers.facebook.com/docs/apps/register) in a few minutes.

Once you created a new APP, add the and copy its App ID. Replace `__APP_ID__` in `login.html` with your App ID.

![](docs/app-id.png)

> Note: if your API Version is something else than `v2.9`, you also need to update that in `login.html`.

Add `http://localhost:8000` and `http://localhost:8000/login.html` to your valid OAuth URIs of the `Facebook Login` product:

![](docs/facebook-login-settings.png)

### Create a Facebook Token

To create a test Facebook Token, run `login.html`, for example using Python's `SimpleHTTPServer`:

```sh
python -m SimpleHTTPServer
```

Open `http://localhost:8000/login.html` in your browser and use the login button to create a new Facebook Token.

### Add the email permission

By default you have access to the `public_profile` permission that includes information about the user such as name, age range and location. If you want to access the users email you need to additionally ask for the email permission, [more information here](https://developers.facebook.com/docs/facebook-login/permissions/#adding). This is already done in `login.html`

## Test the Code

First, obtain a valid Facebook token with the small app in `login.html` as mentioned above.

Go to the Graphcool Playground:

```sh
graphcool playground
```

Run this mutation to authenticate a user:

```graphql
mutation {
  # replace __FACEBOOK_TOKEN__!
  authenticateUser(facebookToken: "__FACEBOOK_TOKEN__") {
    token
  }
}
```

You should see that a new user has been created. The returned token can be used to authenticate requests to your Graphcool API as that user. Note that running the mutation again with the same Facebook token will not add a new user.

![](http://i.imgur.com/5RHR6Ku.png)
