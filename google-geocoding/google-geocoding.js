require('isomorphic-fetch')

module.exports = function (event) {
  var baseUrl = 'https://maps.googleapis.com/maps/api/geocode/json'
  var apiKey = '__GOOGLE_API_KEY__'

  // Here we're merging contents of three inputs – country, city and street.
  // You could also have this be just one freestyle address input
  var address = encodeURI([event.data.street, event.data.city, event.data.country].join('+').replace(/\s/g, '+'))

  // Let's create the url to call
  var apiUrl = baseUrl + '?address=' + address + '&result_type=street_address&key=' + apiKey
  
  return fetch(apiUrl)
      .then((res) => { return res.json() })
      .then((json) => {
        var geoLocation = {
          lat: json.results[0].geometry.location.lat,
          lng: json.results[0].geometry.location.lng,
          street: json.results[0].address_components[1].long_name + ' ' + json.results[0].address_components[0].long_name,
          area: json.results[0].address_components[2].long_name,
          city: json.results[0].address_components[3].long_name,
          country: json.results[0].address_components[5].long_name
        }

        // Let's merge the existing location data with Google response
        var eventData = Object.assign(event.data, geoLocation)
        event.data = eventData
        return event
      })
}