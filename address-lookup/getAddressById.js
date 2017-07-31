'use latest'
const request = require('request-promise')

const POSTCODE_API_KEY = '__API_KEY__'

module.exports = function getAddress(event) {
  return new Promise((resolve, reject) => {
    const { id } = event.data
    request({
      url: `https://api.postcodeapi.nu/v2/addresses/${id}`,
      headers: { 'X-Api-Key': POSTCODE_API_KEY }
    })
    .then(data => {
      const result = JSON.parse(data)
      if (result) {
        const { city: { label: city }, street, id } = result
        resolve({ data: { street, city, id } })
      } else {
        resolve({error: `No result for id '${id}'}`)
      }
    })
    .catch(err => resolve({ error: "An unexpected error occured" }))
  })
}
