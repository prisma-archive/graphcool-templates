import { FunctionEvent } from 'graphcool-lib'
import * as twilio from 'twilio'

interface EventData {
  to: string
  from: string
  body: string
  mediaUrl: string | null
}

export default async (event: FunctionEvent<EventData>) => {

  if (!process.env['TWILIO_ACCOUNT_SID']) {
    console.log('Please provide a valid twilio account sid!')
    return { error: 'Module not configured correctly.' }
  }

  if (!process.env['TWILIO_AUTH_TOKEN']) {
    console.log('Please provide a valid twilio auth token!')
    return { error: 'Module not configured correctly.' }
  }

  try {
    const accountSid = process.env['TWILIO_ACCOUNT_SID']
    const authToken = process.env['TWILIO_AUTH_TOKEN']
    const client = twilio(accountSid, authToken)
    
    const { to, from, body, mediaUrl } = event.data

    const data = await client.messages
      .create({
        to: to,
        from: from,
        body: body,
        mediaUrl: mediaUrl
      })

    return { data: { sid: data.sid } }
  } catch(error) {
    console.log(error)
    return { error: 'Unexpected error occured.' }
  }
}
