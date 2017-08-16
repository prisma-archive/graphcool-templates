'use latest'

const request = require('request-promise')

const SENDCLOUD_PUBLIC_KEY = '__PUBLIC_KEY__'
const SENDCLOUD_SECRET_KEY = '__SECRET_KEY__'

module.exports = (event) => {
  const { shippingMethodId } = event.data

  const options =
    {
      auth: {
      	user: SENDCLOUD_PUBLIC_KEY,
      	pass: SENDCLOUD_SECRET_KEY
      },
      baseUrl: 'https://panel.sendcloud.sc/api/v2',
      uri: `/shipping_methods/${shippingMethodId}`,
      method: 'GET',
      json: true
    }

  return request(options)
  	.then(data =>  {
      // Workaround for api-bug #224
      data.shipping_method.shippingMethodId = data.shipping_method.id;
      return { data: data.shipping_method }
    })
    .catch(error => { return error })
}
