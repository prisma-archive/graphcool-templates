# pusher

Send push notifications with Pusher in your Graphcool project 🎁

## Getting Started

```sh
npm -g install graphcool
graphcool init
graphcool modules add graphcool/modules/messaging/pusher
```

## Configuration

In your base project, you need to configure the following **environment variables**.

* `PUSHER_APP_ID`: Pusher app id
* `PUSHER_KEY`: Pusher key
* `PUSHER_SECRET`: Pusher secret
* `PUSHER_CLUSTER`: Pusher cluster

You can receive them after [signing up at Pusher](https://pusher.com/).

An easy way to setup environment variables is using [direnv](https://direnv.net/).
To use `direnv`, put the following into `.envrc` in you project root:

```sh
export PUSHER_APP_ID=xxx
export PUSHER_KEY=xxx
export PUSHER_SECRET=xxx
export PUSHER_CLUSTER=xxx
```

## Flow

Whenever the `triggerPusherEvent` mutation is called, a new push notification event will be sent to the specified channels.

## Test the Code

First, setup the Pusher configuration in `notification.html`. Please replace the following constants with the same value you used for the environment variables above:

* `APP_KEY`: Pusher app key
* `CLUSTER`: Pusher cluster

Then, serve the file `notification.html`, for example with:

```sh
python -m SimpleHTTPServer
```

and open it in your browser.

Open the playground:

```sh
graphcool playground
```

and run this mutation to push a notification to your browser:

```graphql
mutation {
  triggerPusherEvent(
    channels: ["my-channel"]
    event: "my-event"
    message: "Hello from the Graphcool pusher module!"
  ) {
    success
  }
}
```
