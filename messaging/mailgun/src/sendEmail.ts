import * as fetch from 'isomorphic-fetch'
import * as FormData from 'form-data'
import { FunctionEvent } from 'graphcool-lib'


interface EventData {
  tag: string
  from: string
  to: [string]
  subject: string
  text: string
  recipientVariables: Object | null
}

export default async (event: FunctionEvent<EventData>) => {
  console.log(event)

  if (!process.env['MAILGUN_API_KEY']) {
    console.log('Please provide a valid mailgun secret key!')
    return { error: 'Module not configured correctly.' }
  }

  if (!process.env['MAILGUN_DOMAIN']) {
    console.log('Please provide a valid mailgun domain!')
    return { error: 'Module not configured correctly.' }
  }

  try {
    const token = new Buffer(`api:${process.env['MAILGUN_API_KEY']}`).toString('base64')
    const endpoint = `https://api.mailgun.net/v3/${process.env['MAILGUN_DOMAIN']}/messages`

    const { tag, to, from, subject, text } = event.data
    const recipientVariables = event.data.recipientVariables || {}

    if (to.length > 1000) {
      return { error: `Can't batch more than 1000 emails!` }
    }

    const form = new FormData()
    form.append('from', from)

    for (var i = 0; i < to.length; i++) {
      form.append('to', to[i])
    }

    form.append('subject', subject)
    form.append('text', text)
    form.append('recipient-variables', JSON.stringify(recipientVariables))

    const data = await fetch(endpoint, {
      headers: {
        'Authorization': `Basic ${token}`
      },
      method: 'POST',
      body: form
    })
      .then(response => response.json())

    return { data: { success: true } }
  } catch(e) {
    console.log(`Email could not be sent because an error occured:`)
    console.log(e)
    return { error: 'An unexpected error occured while sending email.' }
  }
}
