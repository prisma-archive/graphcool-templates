'use latest'
module.exports = (event) => {
  let sg = require("sendgrid")(___SENDGRID_API_KEY___)

  return new Promise((resolve, reject) => {
    let request = sg.emptyRequest()
    const { email, firstName, lastName, isPaid } = event.data.User.node
    request.body = [{ email, first_name: firstName, last_name: lastName, LPA_paid: isPaid, SOURCE: "LPA" }]
    request.method = "POST"
    request.path = "/v3/contactdb/recipients"

    sg.API(request, (error, response) => {
      let request = sg.emptyRequest()
      request.method = 'POST'
      request.path = '/v3/contactdb/lists/___SENDGRID_LIST_ID___/recipients/' + response.body.persisted_recipients[0]
      sg.API(request, (error, response) => (error ? reject(error) : resolve(response)))
    })
  })
}
