'use latest'

const request = require('request-promise')

const SENDCLOUD_PUBLIC_KEY = '__PUBLIC_KEY__'
const SENDCLOUD_SECRET_KEY = '__SECRET_KEY__'
const SENDCLOUD_PARTNER_ID = null

module.exports = (event) => {
  const { parcel } = event.data

  const options =
    {
      auth: {
        user: SENDCLOUD_PUBLIC_KEY,
        pass: SENDCLOUD_SECRET_KEY
      },
      baseUrl: 'https://panel.sendcloud.sc/api/v2',
      uri: `/parcels`,
      method: 'POST',
      body: parcel,
      json: true
    }

  if (SENDCLOUD_PARTNER_ID)
  {
    options.headers = { 'Sendcloud-Partner-Id', SENDCLOUD_PARTNER_ID }
  }

  return request(options)
    .then(data =>  { return { data: { result: data } } })
    .catch(error => { return { error: error } })
}
