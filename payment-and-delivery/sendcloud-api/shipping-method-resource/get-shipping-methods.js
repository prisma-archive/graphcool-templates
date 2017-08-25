'use latest'

const request = require('request-promise')

const SENDCLOUD_PUBLIC_KEY = '__PUBLIC_KEY__'
const SENDCLOUD_SECRET_KEY = '__SECRET_KEY__'

module.exports = (event) => {
  const { senderAddressId, getAll } = event.data

  const options =
    {
      auth: {
        user: SENDCLOUD_PUBLIC_KEY,
        pass: SENDCLOUD_SECRET_KEY
      },
      baseUrl: 'https://panel.sendcloud.sc/api/v2',
      uri: `/shipping_methods`,
      method: 'GET',
      json: true
    }

  if (senderAddressId && getAll) return { error: "Specify either senderAddressId or getAll" }
  if (senderAddressId) options.qs = { sender_address: senderAddressId }
  else if (getAll) options.qs = { sender_address: 'all' }

  return request(options)
    .then(data =>  { return { data: data } })
    .catch(error => { return error })
}
