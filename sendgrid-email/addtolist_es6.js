'use latest'
module.exports = (event) => {
  let sg = require('sendgrid')(___SENDGRID_API_KEY___)

  return new Promise((resolve, reject) => {
    let request = sg.emptyRequest()
    const { email, nameFirst: first_name, nameLast: last_name } = event.data.User.node
    request.body = [{ email, first_name, last_name }]
    request.method = 'POST'
    request.path = '/v3/contactdb/recipients'

    callAPI(request).then(response => {
      let request = sg.emptyRequest()
      request.method = 'POST'
      request.path = '/v3/contactdb/lists/___SENDGRID_LIST_ID___/recipients/' + response.body.persisted_recipients[0]

      callAPI(request)
        .then(response => resolve(response))
        .catch(error => reject(error))
    })
  })
}

function callAPI(sg, request) {
  return new Promise((resolve, reject) => {
    sg.API(request, (error, response) => (error ? reject(error) : resolve(response)))
  })
}
