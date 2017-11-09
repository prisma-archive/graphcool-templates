# validate-email

Validate emails using a hook function ⚡️

## Getting Started

### 1. Add the template to your Graphcool service

```sh
graphcool add-template graphcool/templates/misc/validate-email
```

### 2. Uncomment lines in `graphcool.yml` and `types.graphql`

The [`add-template`](https://www.graph.cool/docs/reference/graphcool-cli/commands-aiteerae6l#graphcool-add-template) command is performing three major steps:

1. Download the source files from the [`src`](./src) directory and put them into your service's `src` directory (into a subdirectory called `validate-email`).
2. Download the contents from [`graphcool.yml`](./graphcool.yml) and append them as comments to your service's `graphcool.yml`.
3. Download the contents from [`types.graphql`](./types.graphql) and append them as comments to your service's `types.graphql`.

In order for the changes to take effect, you need to manually uncomment all the lines that have been added by the `add-template` command.

### 3. Deploy the service

Finally, you need to install the [node dependencies](./package.json#L2) and apply all the changes you just made by deploying the service:

```sh
npm install
graphcool deploy
```

## Test the code

Open the Playground for your deployed service: `graphcool playground`.

#### Input Tranformation

Create a new `Customer` with an uppercase email address:

```graphql
mutation {
  createCustomer(
    email: "NILAN@graph.cool"
    name: "Nilan"
  ) {
    email
  }
}
```

The `email` will be transformed to the lower case version by the hook function.

#### Input Validation

Create a new customer with an invalid email address:

```graphql
mutation {
  createCustomer(
    email: "nilan@graph@cool"
    name: "Nilan"
  ) {
    email
  }
}
```

The customer will not be created. Instead, an error message is returned.

![](http://i.imgur.com/5RHR6Ku.png)
