# email-user-management

Functions for managing users who login using email and password, with Schema Extensions and Graphcool Functions ⚡️

> Note: Schema Extensions are currently only available in the Beta Program.

## Getting Started

```sh
npm -g install graphcool
graphcool init --schema email-user-management.graphql
```

## Usage

1. Your app calls the Graphcool mutation `createEmailUser(email: String!, password: String!)` to create Users
2. Your app calls the Graphcool mutation `authenticateEmailUser(email: String!, password: String!)` to login Users
3. Your app calls the Graphcool mutation `updateUserPassword(email: String!, oldPassword: String!, newPassword: String!)` to change a User's password
4. Your app calls the Graphcool mutation `updateUserEmail(email: String!, newEmail: String!, password: String!)` to change a User's email

## Test the Code

> Note: The following assumes you have defined each function in the functions folder. See them for details.

Go to the Graphcool Playground:

```sh
graphcool playground
```

Run this mutation to create a user:

```graphql
mutation {
  # replace __EMAIL__ , __NEW_EMAIL__ , and __PASSWORD__!
  updateUserPassword(email: "__EMAIL__", newEmail: "__NEW_EMAIL__", password: "__PASSWORD__") {
    token
  }
}
```

Run this mutation to authenticate an existing user:

```graphql
mutation {
  # replace __EMAIL__ and __PASSWORD__!
  authenticateEmailUser(email: "__EMAIL__", password: "__PASSWORD__") {
    token
  }
}
```

Run this mutation to update an existing user's password:

```graphql
mutation {
  # replace __EMAIL__ , __OLD_PASSWORD__ , and __NEW_PASSWORD__!
  updateUserPassword(email: "__EMAIL__", oldPassword: "__OLD_PASSWORD__", newPassword: "__NEW_PASSWORD__") {
    token
  }
}
```

Run this mutation to update an existing user's email:

```graphql
mutation {
  # replace __EMAIL__ , __NEW_EMAIL__ , and __PASSWORD__!
  updateUserEmail(email: "__EMAIL__", newEmail: "__NEW_EMAIL__", password: "__PASSWORD__") {
    token
  }
}
```

For further information on each mutation, view the readme for each function in the functions folder.


