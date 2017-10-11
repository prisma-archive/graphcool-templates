# twilio

Send Sms with Twilio in your Graphcool project 🎁

## Getting Started

```sh
npm -g install graphcool
graphcool init
graphcool modules add graphcool/modules/messaging/twilio
```

## Configuration

In your base project, you need to configure the following **environment variables**.

- `TWILIO_ACCOUNT_SID`: Twilio Account SID
- `TWILIO_AUTH_TOKEN`: Twilio Auth Token

You can receive them after [signing up at Twilio](https://twilio.com/).

An easy way to setup environment variables is using [direnv](https://direnv.net/).
To use `direnv`, put the following into `.envrc` in you project root:

```sh
export TWILIO_ACCOUNT_SID=xxx
export TWILIO_AUTH_TOKEN=xxx
```

## Flow

Whenever the `sendSms` mutation is called, a new SMS will be sent according to the passed in sender, recipient and body. Media content can optionally be included as well.

## Test the Code

Go to the Graphcool Playground:

```sh
graphcool playground
```

Hook into the function logs:

```sh
graphcool logs -f sendTwilioSms --tail
```

Run this mutation to create a new email:

```graphql
mutation {
  sendTwilioSms(
    to: "__RECIPIENT_NUMBER__"
    from: "__SENDER_NUMBER__"
    body: "Hey there, check this cool image!"
    mediaUrl: "https://climacons.herokuapp.com/clear.png"
  ) {
    sid
  }
}
```

A new SMS will be sent to the specified number. This is also reflected in the function logs.

> Note: when testing out Twilio, both numbers have to be verified first.

![](http://i.imgur.com/5RHR6Ku.png)
