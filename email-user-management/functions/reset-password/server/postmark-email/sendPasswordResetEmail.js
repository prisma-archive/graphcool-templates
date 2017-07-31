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
    'From': 'mike@sagecomm.com',
    'TemplateId': 2508781,
    'To': email,
    'TemplateModel': {
      'firstName': firstName,
      'action_url': `http://localhost:3000/reset/${resetToken}`,
      'login_url': 'http://www.academicacareers.com/user',
      'username': email,
      'support_email': 'info@academicacareers.com',
      'live_chat_url': 'testchat@academicacareers.com',
      'help_url': 'http://www.academicacareers.com'
    }
  }, function (error, result) {
    if (error) {
      return console.log('error ' + error.message)
    }
    return console.log('Sent via postmark' + result)
  })
}
