import { fromEvent, FunctionEvent } from 'graphcool-lib'
import { GraphQLClient } from 'graphql-request'
import * as moment from 'moment'

interface EventData {
  id: string
}

interface User {
  id: string
}

interface AccountActivationCode {
  id: string
  createdAt: Date
  user: User
}

interface ActivatedUser {
  id: string
  accountActivated: boolean
}

export default async (event: FunctionEvent<EventData>) => {
  console.log(event)

  try {
    const accountActivationCodeId = event.data.id;
    const api = fromEvent(event).api('simple/v1')

    // use the ID to get the AccountActivationCode node
    const accountActivationCode: AccountActivationCode = await getAccountActivationCode(api, accountActivationCodeId)
      .then(r => r.AccountActivationCode)

    // check if it exists
    if (!accountActivationCode || !accountActivationCode.id) {
      return { error: 'User not activate not activated 1' }
    }

    // check the time stamp - 12 hours to verify an email address
    const now = moment();
    const createdAt = moment(accountActivationCode.createdAt);
    if ( moment(now).isBefore(createdAt.subtract(12,'hours')) ) {
      return { error: 'User not activate not activated 2' }
    }

    // everything checks out then set accountActivated on user to true and return true
    const activatedUser: ActivatedUser = await activateUserAccount(api, accountActivationCode.user.id)

    // check if user exists and was updated
    if (!activatedUser || !activatedUser.id) {
      return { error: 'User not activate not activated 3' }
    }

    return { data: { result: true } }
  } catch (e) {
    console.log(e)
    return { error: 'An unexpected error occured during email verification.' }
  }
}

async function getAccountActivationCode(api: GraphQLClient, id: string): Promise<{ AccountActivationCode }> {
  const query = `
    query getAccountActivationCode($id: ID!) {
      AccountActivationCode(id: $id) {
        id
        createdAt
        user {
          id
        }
      }
    }
  `
  const variables = { id }
  return api.request<{AccountActivationCode}>(query, variables)
}

async function activateUserAccount(api: GraphQLClient, id: string): Promise<ActivatedUser> {
  const mutation = `
    mutation updateUser($id: ID!, $accountActivated: Boolean!) {
      updateUser(id: $id, accountActivated: $accountActivated) {
        id
      }
    }
  `
  const variables = { id, accountActivated: true }
  return api.request<{updateUser: ActivatedUser}>(mutation, variables)
  .then(r => r.updateUser)
}