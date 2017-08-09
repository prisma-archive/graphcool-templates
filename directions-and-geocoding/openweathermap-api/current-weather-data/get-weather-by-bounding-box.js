'use latest'

const urlencode = require('urlencode')
require('isomorphic-fetch')

const ACCESS_TOKEN = '__API_KEY__'
const api = 'https://api.openweathermap.org/data/2.5/box'
const units = 'metric' //or 'standard', or 'imperial'

module.exports = (event) => {
  const { lonLeft, latBottom, lonRight, latTop, zoom, cluster } = event.data

  const endpoint = `${api}?bbox=${lonLeft},${latBottom},${lonRight},${latTop},${zoom}&cluster=${cluster ? 'yes' : 'no'}&units=${units}&appid=${ACCESS_TOKEN}`

  return fetch(endpoint)
    .then(response => response.json())
  	.then(data =>
      (data.cod == 200)
        ? {data: data}
        : {error: data}
    )
}
