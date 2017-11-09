# linkedin-authentication

Add LinkedIn Authentication to your Graphcool project 🎁

## Getting Started

### 1. Add the template to your Graphcool service

```sh
graphcool add-template graphcool/templates/auth/linkedin
```

### 2. Uncomment lines in `graphcool.yml` and `types.graphql`

The [`add-template`](https://www.graph.cool/docs/reference/graphcool-cli/commands-aiteerae6l#graphcool-add-template) command is performing three major steps:

1. Download the source files from the [`src`](./src) directory and put them into your service's `src` directory (into a subdirectory called `linkedin`).
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

To use LinkedIn Authentication you need to create a LinkedIn app.

Once you created a new App, copy its Client-id. Replace `__CLIENT_ID__` in `login.html` with your Client-id.

Add `http://localhost:8000` and `http://localhost:8000/login.html` to your valid OAuth 2.0 URLs.  
Add `http://localhost:8000` to your valid Javascript SDK domains.

Copy the Client ID and use it to replace `__CLIENT_ID__` in `login.html`.

To create a test LinkedIn Token, run `login.html`, for example using Python's `SimpleHTTPServer`:

```sh
python -m SimpleHTTPServer
```

Open `http://localhost:8000/login.html` in your browser and use the login button to create a new LinkedIn Token. It will be printed in the DevTools.

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
