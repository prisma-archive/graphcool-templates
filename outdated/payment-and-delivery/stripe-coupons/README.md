# stripe-coupons

Check if a Stripe Coupon exists with Graphcool Functions ⚡️

## Getting Started

```sh
npm -g install graphcool
graphcool init --schema stripe-coupons.graphql
```

## Setup Stripe

* Create a new Coupon at Stripe with a fixed price reduction and use the key `my-coupon-code`.

* Replace `__STRIPE_KEY__` in `stripe-coupons.js` with your **test Stripe key**.

* Create a new function as part of the **`PRE_WRITE` step of the Request Pipeline** and paste the code from `stripe-coupons.js`. This will check if the coupon code exists whenever an Coupon is created.

## Test the Code

Go to the Graphcool Playground:

```sh
graphcool playground
```

Run this mutation to create a new coupon and trigger the coupon check:

```graphql
mutation testStripeCoupon {
  createCoupon(
    key: "my-coupon-code"
  ) {
    id
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
