// Setup Twilio client
const accountSid = process.env['TWILIO_ACCOUNT_SID']
const authToken = process.env['TWILIO_AUTH_TOKEN']
const client = require('twilio')(accountSid, authToken)

module.exports = event => {

  if (!process.env['TWILIO_ACCOUNT_SID']) {
    console.log('Please provide a valid twilio account sid!')
    return { error: 'Module not configured correctly.' }
  }

  if (!process.env['TWILIO_AUTH_TOKEN']) {
    console.log('Please provide a valid twilio auth token!')
    return { error: 'Module not configured correctly.' }
  }

  const to = event.data.to
  const from = event.data.from
  const body = event.data.body
  const mediaUrl = event.data.mediaUrl

  return client.messages
    .create({
      to: to,
      from: from,
      body: body,
      mediaUrl: mediaUrl
    })
    .then((message) => {
      console.log(message.sid)
      return { data: { sid: message.sid } }
    })
    .catch(error => {
      console.log(error)
      return { error: "Unexpected error occured." }
    })
}
