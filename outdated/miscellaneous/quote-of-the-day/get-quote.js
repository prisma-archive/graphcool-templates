'use latest'

const request = require('request-promise')

module.exports = (event) => {
  const { category } = event.data
  const options =
    {
      baseUrl: 'http://quotes.rest/',
      uri: 'qod.json',
      method: 'GET',
      json: true
    }

  if (category) options.qs = { category: category }

  return request(options)
    .then(data =>  { return { data: data } })
    .catch(error => { return { error: error } })
}
