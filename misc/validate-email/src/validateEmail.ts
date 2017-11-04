// 1. Import npm modules
import * as validator from 'validator'
import { FunctionEvent } from 'graphcool-lib'

// 2. Define type of event data
interface EventData {
  id: string
  name: string
  email: string
}

export default async (event: FunctionEvent<EventData>) => {
  // 3. Transform Email to lowercase
  event.data.email = event.data.email.toLowerCase()

  // 4. Validate Email
  if (!validator.isEmail(event.data.email)) {
    return { error: `${event.data.email} is not a valid email!` }
  }

  // 5. Return transformed data
  return { data: event.data }
}