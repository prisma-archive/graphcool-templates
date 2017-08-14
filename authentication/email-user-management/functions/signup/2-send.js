"use latest"
module.exports = (event) => {
	const { email, confirmToken, firstName, lastName } = event.data.User.node

	if (!confirmToken) { return null }

	let helper = require("sendgrid").mail
	const fromEmail = new helper.Email("email@mywebsite.com", "Me")
	const subject = "Please confirm your email"
	const toEmail = new helper.Email(email, firstName + " " + lastName)
	const content = new helper.Content("text/html", "<a href='https://www.MyWebsite.com/confirm?token=" + confirmToken + "&email=" + email + "'>Click here to confirm your email.</a>")
	let mail = new helper.Mail(fromEmail, subject, toEmail, content)

	mail.personalizations[0].addSubstitution(new helper.Substitution("-firstname-", firstName))
	mail.personalizations[0].addSubstitution(new helper.Substitution("-message-", "Dear " + firstName + ",<br /><br />Please click the link below to confirm your email address. If you require further assistance, contact us anytime by replying to this email."))

	mail.setTemplateId("__TEMPLATE_ID__")

	const asm = new helper.Asm(2911, [2913])
	mail.setAsm(asm)

	let sg = require("sendgrid")("__SENDGRID_API__")

	return new Promise((resolve, reject) => {
		let request = sg.emptyRequest()
		request.body = mail.toJSON()
		request.method = "POST"
		request.path = "/v3/mail/send"
		sg.API(request, (error, response) => {
			console.log(error)
			console.log(response)
			return error ? reject(error) : resolve(response)
		})
	})
}
