# stripe-create-customer-charge

Creates a new Stripe customer and Stripe charge with Graphcool Functions ⚡️

Gets triggered after a new Stripe token has been created on the client-side and updated in `User` in Graphcool, and updates `User` with the new Stripe customer id.

## Getting Started

```sh
npm -g install graphcool
graphcool init --schema User.graphql
```

## Setup Stripe

* You need a Stripe account so create one for free [here](https://dashboard.stripe.com/register).

* Replace `__STRIPE_KEY__` in `stripe-create-customer-charge.js` with your **test Stripe key** and `__PROJECT_ID__` with your **project id**.

* Create a new server-side subscription function and set `User` type as the trigger.

* Paste the code from `subscription.graphql` to the subscription query panel

* Paste the code from `stripe-create-customer-charge.js` to the inline code panel.

## Test the Code

Go to the Graphcool Playground and run this mutation to create a new user:

```graphql
mutation {
  createUser(email: "test@example.com", firstName: "Jane", lastName: "Doe") {
    id
  }
}
```

This returns the `id` of the new user. Now, update the User with that `id` (replace __USER_ID__ in mutation below) and a demo token `tok_visa` (see [Stripe docs](https://stripe.com/docs/testing)):

```graphql
mutation {
  updateUser(id: "__USER_ID__", stripeToken: "tok_visa") {
    id
    stripeCustomerId
  }
}
```

This should return a null `stripeCustomerId` because it has not been created yet. Remember, our function is triggered <u><i>after</i></u> the user has been updated with a `stripeToken`. Run the query below to see that our function has run and updated the new user with the Stripe customer id:


```graphql
query {
  allUsers {
    id
    stripeCustomerId
  }
}
```

This should return the new user with a valid Stripe customer id. That's it!

## Contributions

Thanks so much [@yusinto](https://github.com/yusinto) and [@heymartinadams](https://github.com/heymartinadams) for contributing this example! :tada:
