module.exports = function (event) {
  var sg = require('sendgrid')(__SENDGRID_SECRET_KEY__)
  var request = sg.emptyRequest()
  request.body = [{
    'email': event.data.User.node.email,
    'first_name': event.data.User.node.nameFirst,
    'last_name': event.data.User.node.nameLast
  }];
  request.method = 'POST'
  request.path = '/v3/contactdb/recipients'
  return new Promise(function(resolve, reject) {
    sg.API(request, function (error, response) {
      console.log(response.body.persisted_recipients[0])
      var request = sg.emptyRequest()
      request.method = 'POST'
      request.path = '/v3/contactdb/lists/___SENDGRID_LIST_ID___/recipients/' + response.body.persisted_recipients[0]
      sg.API(request, function (error, response) {
        if (error) {
          console.log('Error response received')
          reject(error)
        }
        resolve(response)
      })
    })
  })
}
