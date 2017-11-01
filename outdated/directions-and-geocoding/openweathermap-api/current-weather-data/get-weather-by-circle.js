'use latest'

const urlencode = require('urlencode')
require('isomorphic-fetch')

const ACCESS_TOKEN = '__API_KEY__'
const api = 'https://api.openweathermap.org/data/2.5/find'
const units = 'metric' //or 'standard', or 'imperial'

module.exports = (event) => {
  const { lat, lon, count, cluster } = event.data

  const endpoint = `${api}?lat=${lat}&lon=${lon}&cnt=${count}&cluster=${cluster ? 'yes' : 'no'}&units=${units}&appid=${ACCESS_TOKEN}`

  return fetch(endpoint)
    .then(response => response.json())
  	.then(data =>
      (data.cod == 200)
        ? {data: data}
        : {error: data}
    )
}
