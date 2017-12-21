// const sendResetPasswordEmail = gql`
// mutation sendResetPasswordEmail($email: String!) {
//   sendResetPasswordEmail(email: $email) {
//     result
//   }
// }
// `

import { fromEvent, FunctionEvent } from 'graphcool-lib'
import { GraphQLClient } from 'graphql-request'

// 1. Import npm modules
import * as fetch from 'isomorphic-fetch';
import * as Base64 from 'Base64'
import * as FormData from 'form-data'

interface EventData {
  email: string
}

interface User {
  id: string
  name: string
  email: string
  emailVerified: string
}

interface PasswordResetCode {
  id: string
}

// 2. Mailgun data
const MAILGUN_API_KEY = process.env['MAILGUN_API_KEY'];
const MAILGUN_SUBDOMAIN = process.env['MAILGUN_SUBDOMAIN'];
const PASSWORD_RESET_URL = process.env['PASSWORD_RESET_URL'];

const apiKey = `api:key-${MAILGUN_API_KEY}`;
const mailgunUrl = `https://api.mailgun.net/v3/${MAILGUN_SUBDOMAIN}/messages`;

export default async (event: FunctionEvent<EventData>) => {
  try {
    // create simple api client
    const { email } = event.data
    const api = fromEvent(event).api('simple/v1');

    // get user by email
    const user: User = await getUserByEmail(api, email)
    .then(r => r.User)

    // no user with this email
    if (!user) {
      return { error: 'Error on password reset' }
    }

    // check if email has been verified
    if (!user.emailVerified) {
      return { error: 'Email not verified!' }
    }

    const passwordResetCode: string = await createPasswordResetCode(api,user.id)

    // no data with this response
    if (!passwordResetCode) {
      return { error: 'error on createPasswordResetCode' }
    }

    const passwordResetUrl =`${PASSWORD_RESET_URL}/?passwordResetCode=${passwordResetCode}`;
    
    // // 3. Prepare body of POST request
    const form = new FormData()
    form.append('from', `<no-reply@youremail.com>`)
    form.append('to', `${user.name} <${user.email}>`)
    form.append('subject', 'Password reset link')
    form.append('text', `A request to reset your password has been submitted. If this was not you please contact us immediately on support@youremail.com \n\n Please click on the following link to verify your email: ${passwordResetUrl} \n\n Or enter the following code: ${passwordResetCode} \n\n Thank you! \n\nTeam`)

    // // 4. Send request to Mailgun API
    const resultOfMailGunPost = await fetch(mailgunUrl, {
      headers: { 'Authorization': `Basic ${Base64.btoa(apiKey)}`},
      method: 'POST',
      body: form
    }).then( res => res )

    if (!resultOfMailGunPost) {
      return { error: 'Failed to send email with mailgun' }
    }

    return { data: { result: true } }

    // return resultOfMailGunPost;
  } catch (e) {
    console.log(e)
    return { error: 'An unexpected error occured during creation of passwordResetCode and sending the URL.' }
  } 
}

async function getUserByEmail(api: GraphQLClient, email: string): Promise<{ User }> {
  const query = `
    query getUserByEmail($email: String!) {
      User(email: $email) {
        id
        name
        email
        emailVerified
      }
    }
  `
  const variables = { email }
  return api.request<{ User }>(query, variables)
}

async function createPasswordResetCode(api: GraphQLClient, userId: string): Promise<string> {
  const mutation = `
    mutation createPasswordResetCode($userId: ID) {
      createPasswordResetCode(userId: $userId) {
        id
      }
    }
  `
  const variables = { userId }
  return api.request<{ createPasswordResetCode: PasswordResetCode }>(mutation, variables)
  .then(r => r.createPasswordResetCode.id)
}