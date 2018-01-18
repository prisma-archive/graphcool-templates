// const resetPassword = gql`
// mutation resetPassword($passwordResetCode: ID!) {
//   resetPassword(id: $passwordResetCode) {
//     result
//   }
// }
// `

import { fromEvent, FunctionEvent } from 'graphcool-lib'
import { GraphQLClient } from 'graphql-request'

import * as moment from 'moment';
import * as bcrypt from 'bcryptjs'
import * as fetch from 'isomorphic-fetch';
import * as Base64 from 'Base64'
import * as FormData from 'form-data'
import * as uuidv4 from 'uuid/v4'

interface EventData {
  id: string
}

interface UpdatedUser {
  id: string
  name: string
  email: string
}

interface User {
  id: string
  name: string
  email: string
}

interface PasswordResetCode {
  id: string
  createdAt: Date
  user: User
}

const SALT_ROUNDS = 10

// 2. Mailgun data
const MAILGUN_API_KEY = process.env['MAILGUN_API_KEY'];
const MAILGUN_SUBDOMAIN = process.env['MAILGUN_SUBDOMAIN'];
const LOGIN_URL = process.env['LOGIN_URL'];

const apiKey = `api:key-${MAILGUN_API_KEY}`;
const mailgunUrl = `https://api.mailgun.net/v3/${MAILGUN_SUBDOMAIN}/messages`;

export default async (event: FunctionEvent<EventData>) => {
  console.log(event)

  try {
    const passwordResetCodeId = event.data.id;
    const api = fromEvent(event).api('simple/v1')

    // use the ID to get the passwordResetItem node
    const passwordResetItem: PasswordResetCode = await getPasswordResetCode(api, passwordResetCodeId)
    .then(r => r.PasswordResetCode)

    // check if it exists
    if (!passwordResetItem || !passwordResetItem.id || !passwordResetItem.user) {
      return { error: `Password reset not successful 1 ${JSON.stringify(passwordResetItem)}` }
    }

    // check the time stamp - 2 hours to reset password
    const now = moment();
    const createdAt = moment(passwordResetItem.createdAt);
    if ( moment(now).isBefore(createdAt.subtract(2,'hours')) ) {
      return { error: 'Password reset not successful 3' }
    }

    // create password hash
    const newPassword = uuidv4();
    const salt = bcrypt.genSaltSync(SALT_ROUNDS)
    const newPasswordHash = await bcrypt.hash(newPassword, salt)

    // everything checks out then change password
    const userWithNewPassword: UpdatedUser = await setUserPassword(api, passwordResetItem.user.id, newPasswordHash)

    // check if user exists
    if (!userWithNewPassword || !userWithNewPassword.id) {
      return { error: 'Password reset not successful 4' }
    }

    const { name, email } = userWithNewPassword
    console.log(email)
    // Prepare body of POST request
    const form = new FormData()
    form.append('from', `team <no-reply@your-domain.com>`)
    form.append('to', `${name} <${email}>`)
    form.append('subject', 'New password')
    form.append('text', `Dear ${name} \n\n You've reset your password. If this was not you please contact us immediately on support@your-domain.com \n\n Your new password is: ${newPassword}\n\n Thank you, \n\n X team`)

    // // 4. Send request to Mailgun API
    const resultOfMailGunPost = await fetch(mailgunUrl, {
      headers: { 'Authorization': `Basic ${Base64.btoa(apiKey)}`},
      method: 'POST',
      body: form
    }).then( res => res )

    // console.log(resultOfMailGunPost)
    // console.log(resultOfMailGunPost.status)

    if (!resultOfMailGunPost || resultOfMailGunPost.status!==200) {
      return { error: 'Failed to send email with mailgun' }
    }
    
    return { data: { result: true } }
  } catch (e) {
    console.log(e)
    return { error: 'An unexpected error occured during password reset.' }
  }
}

async function getPasswordResetCode(api: GraphQLClient, id: string): Promise<{PasswordResetCode}> {
  const query = `
    query getPasswordResetCode($id: ID!) {
      PasswordResetCode(id: $id) {
        id
        createdAt
        user {
          id
          name
          email
        }
      }
    }
  `
  const variables = { id }
  return api.request<{PasswordResetCode}>(query, variables)
}

async function setUserPassword(api: GraphQLClient, id: string, newPassword: string): Promise<UpdatedUser> {
  const mutation = `
    mutation updateUser($id: ID!, $newPassword: String!) {
      updateUser(id: $id, password: $newPassword) {
        id
        name
        email
      }
    }
  `
  const variables = { id, newPassword }
  return api.request<{updateUser: UpdatedUser}>(mutation, variables)
  .then(r => r.updateUser)
}