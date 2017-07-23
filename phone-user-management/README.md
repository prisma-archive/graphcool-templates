# phone-user-management

Functions for phone and deviceID login using Schema Extensions and Graphcool Functions ⚡️

> Note: Schema Extensions are currently only available in the Beta Program.

## Getting Started

```sh
npm -g install graphcool
graphcool init --schema phone-user-management.graphql
```

## Usage

1. Your app calls the Graphcool mutation `signupPhoneUser(phoneNumber: String!, deviceId: String!)` to signup Users
2. Your app calls the Graphcool mutation `authenticatePhoneUser(phoneNumber: String!, deviceId: String!)` to authenticate Users
3. Your app calls the Graphcool mutation `updatePhone(phoneNumber: String!, deviceId: String!, newPhoneNumber: String!)` to change a User's phone number (use case: gets new phone number)
4. Your app calls the Graphcool mutation `updateDevice(phoneNumber: String!, deviceId: String!, newDeviceId: String!)` to change a User's deviceId (use case: gets new phone)

## Notes

The function in this example use a Permanent Authentication Token to fetch or create users via the API so the permissions are not needed. Therefore, it's recommended to **remove Create, Update and Read permissions** for the fields `phoneNumber` and `deviceId` on `User`. Those fields are controlled by the custom mutations that are added in this example.

This also allows you to change the phoneNumber or deviceId fields using a PAT manually as an administrator. For manually updating deviceId, note that the `deviceId` field is hashed and salted using `bcrypt` and for authenticating or updating the user information, the current deviceId is compared to that hashed and salted version.

## Test the Code

First, follow the READMEs to setup all the functions in the functions folder. Then go to the Graphcool Playground:

```sh
graphcool playground
```

and follow the instructions in the functions folder to test the code. It makes sense to setup the functions in the above order.

## Contributions

A straightforward adaptation of [@stevewpatterson](https://github.com/stevewpatterson)'s email auth example
