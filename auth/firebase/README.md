# firebase

Add Firebase Authentication to your Graphcool project 🎁

## Getting Started

### 1. Add the template to your Graphcool service

```sh
graphcool add-template graphcool/templates/auth/firebase
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

## Flow

1. The user clicks the `Login with Firebase` button
2. The Firebase Auth UI is loaded and the user accepts
3. The app receives a [Firebase Id Token](https://firebase.google.com/docs/auth/admin/verify-id-tokens)
4. Your app calls the Graphcool mutation `authenticateUser(firebaseIdToken: String!)`
5. If no user exists yet that corresponds to the passed `firebaseIdToken`, a new `User` node will be created
6. In any case, the `authenticateUser(firebaseIdToken: String!)` mutation returns a valid token for the user
7. Your app stores the token and uses it in its `Authorization` header for all further requests to Graphcool

## Setup

### Create a Firebase App

### Paste Firebase Admin Credentials


## TODO

- [ ] add setup info in README
- [ ] remove logs from function
