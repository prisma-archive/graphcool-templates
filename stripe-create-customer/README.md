# stripe-create-customer

Create a stripe customer when a new graphcool customer is created
using server side subscription️

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

Go to the Graphcool Playground:

```sh
graphcool playground
```

Run this mutation to create a new coupon and trigger the coupon check:

```graphql
mutation {
  createCustomer(email:"test@example.com") {
    id
    stripeCustomerId
    email
  }
}
```

This should return the `id` of the new coupon node, because `my-coupon-code` is a valid code.

Run this mutation to create a new coupon and trigger the coupon check:

```graphql
mutation testStripeCoupon {
  createCoupon(
    key: "wrong-code"
  ) {
    id
  }
}
```

This should return an error message, because `wrong-code` is an invalid code.

![](http://i.imgur.com/5RHR6Ku.png)
