import fetch from 'isomorphic-fetch';
import stripeInit from 'stripe';
import {stripeKey, graphCoolEndpoint} from './constants';

const stripe = stripeInit(stripeKey);

const updateGraphCoolCustomer = async (id, stripeCustomerId) => {
  const updateCustomer = JSON.stringify({
    query: `
        mutation {
          updateCustomer(
            id: "${id}",
            stripeCustomerId: "${stripeCustomerId}",
          ) {
            id
            stripeCustomerId
            email
          }
        }
      `
  });

  try {
    const response = await fetch(graphCoolEndpoint, {
      headers: {'content-type': 'application/json'},
      method: 'POST',
      body: updateCustomer,
    });
    return await response.json();
  }
  catch (err) {
    console.log(`Error updating GraphCool customer: ${JSON.stringify(err)}`);
    throw err;
  }
};

const createStripeCustomer = async email => {
  console.log(`Creating stripe customer for ${email}`);
  let stripeCustomer;

  try {
    stripeCustomer = await stripe.customers.create({email});
    console.log(`Successfully created Stripe customer: ${stripeCustomer.id}`);
    return stripeCustomer;
  }
  catch (err) {
    console.log(`Error creating Stripe customer: ${JSON.stringify(err)}`);
    throw err;
  }
};

const main = event => {
  const {id, email} = event.data.Customer.node;

  return new Promise(async (resolve, reject) => {
    try {
      const stripeCustomer = await createStripeCustomer(email);
      const graphCoolCustomer = await updateGraphCoolCustomer(id, stripeCustomer.id);
      console.log(`Successfully updated GraphCool customer: ${JSON.stringify(graphCoolCustomer)}`);
      resolve(event);
    }
    catch (err) {
      console.log(err);
      reject(err);
    }
  });
};

module.exports = main;

// export these local methods so we can unit test them
module.exports.updateGraphCoolCustomer = updateGraphCoolCustomer;
module.exports.createStripeCustomer = createStripeCustomer;
