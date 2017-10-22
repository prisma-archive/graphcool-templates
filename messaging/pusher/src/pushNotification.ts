import * as Pusher from 'pusher'
import { FunctionEvent } from 'graphcool-lib'


interface EventData {
  channels: [string]
  event: string
  message: string
}

export default async (event: FunctionEvent<EventData>) => {
  console.log(event)

  try {
    if (!process.env['PUSHER_APP_ID']) {
      console.log('Please provide a valid pusher app id!')
      return { error: 'Module not configured correctly.' }
    }

    if (!process.env['PUSHER_KEY']) {
      console.log('Please provide a valid pusher key!')
      return { error: 'Module not configured correctly.' }
    }

    if (!process.env['PUSHER_SECRET']) {
      console.log('Please provide a valid pusher secret!')
      return { error: 'Module not configured correctly.' }
    }

    if (!process.env['PUSHER_CLUSTER']) {
      console.log('Please provide a valid pusher cluster!')
      return { error: 'Module not configured correctly.' }
    }

    console.log(process.env)

    const pusher = new Pusher({
      appId: process.env['PUSHER_APP_ID'],
      key: process.env['PUSHER_KEY'],
      secret: process.env['PUSHER_SECRET'],
      cluster: process.env['PUSHER_CLUSTER'],
      encrypted: true
    })

    const pusherChannels = event.data.channels
    const pusherEvent = event.data.event
    const pusherMessage = event.data.message

    if (pusherChannels.length === 0) {
      return {
        error: 'You need to provide at least one channel!'
      }
    }

    if (pusherChannels.length > 10) {
      return {
        error: 'You cannot push to more than ten channels!'
      }
    }

    const data = await new Promise((resolve, reject) => {
      pusher.trigger(
        pusherChannels,
        pusherEvent, {
          'message': pusherMessage
        },
        (error, request, response) => {
          if (error) {
            console.log(error)
            throw new Error('Event could not be pushed.')
          } else {
            console.log(response)

            resolve(response)
          }
        }
      )
    })

    console.log('gu')
    return {
      data: {
        success: true
      }
    }
  } catch(e) {
    console.log(e)

    return {
      error: 'Unexpected error occured.'
    }
  }
}
