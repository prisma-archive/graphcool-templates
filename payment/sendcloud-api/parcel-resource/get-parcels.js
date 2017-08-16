'use latest'

const request = require('request-promise')

const SENDCLOUD_PUBLIC_KEY = '__PUBLIC_KEY__'
const SENDCLOUD_SECRET_KEY = '__SECRET_KEY__'

module.exports = (event) => {
  const { limit, offset } = event.data

  const options =
    {
      auth: {
      	user: SENDCLOUD_PUBLIC_KEY,
      	pass: SENDCLOUD_SECRET_KEY
      },
      baseUrl: 'https://panel.sendcloud.sc/api/v2',
      uri: `/parcels`,
      qs: {
        limit: limit || 100,
        offset: offset || 0
      },
      method: 'GET',
      json: true
    }

  return request(options)
  	.then(data =>  { return {data: data} })
    .catch(error => { return error })
}
