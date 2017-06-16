module.exports = function (event) {
  var helper = require('sendgrid@4.7.0').mail;
  console.log(helper)
  var fromEmail = new helper.Email('me@myemail.com');
  var toEmail = new helper.Email(event.data.node.email);
  var subject = 'Sending with SendGrid is Fun';
  var content = new helper.Content('text/plain', 'and easy to do anywhere, even with Node.js');
  var mail = new helper.Mail(fromEmail, subject, toEmail, content);
  var sg = require('sendgrid@4.7.0')(__SENDGRID_SECRET_KEY__);
  var request = sg.emptyRequest({
    method: 'POST',
    path: '/v3/mail/send',
    body: mail.toJSON()
  });

  sg.API(request, function (error, response) {
    if (error) {
      console.log('Error response received');
    }
    console.log(response.statusCode);
    console.log(response.body);
    console.log(response.headers);
  });
}
