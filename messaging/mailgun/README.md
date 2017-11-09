# mailgun

Send emails with mailgun in your Graphcool project 🎁

## Getting Started

### 1. Add the template to your Graphcool service

```sh
graphcool add-template messaging/mailgun
```

### 2. Uncomment lines in `graphcool.yml` and `types.graphql`

The [`add-template`](https://www.graph.cool/docs/reference/graphcool-cli/commands-aiteerae6l#graphcool-add-template) command is performing three major steps:

1. Download the source files from the [`src`](./src) directory and put them into your service's `src` directory (into a subdirectory called `mailgun`).
2. Download the contents from [`graphcool.yml`](./graphcool.yml) and append them as comments to your service's `graphcool.yml`.
3. Download the contents from [`types.graphql`](./types.graphql) and append them as comments to your service's `types.graphql`.

In order for the changes to take effect, you need to manually uncomment all the lines that have been added by the `add-template` command.

### 3. Setup Github credentials

You need to configure these credentials as environment variables:

* `MAILGUN_API_KEY`
* `MAILGUN_DOMAIN`

You can receive them after [signing up at mailgun](https://app.mailgun.com/app/dashboard).

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
graphcool logs -f sendEmail --tail
```

Run this mutation to send a single email:

```graphql
mutation {
  # replace __SENDER_EMAIL__ and __RECIPIENT_EMAIL__ with *authorized* email addresses!
  sendMailgunEmail(
    tag: "2017-09-16-welcome-email"
    from: "__SENDER_EMAIL__"
    to: "__RECIPIENT_EMAIL__"
    subject: "A new email from the Graphcool mailgun module!"
    text: "This is your first email from the Graphcool mailgun module!"
  ) {
    success
  }
}
```

Run this mutation to send a batched email:

```graphql
mutation {
    # replace __SENDER_EMAIL__, __FIRST_EMAIL__ and __SECOND_EMAIL__ with *authorized* email addresses!
  sendMailgunEmail(
    tag: "2017-09-16-batched-welcome-email"
    from: "__SENDER_EMAIL__"
    to: ["__FIRST_EMAIL__", "__SECOND_EMAIL__"]
    subject: "A new email from the Graphcool mailgun module!"
    text: "Hey %recipient.name%, this is your first email from the Graphcool mailgun module!"
    recipientVariables: "{\"__FIRST_EMAIL__\": {\"name\": \"First\"}, \"__SECOND_EMAIL__\": {\"name\": \"Second\"}}"

  ) {
    success
  }
}
```

![](http://i.imgur.com/5RHR6Ku.png)
