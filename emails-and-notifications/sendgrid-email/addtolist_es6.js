'use latest'
module.exports = (event) => {
  let sg = require("sendgrid")(___SENDGRID_API_KEY___)

  return new Promise((resolve, reject) => {
    let request = sg.emptyRequest()
    
    // add SG custom fields here
    const { email, nameFirst: first_name, nameLast: last_name } = event.data.User.node
    request.body = [{ email, first_name, last_name }]
    request.method = "POST"
    request.path = "/v3/contactdb/recipients"

    // this call creates a new recipient in Sendgrid
    // and adds it to the global list "All contacts"
    callAPI(sg, request).then(response => {
      
      // this call adds newly created recipient to a specific list (not required)
      let request = sg.emptyRequest()
      request.method = 'POST'
      request.path = '/v3/contactdb/lists/___SENDGRID_LIST_ID___/recipients/' + response.body.persisted_recipients[0]

      callAPI(sg, request)
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
