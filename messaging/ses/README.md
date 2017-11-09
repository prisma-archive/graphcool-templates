# ses

Send emails with AWS SES in your Graphcool project 🎁

## Getting Started

### 1. Add the template to your Graphcool service

```sh
graphcool add-template graphcool/templates/messaging/ses
```

### 2. Uncomment lines in `graphcool.yml` and `types.graphql`

The [`add-template`](https://www.graph.cool/docs/reference/graphcool-cli/commands-aiteerae6l#graphcool-add-template) command is performing three major steps:

1. Download the source files from the [`src`](./src) directory and put them into your service's `src` directory (into a subdirectory called `ses`).
2. Download the contents from [`graphcool.yml`](./graphcool.yml) and append them as comments to your service's `graphcool.yml`.
3. Download the contents from [`types.graphql`](./types.graphql) and append them as comments to your service's `types.graphql`.

In order for the changes to take effect, you need to manually uncomment all the lines that have been added by the `add-template` command.

### 3. Setup AWS SES credentials

You need to configure these credentials as environment variables:

In your base project, you need to configure the following **environment variables**.

- `ACCESS_KEY_ID`: AWS Access Key ID
- `SECRET_ACCESS_KEY`: AWS Secret Access Key
- `REGION`: AWS Region (example: us-west-2)

You can read more about managing your Access Keys [in the AWS docs](https://docs.aws.amazon.com/general/latest/gr/managing-aws-access-keys.html). Note: You'll need to create an account.

An easy way to setup environment variables is using [direnv](https://direnv.net/).
To use `direnv`, put the following into `.envrc` in you project root:

```sh
export ACCESS_KEY_ID=xxx
export SECRET_ACCESS_KEY=xxx
export REGION=xxx
```

### 4. Deploy the service

Finally, you need to install the [node dependencies](./package.json#L2) and apply all the changes you just made by deploying the service:

```sh
npm install
graphcool deploy
```

## Test the Code

Use the `sendSesEmail` mutation to send emails according to its parameters:

* `from: String!`: sender email
* `to: [String!]!`: a list of recipient emails
* `subject: String!`: the email subject
* `text: String!`: the text body of the email
* `html: String!`: the html body of the email

**Important Note:** You can only use verified emails to send and receive. You can learn more [from the AWS docs](https://docs.aws.amazon.com/ses/latest/DeveloperGuide/verify-email-addresses.html)

Go to the Graphcool Playground:

```sh
graphcool playground
```

Hook into the function logs:

```sh
graphcool logs -f sendEmail --tail
```

Run this mutation to send a new email:

```graphql
mutation {
  sendSesEmail(
    from: "__SENDER_EMAIL__"
    to: "__RECIPIENT_EMAIL__"
    subject: "A new email from the Graphcool SES template!"
    html: "<b>This is your first email from the Graphcool SES template!</b>"
    text: "This is your first email from the Graphcool SES template!"
  ) {
    success
  }
}
```

![](http://i.imgur.com/5RHR6Ku.png)
