'use latest'

const request = require('request-promise')

const SENDCLOUD_PUBLIC_KEY = '__PUBLIC_KEY__'
const SENDCLOUD_SECRET_KEY = '__SECRET_KEY__'

module.exports = (event) => {
  const { parcels } = event.data

  const options =
    {
      auth: {
        user: SENDCLOUD_PUBLIC_KEY,
        pass: SENDCLOUD_SECRET_KEY
      },
      baseUrl: 'https://panel.sendcloud.sc/api/v2',
      uri: `/labels`,
      method: 'POST',
      body: { label: { parcels: parcels } },
      json: true
    }

  return request(options)
    .then(data => { return { data: data.label } })
    .catch(error => { return { error: error } })
}
