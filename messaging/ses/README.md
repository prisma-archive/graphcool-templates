# sendgrid

Send emails with AWS SES in your Graphcool project 🎁

## Getting Started

```sh
npm -g install graphcool@alpha
graphcool init
graphcool add-template messaging/ses
```

## Configuration

In your base project, you need to configure the following **environment variables**.

- `ACCESS_KEY_ID`: AWS Access Key ID
- `SECRET_ACCESS_KEY`: AWS Secret Access Key
- `REGION`: AWS Region

You can read the docs on managing your Access Keys [on the AWS docs](https://docs.aws.amazon.com/general/latest/gr/managing-aws-access-keys.html). Note: You'll need to create an account.

An easy way to setup environment variables is using [direnv](https://direnv.net/).
To use `direnv`, put the following into `.envrc` in you project root:

```sh
export ACCESS_KEY_ID=xxx
export SECRET_ACCESS_KEY=xxx
export REGION=xxx
```

## Flow

Whenever a new `SesEmail` node is created with information about the recipient, sender, subject and email body, the server-side subscription picks it up and invokes the SES API to send out the email.

**Important Note:** You can only use verified emails to send and receive. You can learn more [from the AWS docs](https://docs.aws.amazon.com/ses/latest/DeveloperGuide/verify-email-addresses.html)

## Test the Code

Go to the Graphcool Playground:

```sh
graphcool playground
```

Hook into the function logs:

```sh
graphcool logs -f sendEmail --tail
```

Run this mutation to create a new email:

```graphql
mutation {
  # replace __YOUR_EMAIL__!
  sendSesEmail(
    from: "nilan@graph.cool"
    to: "__YOUR_EMAIL__"
    subject: "A new email from the Graphcool SES template!"
    html: "<b>This is your first email from the Graphcool SES template!</b>"
  ) {
    success
  }
}
```

You should see that a new `SesEmail` node has been created, and you received a new email. This is also reflected in the function logs.

![](http://i.imgur.com/5RHR6Ku.png)
