const mailHelper = require('sendgrid').mail
const sendgrid = require('sendgrid')('__SENDGRID_SECRET_KEY__')
const fromEmail = new mailHelper.Email('from@email.com')
const model = 'User' // Or any model name you link this function to

const title = data => `Email subject with data ${data.id}`
const content = data => `Content with data ${data.id}`

const generateMail = data => new mailHelper.Mail(
  fromEmail,
  title(data),
  new mailHelper.Email(data.email),
  new mailHelper.Content('text/plain', content(data))
)

const generateRequest = mail => sendgrid.emptyRequest({
  method: 'POST',
  path: '/v3/mail/send',
  body: mail.toJSON()
})

module.exports = event => new Promise((resolve, reject) => sendgrid.API(
  generateRequest(generateMail(data)(event.data[model].node)), 
  (error, response) => {
    if (error) {
      console.log(error)
      return reject(error)
    }
    resolve(response)
  }
))
