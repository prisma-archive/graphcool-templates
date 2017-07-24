const fromEvent = require('graphcool-lib').fromEvent
// Data is not submitted in JSON format!
const FormData = require('form-data')
// You can get this from https://dashboard.stripe.com/account/apikeys
const clientSecret = '__CLIENT_SECRET__'

module.exports = function (event) {
  // This is the user ID to update
  const userId = event.data.userId
  // This is the authorization code previously returned by Stripe @see https://stripe.com/docs/connect/standard-accounts#redirected
  const authCode = event.data.authCode

  const graphcool = fromEvent(event)
  const api = graphcool.api('simple/v1')

  function getStripeUserCredentials() {
    var formData = new FormData()
    formData.append('client_secret', clientSecret)
    formData.append('code', authCode)
    formData.append('grant_type', 'authorization_code')

    return fetch('https://connect.stripe.com/oauth/token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json'
      },
      body: formData
    })
      .then(data => data.json())
      .then(json => json.stripe_user_id)
  }

  function updateGraphcoolUser(userId, stripeId) {
    return api
      .request(`
      	mutation {
          updateUser(id: "${userId}", stripeId: "${stripeId}") {
            id
          }
        }
      `)
      .then(userMutationResult => {
        return userMutationResult.updateUser.id
      })
  }

  return getStripeUserCredentials()
    .then(stripeUserId => {
    	return updateGraphcoolUser(userId, stripeUserId)
  	})
    .then(updatedUserId => {
    	return {data: {id: updatedUserId}}
  	})
    .catch(error => {
    	return {error: error.toString()}
  	})
}
