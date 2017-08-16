'use latest'

const request = require('request-promise')

module.exports = (event) => {
  const options =
    {
      baseUrl: 'http://quotes.rest/',
      uri: '/qod/categories',
      method: 'GET',
      json: true
    }

  return request(options)
  	.then(data =>  { return { data: data } })
    .catch(error => { return { error: error } })
}
