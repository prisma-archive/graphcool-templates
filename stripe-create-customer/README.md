# stripe-create-customer

Creates a new stripe customer when a new customer is created in graphcool.

Gets triggered after a new customer is created in graphcool and updates it with the stripe customerId. 

## Getting Started

```sh
npm -g install graphcool
graphcool init --schema customer.graphql
```

## Setup Stripe

* You need a stripe account so create one for free [here](https://dashboard.stripe.com/register).

* Replace `__STRIPE_KEY__` in `stripe-create-customer.js` with your **test Stripe key**.

* Create a new server side subscription function and set Customer type as the trigger.

* Paste the code from `subscription.graphql` to the subscription query panel

* Paste the code from `stripe-create-customer.js` to the inline code panel

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

This should return the `id` of the new customer and a null stripeCustomerId because
it has not been created yet. Remember, our subscription runs <u><i>after</i>≤/u> the mutation.

Run the query below now with the id returned above to see that our function has run and 
updated the customer row with the stripe customer id:


```graphql
query {
  Customer(id: "__PASTE_ID_FROM_PREVIOUS_MUTATION__") {
    id
    stripeCustomerId
  }
}
```

This should return a valid stripe customer id. That's it!
