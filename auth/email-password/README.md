# email-password

Add email and password login to your Graphcool Project 🎁

## Getting Started

### 1. Add the template to your Graphcool service

```sh
graphcool add-template graphcool/templates/auth/email-password
```

### 2. Uncomment lines in `graphcool.yml` and `types.graphql`

The [`add-template`](https://docs-next.graph.cool/reference/graphcool-cli/commands-aiteerae6l#graphcool-add-template) command is performing three major steps:

1. Download the source files from the [`src`](./src) directory and put them into your service's `src` directory (into a subdirectory called `email-password`).
2. Download the contents from [`graphcool.yml`](./graphcool.yml) and append them as comments to your service's `graphcool.yml`.
3. Download the contents from [`types.graphql`](./types.graphql) and append them as comments to your service's `types.graphql`.

In order for the changes to take effect, you need to manually uncomment all the lines that have been added by the `add-template` command.

### 3. Configure root token

The functions in [`authenticate.js`](./src/authenticate.js) and [`signup.js`](./src/signup.js) need access to a [root token](https://docs-next.graph.cool/reference/auth/authentication/authentication-tokens-eip7ahqu5o#root-tokens). 

After you added the template to your service, you need to have (at least) one root token configured in your service.

If the list of `rootTokens` in your `graphcool.yml` is currently empty, add the following root token to it:

```yml
rootTokens
  - authentication
```

> Note that the _name_ of the root token is actually not relevant. You can call it something else than `authentication`.

### 4. Deploy the service

Finally, you need to apply all the changes you just made by deploying the service:

```sh
graphcool deploy
```

## Flow

### Signup

1. Your app calls the Graphcool mutation `signupUser(email: String!, password: String!)`.
2. If no user exists yet that corresponds to the passed `email`, a new `User` node will be created with the password (after being hashed and salted).
3. If a user with the passed `email` exists, a `User` node is not created and an error is returned (since `email` has an `@isUnique` requirement).
4. If a user is created, then the `signupUser(email: String!, password: String!)` mutation returns the `id` as well as an authentication `token` for the new user.

### Login

1. Your app calls the Graphcool mutation `authenticateUser(email: String!, password: String!)`.
2. If no user exists yet that corresponds to the passed `email`, or the `password` does not match, an error will be returned.
3. If a user with the passed `email` exists and the `password` matches, the mutation returns a valid token for the user.
4. Your app stores the token and uses it in its `Authorization` header for all further requests to Graphcool.

## Test the Code

Go to the Graphcool Playground:

```sh
graphcool playground
```

Run this mutation to create a user:

```graphql
mutation {
  # replace __EMAIL__ and __PASSWORD__
  signupUser(email: "__EMAIL__", password: "__PASSWORD__") {
    id
    token
  }
}
```

and this to authenticate as that user:

```graphql
mutation {
  # replace __EMAIL__ and __PASSWORD__
  authenticateUser(email: "__EMAIL__", password: "__PASSWORD__") {
    token
  }
}
```

![](http://i.imgur.com/5RHR6Ku.png)
