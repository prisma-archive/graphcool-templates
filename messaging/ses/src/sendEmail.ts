import * as aws from 'aws-sdk';
import { FunctionEvent } from 'graphcool-lib';

const ses = new aws.SES({
  region: process.env.REGION,
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
})


interface EventData {
  from: string
  to: [string]
  subject: string
  text: string
  html: string
}




export default async (event: FunctionEvent<EventData>) => {
  console.log(event)

  console.log(process.env)

  if (!process.env['ACCESS_KEY_ID']) {
    console.log('Please provide a valid AWS Access Key ID!')
    return { error: 'Module not configured correctly.' }
  }

  if (!process.env['SECRET_ACCESS_KEY']) {
    console.log('Please provide a valid AWS Secret Access Key!')
    return { error: 'Module not configured correctly.' }
  }

  if (!process.env['REGION']) {
    console.log(`Please provide a valid AWS region, for example 'us-east-2'!`)
    return { error: 'Module not configured correctly.' }
  }

  try {

    const { to, from, subject, text, html } = event.data

    const params = {
      Destination: {
        ToAddresses: to
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

    await new Promise((resolve, reject) => {
      ses.sendEmail(params, (err) => {
        if (err) {
          throw new Error(JSON.stringify(err))
        } else {
          resolve({})
        }
      })
    })

    return { data: { success: true } }

  } catch(e) {
    console.log(`Email could not be sent because an error occured:`)
    console.log(e)
    return { error: 'An unexpected error occured while sending email.' }
  }
}
