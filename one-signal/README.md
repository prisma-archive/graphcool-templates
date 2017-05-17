# one-signal

Send a Push Notification to OneSignal with Graphcool Functions ⚡️

## Getting Started

```sh
npm -g install graphcool
graphcool init --schema one-signal.graphql
```

## Setup the Push Notification

* Create a new **Server-Side Subscription** and insert this as the trigger + payload:

  ```graphql
  subscription {
    Event(filter: {
      mutation_in: [CREATED]
    }) {
      node {
        description
        location {
          lat
          lng
        }
      }
    }
  }
  ```

  This will trigger the push notification whenever a new event is created.

* Paste the code from `function.js` as the inline function and replace **the OneSignal APP ID and APP KEY**.

## Test the Code

Go to the Graphcool Playground:

```sh
graphcool playground
```

Run this mutation to create a new event and location and trigger the Push Notification:

```graphql
mutation testPushNotification {
  createEvent(
    description: "Join us on May 21st in Berlin for GraphQL Europe and be a part of Europe's first GraphQL conference ever!"
    location: {
      lat: 52.501107
      lng: 13.450851
    }
  )
}
```

![](http://i.imgur.com/5RHR6Ku.png)
