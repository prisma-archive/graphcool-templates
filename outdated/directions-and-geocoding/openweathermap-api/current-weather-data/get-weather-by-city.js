'use latest'

const urlencode = require('urlencode')
require('isomorphic-fetch')

const ACCESS_TOKEN = '__API_KEY__'
const api = 'https://api.openweathermap.org/data/2.5/weather'
const units = 'metric' //or 'standard', or 'imperial'

module.exports = (event) => {
  const { city } = event.data

  const endpoint = `${api}?q=${city}&units=${units}&appid=${ACCESS_TOKEN}`

  return fetch(endpoint)
    .then(response => response.json())
    .then(data => {
      if (data.cod == 200) {
        data.owid = data.id;
        return {data: data}
      }
      else {
        return {error: data}
      }
    })
}
