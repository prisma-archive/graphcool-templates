require('isomorphic-fetch')

module.exports = function (event) {
  const baseUrl = 'https://maps.googleapis.com/maps/api/geocode/json'
  const apiKey = '__GOOGLE_API_KEY__'

  // Here we're merging contents of three inputs – country, city and street.
  // You could also have this be just one freestyle address input

  // this RegEx replaces spaces with plus signs to fulfill the requirements of the Google geocode API
  const addressInput = [event.data.street, event.data.city, event.data.country].join('+').replace(/\s/g, '+')
  const address = encodeURI(addressInput)

  // Let's create the url to call
  const apiUrl = `${baseUrl}?address=${address}&result_type=street_address&key${apiKey}`

  return fetch(apiUrl)
    .then((res) => res.json())
    .then((json) => {
      const location = json.results[0].geometry.location
      const addressComponents = json.results[0].address_components
      const geoLocation = {
        lat: location.lat,
        lng: location.lng,
        street: `${addressComponents[1].long_name} ${addressComponents[0].long_name}`,
        area: addressComponents[2].long_name,
        city: addressComponents[3].long_name,
        country: addressComponents[5].long_name
      }

      // Let's merge the existing location data with Google response
      const eventData = Object.assign(event.data, geoLocation)
      return {data: eventData}
    })
    .catch(err => {
      console.log(err)
      return({
        error: {
          fullError: err,
          userError: 'Something unexpected happened when checking your address, please try again.'
        })
      })
    })
}
