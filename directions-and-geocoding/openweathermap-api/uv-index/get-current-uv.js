'use latest'

const urlencode = require('urlencode')
require('isomorphic-fetch')

const ACCESS_TOKEN = '__API_KEY__'
const api = 'https://api.openweathermap.org/data/2.5/uvi'

module.exports = (event) => {
  const { lat, lon } = event.data

  const endpoint = `${api}?lat=${lat}&lon=${lon}&appid=${ACCESS_TOKEN}`

  return fetch(endpoint)
    .then(response => response.json())
  	.then(data =>
      (data)
        ? {data: {uvdata: data}}
        : {error: "Something went wrong!"}
    )
}
