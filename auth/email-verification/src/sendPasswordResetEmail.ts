import { fromEvent, FunctionEvent } from 'graphcool-lib'
import { GraphQLClient } from 'graphql-request'

import * as validator from 'validator'
import * as fetch from 'isomorphic-fetch';
import * as Base64 from 'Base64'
import * as FormData from 'form-data'

interface EventData {
  id: string
  name: string
  email: string
}

interface AccountActivationCode {
  id: string
}

// 2. Mailgun data
const MAILGUN_API_KEY = process.env['MAILGUN_API_KEY'];
const MAILGUN_SUBDOMAIN = process.env['MAILGUN_SUBDOMAIN'];
const ACCOUNT_ACTIVATION_URL = process.env['ACCOUNT_ACTIVATION_URL'];

const apiKey = `api:key-${MAILGUN_API_KEY}`;
const mailgunUrl = `https://api.mailgun.net/v3/${MAILGUN_SUBDOMAIN}/messages`;

export default async (event: FunctionEvent<EventData>) => {

  // check if user is authenticated
  if (!event.context.auth || !event.context.auth.nodeId) {
    return { data: null }
  }

  // check if root
  // if (event.context.auth.token!==event.context.graphcool.rootToken) {
  if (event.context.auth.typeName!=='PAT') {
    return { error: 'Insufficient permissions 1' }
  }

  try {

    const { id, name, email } = event.data
    const api = fromEvent(event).api('simple/v1');

    if (!validator.isEmail(email)) {
      return { error: 'Not a valid email' }
    }
    
    const accountActivationCode: string = await createUserAccountActivationCode(api, id)
    
    // no data with this response
    if (!accountActivationCode) {
      return { error: 'error on createUserVerification' }
    }

    const accountActivationUrl =`${ACCOUNT_ACTIVATION_URL}/?accountActivationCode=${accountActivationCode}`;
    
    // // 3. Prepare body of POST request
    const form = new FormData()
    form.append('from', `Team <no-reply@your-domain.com>`)
    form.append('to', `${name} <${email}>`)
    form.append('subject', 'Activate your account')
    form.append('text', `Click on the link below to activate your account:
    
    ${accountActivationUrl}
    
    Thank you,
    
    Team team
    
    If you never signed up to Team immediately email us at support@your-domain.com
    
    Activation code: ${accountActivationCode}`)

    // // 4. Send request to Mailgun API
    const resultOfMailGunPost = await fetch(mailgunUrl, {
      headers: { 'Authorization': `Basic ${Base64.btoa(apiKey)}`},
      method: 'POST',
      body: form
    }).then( res => res )

    if (!resultOfMailGunPost || resultOfMailGunPost.status!==200) {
      return { error: 'Failed to send email with mailgun' }
    }

    return { data: { result: true } }
  } catch (e) {
    console.log(e)
    return { error: 'An unexpected error occured during creation of verificationCode and sending the URL.' }
  }
}

async function createUserAccountActivationCode(api: GraphQLClient, userId: string): Promise<string> {
  const mutation = `
    mutation ($userId: ID!) {
      createAccountActivationCode(userId: $userId) {
        id
      }
    }
  `;

  const variables = { userId }
  return api.request<{ createAccountActivationCode: AccountActivationCode }>(mutation, variables)
  .then(r => r.createAccountActivationCode.id)
}