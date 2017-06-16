# sendgrid-email

Send an email via SendGrid with Graphcool Functions ⚡️

## Getting Started

```sh
npm -g install graphcool
graphcool init --schema **missing schema**
```

## Setup

* Create a new **Server-Side Subscription** event and insert this as the trigger + payload:

  ```graphql
  subscription {
    Contacts(filter: {
      mutation_in: [CREATED]
    }) {
      node {
        id
        nameFirst
        email
      }
    }
  }
  ```

  This will trigger the SendGrid email whenever a new contact is created.

* Paste the code from `sendgrid.js` as the inline function and replace `__SENDGRID_SECRET_KEY__` with your unique SendGrid key.

## Test the Code

Go to the Graphcool Playground:

```sh
graphcool playground
```

Run this mutation to create a new post and trigger the Slack notification:

```graphql
mutation createContact {
	createContacts(
		nameFirst: "Jane",
		nameLast: "Doe"
		email: "jane@janedoe.com"
	) {
		id
	}
}
```

You should receive an email like this:

![](./email.jpg)
