'use latest'

const urlencode = require('urlencode')
require('isomorphic-fetch')

const ACCESS_TOKEN = '__ACCESS_TOKEN__'
const directions = 'https://api.mapbox.com/directions/v5/mapbox/walking/'

module.exports = function getSteps(event) {
  const {
    startLng,
    startLat,

    endLng,
    endLat,
  } = event.data

  const coordinates = urlencode(`${startLng},${startLat};${endLng},${endLat}`)

  const endpoint = `${directions}${coordinates}.json?access_token=${ACCESS_TOKEN}&steps=true`

  return fetch(endpoint)
    .then(response => {
      return response.json()
    })
    .then(data => {
      if (data && data.routes && data.routes.length > 0) {
        const legs = data.routes[0].legs
        const z = legs.map(leg => {
          return leg.steps
        })
        const t = z[0].map(step => {
          return step.maneuver.instruction
        })
        let steps = {maneuvers: t}

        return {data: {steps: steps}}
      } else {
        return {error: "Could not get directions for given start and end locations!"}
      }
    })
}
