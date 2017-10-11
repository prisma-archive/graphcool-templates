const Pusher = require('pusher')

module.exports = event => {
  console.log(event)

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

  return new Promise((resolve, reject) => {
    pusher.trigger(
      pusherChannels,
      pusherEvent, {
        'message': pusherMessage
      },
      (error, request, response) => {
        if (error) {
          console.log('Event could not be pushed.')
          console.log(error)
          return reject({})
        } else {
          console.log(response)

          return resolve({
            data: {
              success: true
            }
          })
        }
      }
    )
  })
  .catch(error => {
    console.log(error)
    return {
      error: 'Unexpected error occured.'
    }
  })
}
