var postmark = require('postmark')
var client = new postmark.Client('___TOKEN____')

module.exports = function (event) {
  const email = event.data.User.node.email
  const resetToken = event.data.User.node.resetToken
  const firstName = event.data.User.node.firstName

  if (!resetToken) {
    return
  }

  client.sendEmailWithTemplate({
    'From': 'mike@example.com',
    'TemplateId': 2508781,
    'To': email,
    'TemplateModel': {
      'firstName': firstName,
      'action_url': `http://localhost:3000/reset/${resetToken}`,
      'login_url': 'http://www.example.com/user',
      'username': email,
      'support_email': 'info@example.com',
      'live_chat_url': 'testchat@example.com',
      'help_url': 'http://www.example.com'
    }
  }, function (error, result) {
    if (error) {
      return console.log('error ' + error.message)
    }
    return console.log('Sent via postmark' + result)
  })
}
