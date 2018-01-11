# update-device

Update the deviceId for users in your app who login using phoneNumber and deviceId.

## Update deviceId flow in app

1. Your app calls the Graphcool mutation `updateDevice(phoneNumber: String!, deviceId: String!, newDeviceId: String!)`
3. If a user with the phoneNumber and deviceId combination is not found, an error is returned
4. If a user with the passed `phoneNumber` exists and `deviceId` matches, the user's `deviceId` field is updated to the new deviceId.
5. The mutation returns the id of the updated user

## Setup the deviceId Update Function

* Create a new Schema Extension Function and paste the schema from `schema-extension.graphql` and code from `update-device.js`.
* add a PAT to the project *called the same as your function*. The token can be obtained from the Authentication tab in the project settings.

## Test the Code

First, you need to create a new user with the `signup` function. Then, go to the Graphcool Playground:

```sh
graphcool playground
```

Run this mutation to change a user's deviceId:

```graphql
mutation {
  # replace __PHONE_NUMBER__ , __OLD_DEVICE_ID__ , and __NEW_DEVICE_ID__
  updateDevice(phoneNumber: "__PHONE_NUMBER__", deviceId: "__OLD_DEVICE_ID__", newDeviceId: "__NEW_DEVICE_ID__") {
    id
  }
}
```

If the phoneNumber/newDeviceId combo are valid you should see that it updates the user's deviceId field and returns the user's id.
