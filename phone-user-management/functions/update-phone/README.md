# update-phone

Update the phoneNumber for users in your app who login using phoneNumber and deviceId.

## Update phoneNumber flow in app

1. Your app calls the Graphcool mutation `updatePhone(phoneNumber: String!, deviceId: String!, newPhoneNumber: String!)`
2. If `newPhoneNumber` passed is not a valid format, an error is returned
3. If a user with the passed `phoneNumber` and `deviceId` combination is not found, an error is returned
4. If a user with the passed `phoneNumber` exists and the `deviceId` matches, the user's `phoneNumber` field is updated to the new phoneNumber
5. The mutation returns the id and new phoneNumber of the updated user

## Setup the Email Update Function

* Create a new Schema Extension Function and paste the schema from `schema-extension.graphql` and code from `update-phone.js`.
* add a PAT to the project *called the same as your function*. The token can be obtained from the Authentication tab in the project settings.

## Test the Code

First, you need to create a new user with the `signup` function. Then, go to the Graphcool Playground:

```sh
graphcool playground
```

Run this mutation to change a user's phoneNumber:

```graphql
mutation {
  # replace __PHONE_NUMBER__ , __NEW_PHONE_NUMBER__ , and __DEVICE_ID__
  updatePhone(phoneNumber: "__PHONE_NUMBER__", deviceId: "__DEVICE_ID__", newPhoneNumber: "__NEW_PHONE_NUMBER__") {
    id
    phoneNumber
  }
}
```

If the phoneNumber/deviceId combo are valid, and the newPhoneNumber is a valid format, you should see that it updates the user's phoneNumber field and returns the user's id and new phoneNumber.
