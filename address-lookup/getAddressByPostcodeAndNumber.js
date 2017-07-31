'use latest'
const request = require('request-promise')

const POSTCODE_API_KEY = '__API_KEY__'

module.exports = function getAddress(event) {
  return new Promise((resolve, reject) => {
    const { postcode, number } = event.data
    request({
      url: `https://api.postcodeapi.nu/v2/addresses?postcode=${postcode}&number=${number}`,
      headers: { 'X-Api-Key': POSTCODE_API_KEY }
    })
    .then(data => {
      const result = JSON.parse(data)
      if (result._embedded.addresses.length) {
        const { city: { label: city }, street, id } = result._embedded.addresses[0]
        resolve({ data: { street, city, id } })
      } else {
        resolve({error: `No result for postcode '${postcode}' and number '${number}'`})
      }
    })
    .catch(err => resolve({ error: "An unexpected error occured" }))
  })
}
