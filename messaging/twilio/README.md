# twilio

Send Sms with Twilio in your Graphcool project 🎁

## Getting Started

### 1. Add the template to your Graphcool service

```sh
graphcool add-template messaging/twilio
```

### 2. Uncomment lines in `graphcool.yml` and `types.graphql`

The [`add-template`](https://docs-next.graph.cool/reference/graphcool-cli/commands-aiteerae6l#graphcool-add-template) command is performing three major steps:

1. Download the source files from the [`src`](./src) directory and put them into your service's `src` directory (into a subdirectory called `twilio`).
2. Download the contents from [`graphcool.yml`](./graphcool.yml) and append them as comments to your service's `graphcool.yml`.
3. Download the contents from [`types.graphql`](./types.graphql) and append them as comments to your service's `types.graphql`.

In order for the changes to take effect, you need to manually uncomment all the lines that have been added by the `add-template` command.

### 3. Setup Twilio credentials

You need to configure these credentials as environment variables:

* `TWILIO_ACCOUNT_SID`
* `TWILIO_AUTH_TOKEN`

You can receive them after [signing up at Twilio](https://twilio.com/).

To manage your environment variables, you can use a tool like [direnv](https://direnv.net/).

### 4. Deploy the service

Finally, you need to install the [node dependencies](./package.json#L2) and apply all the changes you just made by deploying the service:

```sh
npm install
graphcool deploy
```

## Test the Code

Go to the Graphcool Playground:

```sh
graphcool playground
```

Hook into the function logs:

```sh
graphcool logs -f sendSms --tail
```

Run this mutation to create a new email:

```graphql
mutation {
  sendSms(
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
