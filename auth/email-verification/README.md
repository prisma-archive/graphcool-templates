# email-verification

Email verification functionality on your Graphcool Project - based on email-password template 🎁

## Getting Started

### 1. Add the template to your Graphcool service

```sh
graphcool add-template graphcool/templates/auth/email-verification
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

## Test the Code

Go to the Graphcool Playground:

```sh
graphcool playground
```

Run this mutation to send account activation email:

```graphql
mutation {
  sendAccountActivationEmail(id: ID, name: "NAME", email: "EMAIL") {
    result
  }
}
```


Run this mutation to activate the account:
```graphql
mutation {
  activateAccount(id: "ID") {
    result
  }
}
```