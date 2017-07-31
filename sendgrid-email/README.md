# sendgrid-email

Send an email via SendGrid with Graphcool Functions ⚡️

## Getting Started

```sh
npm -g install graphcool
graphcool init --schema sendgrid-email.graphql
```

## Setup: Add User to Mailing List

* Create a new **Server-Side Subscription** event and insert this as the trigger + payload:

  ```graphql
  subscription {
    User(filter: {
      mutation_in: [CREATED]
    }) {
      node {
        id
        nameFirst
        nameLast
        email
      }
    }
  }
  ```

  This will add the user to the SendGrid list whenever a new user is created.

* Paste the code from `addtolist_es6.js` (for ES6 syntax) or `addtolist.js` (older syntax) as the inline function and replace `__SENDGRID_SECRET_KEY__` with your unique SendGrid key and `___SENDGRID_LIST_ID___` with the unique ID of your mailing list.

## Setup: Send Email

* Create a new **Server-Side Subscription** event and insert this as the trigger + payload:

  ```graphql
  subscription {
    Contacts(filter: {
      mutation_in: [CREATED]
    }) {
      node {
        id
        nameFirst
        nameLast
        email
      }
    }
  }
  ```

  This will trigger the SendGrid email whenever a new contact is created.

* Paste the code from `email.js` as the inline function and replace `__SENDGRID_SECRET_KEY__` with your unique SendGrid key.

## Test the Code

Go to the Graphcool Playground:

```sh
graphcool playground
```

Run this mutation to create a new user and add it to your mailing list:

```graphql
mutation createUser {
  createUser(
    nameFirst: "Joe",
    nameLast: "Shmoe"
    email: "joe@joeshmoe.com"
  ) {
    id
  }
}
```

Next, run this mutation to create a new contact and send the email:

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

## Contributions

Thanks so much [@kbrandwijk](https://github.com/kbrandwijk) and [@heymartinadams](https://github.com/heymartinadams) for contributing this example! :tada:

![](http://i.imgur.com/5RHR6Ku.png)
