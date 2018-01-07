'use latest'

const geolib = require('geolib')
const { fromEvent } = require('graphcool-lib')

module.exports = function (event) {
  if (!event.context.graphcool.pat) {
    console.log('Please provide a valid root token!')
    return { error: 'Email Authentication not configured correctly.'}
  }

  const { lat, lng } = event.data
  const api = fromEvent(event).api('simple/v1')

  // query graphcool and return data in a format that is readable by geolib
  return api.request(`query { allPlaces{ id name geoloc } }`).then(places => {
    const fPlaces = places.allPlaces.reduce((result, place) => {
      result[place.id] = { latitude: place.geoloc.lat, longitude: place.geoloc.lng } 
      return result
    }, {})
    
    // order places by distance with geolib
    const results = geolib.orderByDistance({latitude: 51.515, longitude: 7.453619}, fPlaces );

    // merge original data with distance results
    const fullResults = results.map(x => Object.assign(x, places.allPlaces.find(y => y.id == x.key)));
    return { data: fullResults };
  })
}