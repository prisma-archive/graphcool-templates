# email-user-management

Functions for email and password login using Schema Extensions and Graphcool Functions ⚡️

> Note: Schema Extensions are currently only available in the Beta Program.

## Getting Started

```sh
npm -g install graphcool
graphcool init --schema email-user-management.graphql
```

## Permission setup

* Remove Create, Update and Read permissions for the fields `email` and `password` on `User`.
* The function in this example use a Permanent Access Token to fetch or create users via the API so the permissions are not needed.

## Usage

1. Your app calls the Graphcool mutation `signupEmailUser(email: String!, password: String!)` to signup Users
2. Your app calls the Graphcool mutation `authenticateEmailUser(email: String!, password: String!)` to authenticate Users
3. Your app calls the Graphcool mutation `updateUserPassword(email: String!, oldPassword: String!, newPassword: String!)` to change a User's password
4. Your app calls the Graphcool mutation `updateUserEmail(email: String!, newEmail: String!, password: String!)` to change a User's email

## Test the Code

First, follow the READMEs to setup all the functions in the functions folder. Then go to the Graphcool Playground:

```sh
graphcool playground
```

and follow the instructions in the functions folder to test the code.

## Contributions

Thanks so much [@stevewpatterson](https://github.com/stevewpatterson) for contributing this example :tada:
