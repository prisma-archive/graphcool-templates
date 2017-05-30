const stripe = require('stripe')('__STRIPE_KEY__')

module.exports = function (event) {
  const code = event.data.key
  return new Promise(function(resolve, reject) {
    return stripe.coupons.retrieve(
      code,
      function(err, response) {
        if (err) {
          console.log(`Invalid coupon code '${code}' requested`)
          resolve({error: 'Coupon code is invalid'})
        } else {
          console.log(`Valid coupon code '${code}' requested`)
          resolve(event)
        }
      }
    )
  })
}
