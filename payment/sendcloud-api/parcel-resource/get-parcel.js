'use latest'

const request = require('request-promise')

const SENDCLOUD_PUBLIC_KEY = '__PUBLIC_KEY__'
const SENDCLOUD_SECRET_KEY = '__SECRET_KEY__'

module.exports = (event) => {
  const { parcelId } = event.data

  const options =
    {
      auth: {
      	user: SENDCLOUD_PUBLIC_KEY,
      	pass: SENDCLOUD_SECRET_KEY
      },
      baseUrl: 'https://panel.sendcloud.sc/api/v2',
      uri: `/parcels/${parcelId}`,
      method: 'GET',
      json: true
    }

  return request(options)
  	.then(data =>  {
      // Workaround for api-bug #224
      data.parcel.parcelId = data.parcel.id
      return { data: data.parcel }
    })
    .catch(error => { return { error: error } })
}
