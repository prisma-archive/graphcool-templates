'use latest'
module.exports = (event) => {
  const { id, email, resetToken, firstName, lastName } = event.data.User.node

  if (!resetToken) {
    return null
  }

  let helper = require('sendgrid').mail
  const fromEmail = new helper.Email('me@example.com', 'Joe Shmoe')
  const subject = 'Reset your password'
  const htmlEmail =
`<html>
<head>
  <title>reset your password</title>
</head>
<body>
  <p>Hi -firstname-,</p>
  <p><a href="https://example.com/reset?token=${resetToken}&email=${email}">Click here to reset your password.</a></p>
</body>
</html>`
  const content = new helper.Content('text/html', htmlEmail)

  let mail = new helper.Mail()
  mail.setFrom(fromEmail)
  mail.setSubject(subject)

  let personalization = new helper.Personalization()
  const toEmail = new helper.Email(email, firstName + ' ' + lastName)
  personalization.addTo(toEmail)
  let substitution = new helper.Substitution('-firstname-', firstName)
  personalization.addSubstitution(substitution)
  mail.addPersonalization(personalization)

  mail.addContent(content)

  let sg = require('sendgrid')(___SENDGRID_API_KEY___)

  return new Promise((resolve, reject) => {
    let request = sg.emptyRequest()
    request.body = mail.toJSON()
    request.method = 'POST'
    request.path = '/v3/mail/send'
    sg.API(request, (error, response) => {
      console.log(error)
      console.log(response)
      return error ? reject(error) : resolve(response)
    })
  })
}
