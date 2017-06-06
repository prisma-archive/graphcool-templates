const fetch = require('isomorphic-fetch');
const stripe = require('stripe')('__STRIPE_KEY__');

module.exports = event => {
    const id = event.data.Customer.node.id;
    const email = event.data.Customer.node.email;
    const graphCoolEndpoint = 'https://api.graph.cool/simple/v1/cj2q45mbs06v40103q55dqfm4';

    const updateGraphCoolCustomer = (id, stripeCustomerId) => {
        const updateCustomer = JSON.stringify({
            query: `
                mutation {
                  updateCustomer(
                    id: "${id}",
                    stripeCustomerId: "${stripeCustomerId}",
                  )
                  {
                    id
                    stripeCustomerId
                    email
                  }
                }`
        });

        return fetch(graphCoolEndpoint, {
            headers: {'content-type': 'application/json'},
            method: 'POST',
            body: updateCustomer,
        });
    };

    const createStripeCustomer = email => {
        console.log(`Creating stripe customer for ${email}`);
        return new Promise((resolve, reject) => {
            stripe.customers.create({email},
                (err, customer) => {
                    if (err) {
                        console.log(`Error creating stripe customer: ${JSON.stringify(err)}`);
                        reject(err);
                    } else {
                        console.log(`Successfully created stripe customer: ${customer.id}`);
                        resolve(customer.id);
                    }
                }
            );
        });
    };

    return new Promise((resolve, reject) => {
        createStripeCustomer(email)
            .then(stripeCustomerId => updateGraphCoolCustomer(id, stripeCustomerId))
            .then(response => response.json())
            .then(responseJson => {
                console.log(`Successfully updated graphcool customer: ${JSON.stringify(responseJson)}`);
                resolve(event);
            })
            .catch(err => {
                console.log(err);
                reject(err);
            });
    });
};
