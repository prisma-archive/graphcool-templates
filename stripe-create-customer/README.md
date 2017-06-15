# stripe-create-customer

<b>Updated 15-June-17 Now in es6 with async await!</b>

You can now write Graphcool Server Side Subscription and Request Pipeline 
functions in es6 with async await! You need webpack, but all the hard 
work to configure it has been done in this example.

This example creates a new Stripe customer with Graphcool Server Side Subscription Function ⚡️

Gets triggered after a new customer is created in Graphcool and updates 
it with the new Stripe customer id.

## Getting Started

```sh
yarn
npm -g install graphcool
graphcool init --schema customer.graphql
```

## Setup Stripe, Graphcool and build the code

* You need a Stripe account so create one for free [here](https://dashboard.stripe.com/register).

* Replace `__STRIPE_KEY__` in `src/constants.js` with your **test Stripe key** 
and `__PROJECT_ID__` with your **project id**.

* In Graphcool dashboard, create a new server-side subscription function 
and set `Customer` type as the trigger

* Paste the code from `subscription.graphql` to the subscription query panel

* Run `npm run build`. This will transpile the es6 code in `src/createStripeCustomer.js` 
and outputs it to `dist/createStripeCustomer.js`

* Paste the code from `dist/createStripeCustomer.js` to the inline code panel.

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

This should return the `id` of the new customer and a null `stripeCustomerId` because 
it has not been created yet. Remember, our function is triggered <u><i>after</i></u> the mutation.

Run the query below to see that our function has run and updated the new customer 
node with the Stripe customer id:


```graphql
query {
  allCustomers {
    id
    stripeCustomerId
  }
}
```

This should return the new customer with a valid Stripe customer id.

## Unit tests
You can also run unit tests locally on your functions with jest. Always
a good idea before deployment (ehem copying pasting)! 

```sh
npm t
```

## What's next?
Copying pasting uglified code is pretty bad and annoying. I'll look into
how we can improve this in the next iteration. Check out my blog 
[reactjunkie.com](http://www.reactjunkie.com) for this and more of Graphcool 
functions soon.

That's it!
