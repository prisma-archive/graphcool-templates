'use latest'

const urlencode = require('urlencode')
require('isomorphic-fetch')

const ACCESS_TOKEN = '__API_KEY__'
const api = 'https://api.openweathermap.org/data/2.5/uvi/history'

module.exports = (event) => {
  const { lat, lon, start, end } = event.data

  const endpoint = `${api}?lat=${lat}&lon=${lon}&start=${start}&end=${end}&appid=${ACCESS_TOKEN}`

  return fetch(endpoint)
    .then(response => response.json())
  	.then(data =>
      (data)
        ? {data: data}
        : {error: "Something went wrong!"}
    )
}
