const fetch = require('isomorphic-fetch')
const stripe = require('stripe')('__STRIPE_KEY__')

module.exports = event => {
  const userId = event.data.User.node.id
  const email = event.data.User.node.email
  const firstName = event.data.User.node.firstName
  const lastName = event.data.User.node.lastName
  const stripeToken = event.data.User.node.stripeToken
  const graphCoolEndpoint = 'https://api.graph.cool/simple/v1/__PROJECT_ID__'

  const createStripeCustomer = (email, firstName, lastName, stripeToken) => {
    console.log(`Creating stripe customer for ${email}`)
    return new Promise((resolve, reject) => {
      stripe.customers.create({
        email,
        description: firstName + ' ' + lastName,
        source: stripeToken
      }, (err, customer) => {
        if (err) {
          console.log(`Error creating stripe customer: ${JSON.stringify(err)}`)
          reject(err)
        } else {
          console.log(`Successfully created stripe customer: ${customer.id}`)
          resolve(customer.id)
        }
      })
    })
  }

  const createStripeCharge = (email, stripeCustomerId) => {
    console.log(`Creating stripe charge for ${email}`)
    return new Promise((resolve, reject) => {
      stripeCharge = stripe.charges.create({
        amount: '999',
        currency: 'usd',
        description: 'My Demo App',
        customer: stripeCustomerId,
      }, (err, charge) => {
        if (err) {
          console.log(`Error creating Stripe charge: ${JSON.stringify(err)}`)
          reject(err)
        } else {
          console.log(`Successfully created Stripe charge: ${charge.id}`)
          resolve(stripeCustomerId)
        }
      })
    })
  }

  const updateGraphCoolUser = (userId, stripeCustomerId) => {
    const updateCustomer = JSON.stringify({
      query: `
        mutation {
          updateUser(
            id: "${userId}",
            isPaid: true,
            stripeCustomerId: "${stripeCustomerId}",
            stripeToken: null
          ) {
            id
            email
            isPaid
            stripeCustomerId
          }
        }
      `
    })
    return fetch(graphCoolEndpoint, {
      headers: { 'content-type': 'application/json' },
      method: 'POST',
      body: updateCustomer,
    })
  }

  return new Promise((resolve, reject) => {
    createStripeCustomer(email, firstName, lastName, stripeToken)
      .then(stripeCustomerId => createStripeCharge(email, stripeCustomerId))
      .then(stripeCustomerId => updateGraphCoolUser(userId, stripeCustomerId))
      .then(response => response.json())
      .then(responseJson => {
        console.log(`Successfully updated graphcool customer: ${JSON.stringify(responseJson)}`)
        resolve(event)
      })
      .catch(err => {
        console.log(err)
        reject(err)
      })
  })
}
