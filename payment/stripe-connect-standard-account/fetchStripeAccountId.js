const fromEvent = require('graphcool-lib').fromEvent
// Data is not submitted in JSON format!
const FormData = require('form-data')
// You can get this from https://dashboard.stripe.com/account/apikeys
const clientSecret = '__CLIENT_SECRET__'

module.exports = function (event) {
  // This is the user ID to update
  const userId = event.data.userId
  // Here is where you can check for permissions
  // In this case the only thing being verified is
  // whether the user calling the mutation is the same user this mutation updates
  // Of course you can also make other GraphQL queries to make a more complex verification
  if (userId !== event.context.auth.nodeId) {
    return {error: 'Unauthorized request'}
  }
  
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
    .then(result => {
      if (result.error) {
        throw new Error(result.error + ': ' + result.error_description)
      }
      return updateGraphcoolUser(userId, result.stripe_user_id)
    })
    .then(updatedUserId => {
    	return {data: {id: updatedUserId}}
  	})
    .catch(error => {
    	return {error: error.toString()}
  	})
}
