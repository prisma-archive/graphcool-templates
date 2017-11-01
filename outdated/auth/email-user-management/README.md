# email-user-management

Functions for email and password login ⚡️

## Usage

1. Your app calls the Graphcool mutation `signupEmailUser(email: String!, password: String!)` to signup Users
2. Your app calls the Graphcool mutation `authenticateEmailUser(email: String!, password: String!)` to authenticate Users
3. Your app calls the Graphcool mutation `updateEmail(email: String!, password: String!, newEmail: String!)` to change a User's email
4. Your app calls the Graphcool mutation `updatePassword(email: String!, password: String!, newPassword: String!)` to change a User's password

## Notes

The function in this example use a Permanent Authentication Token to fetch or create users via the API so the permissions are not needed. Therefore, it's recommended to **remove Create, Update and Read permissions** for the fields `email` and `password` on `User`. Those fields are controlled by the custom mutations that are added in this example.

This also allows you to change the email or password fields using a PAT manually as an administrator. For manually updating password, note that the `password` field is hashed and salted using `bcrypt` and for authenticating or updating the user information, the current password is compared to that hashed and salted version.

## Test the Code

First, follow the READMEs to setup all the functions in the functions folder. Then go to the Graphcool Playground:

```sh
graphcool playground
```

and follow the instructions in the functions folder to test the code. It makes sense to setup the functions in the above order.

## Common Error Messages

* Receiving

  > Error: Unknown argument 'email' on field 'User' of type 'Query'.

  indicates that the `email` field on `User` doesn't have the `@isUnique` modifier. Either mark the `email` field unique to enabled the `User(email: String)` query, or use `allUsers(filters: { email: "..." })` instead.

## Contributions

Thanks so much [@stevewpatterson](https://github.com/stevewpatterson), [@mwickett](https://github.com/mwickett) and [@heymartinadams](https://github.com/heymartinadams) for contributing this example :tada:

![](http://i.imgur.com/5RHR6Ku.png)
