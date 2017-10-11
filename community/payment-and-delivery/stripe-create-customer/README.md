# stripe-create-customer

Creates a new Stripe customer with Graphcool Functions ⚡️

Gets triggered after a new customer is created in Graphcool and updates it with the new Stripe customer id.

## Getting Started

```sh
npm -g install graphcool
graphcool init --schema customer.graphql
```

## Setup Stripe

* You need a Stripe account so create one for free [here](https://dashboard.stripe.com/register).

* Replace `__STRIPE_KEY__` in `stripe-create-customer.js` with your **test Stripe key** and `__PROJECT_ID__` with your **project id**.

* Create a new server-side subscription function and set `Customer` type as the trigger.

* Paste the code from `subscription.graphql` to the subscription query panel

* Paste the code from `stripe-create-customer.js` to the inline code panel.

## Test the Code

Go to the Graphcool Playground and run this mutation to create a new customer:

```graphql
mutation {
  createCustomer(email:"test@example.com") {
    id
    stripeCustomerId
    email
  }
}
```

This should return the `id` of the new customer and a null `stripeCustomerId` because it has not been created yet. Remember, our function is triggered <u><i>after</i></u> the mutation.

Run the query below to see that our function has run and updated the new customer node with the Stripe customer id:


```graphql
query {
  allCustomers {
    id
    stripeCustomerId
  }
}
```

## Contributions

Thanks so much [@yusinto](https://github.com/yusinto) for contributing this example! :tada:

This should return the new customer with a valid Stripe customer id. That's it!
