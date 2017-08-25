var aws = require("aws-sdk");

var ses = new aws.SES({"accessKeyId": "__ID__", "secretAccessKey": "__SECRET__", "region": "us-west-2"});

exports.handler = (event, context, callback) => {
    var obj = JSON.parse(event.body)
    var user = obj.data.User.node
    var email = user.email
    var resetToken = user.resetToken
    var subject = "Reset Your Password"

    var eParams = {
      Destination: {
        ToAddresses: [email]
      },
      Message: {
        Body: {
          Html: {
            Data: `
              <html>
                  <head>
                    <title>reset your password</title>
                  </head>
                  <body>
                    <p>Hi ${email}</p>
                    <p><a href="https://example.com/reset?token=${resetToken}&email=${email}">Click here to reset your password.</a></p>
                  </body>
              </html>
            `
          }
        },
        Subject: {
          Data: subject
        }
      },
      Source: "example@example.com",
      ReplyToAddresses: ["example@example.com"],
      ReturnPath: "example@example.com"
    };
    
    ses.sendEmail(eParams, function (err, data) {
      if (err) {
        console.log(err);
      } else {
        console.log(data);
      }
    });
};