'use latest'

const urlencode = require('urlencode')
require('isomorphic-fetch')

const ACCESS_TOKEN = '__ACCESS_TOKEN__'
const geocoding = 'https://api.mapbox.com/geocoding/v5/mapbox.places/'

module.exports = function getPlace(event) {
  const {
    lng,
    lat,
  } = event.data

  const coordinates = urlencode(`${lng},${lat}`)

  const endpoint = `${geocoding}${coordinates}.json?types=place&access_token=${ACCESS_TOKEN}`

  return fetch(endpoint)
    .then(response => {
      return response.json()
    })
    .then(data => {
      if (data && data.features && data.features.length > 0) {
        const place = data.features[0].place_name
        return {data: {place}}
      } else {
        return {error: "Could not find place at given location!"}
      }
    })
}
