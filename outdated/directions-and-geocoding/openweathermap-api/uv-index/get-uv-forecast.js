'use latest'

const urlencode = require('urlencode')
require('isomorphic-fetch')

const ACCESS_TOKEN = '__API_KEY__'
const api = 'https://api.openweathermap.org/data/2.5/uvi/forecast'

module.exports = (event) => {
  const { lat, lon, count } = event.data

  const endpoint = `${api}?lat=${lat}&lon=${lon}&cnt=${count}&appid=${ACCESS_TOKEN}`

  return fetch(endpoint)
    .then(response => response.json())
  	.then(data =>
      (data)
        ? {data: data}
        : {error: "Something went wrong!"}
    )
}
