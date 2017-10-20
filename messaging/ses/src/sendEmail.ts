import * as fetch from 'isomorphic-fetch';
import * as FormData from 'form-data';
import * as aws from 'aws-sdk';
import { FunctionEvent } from 'graphcool-lib';

const ses = new aws.SES({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});


interface EventData {
  from: string
  to: [string]
  subject: string
  text: string
  html: string
  recipientVariables: Object | null
}




export default async (event: FunctionEvent<EventData>) => {
  console.log(event)

  if (!process.env['AWS_ACCESS_KEY_ID']) {
    console.log('Please provide a valid AWS Access Key ID!');
    return { error: 'Module not configured correctly.' }
  }

  if (!process.env['AWS_SECRET_ACCESS_KEY']) {
    console.log('Please provide a valid AWS Secret Access Key!');
    return { error: 'Module not configured correctly.' }
  }

  try {

    // const token = new Buffer(`api:${process.env['AWS_ACCESS_KEY_ID']}`).toString('base64')
    // const endpoint = 'email-smtp.us-west-2.amazonaws.com'

    const { to, from, subject, text, html } = event.data
    const recipientVariables = event.data.recipientVariables || {}

    const params = {
      Destination: {
        ToAddresses: ['iamclaytonray@gmail.com']
      },
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: html
          },
          Text: {
            Charset: 'UTF-8',
            Data: text
          }
        },
        Subject: {
          Charset: 'UTF-8',
          Data: subject
        }
      },
      ReturnPath: from,
      Source: from
    }


    // if (to.length > 1000) {
    //   return { error: `Can't batch more than 1000 emails!` }
    // }

    // const form = new FormData()
    // form.append('from', from)

    // for (var i = 0; i < to.length; i++) {
    //   form.append('to', to[i])
    // }

    // form.append('subject', subject)
    // form.append('text', text)
    // form.append('recipient-variables', JSON.stringify(recipientVariables))

    // const data = await ses.sendEmail(err, params)
    // .then(response => response.json())

    ses.sendEmail(params, (err, data) => {
      if (err) {
        console.log(err, err.stack)
      } else {
        response => response.json()
      }
    })

    return { data: { success: true } }
  } catch(e) {
    console.log(`Email could not be sent because an error occured:`)
    console.log(e)
    return { error: 'An unexpected error occured while sending email.' }
  }
}
