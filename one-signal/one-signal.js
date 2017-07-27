// replace OneSignal app id and key
const APP_ID = '__ID__'
const APP_KEY = '__KEY__'

module.exports = function (event) {
  console.log(event.data)
  const location = event.data.location
  const message = {
    app_id: APP_ID,
    contents: {
      'en': `New event! ${event.data.description.substr(0,20)} ...`
    },
    filters: [
      {
        field: 'location',
        radius: 25000, // 25km
        lat: location.latitude,
        long: location.longitude
      }
    ]
  }
  sendNotification(message)
}

const sendNotification = function(data) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': APP_KEY
  }

  const options = {
    host: 'onesignal.com',
    port: 443,
    path: '/api/v1/notifications',
    method: 'POST',
    headers: headers
  }

  const https = require('https')
  const req = https.request(options, function(res) {
    res.on('data', function(data) {
      console.log('Response:')
      console.log(JSON.parse(data))
    })
  })

  req.on('error', function(e) {
    console.log('ERROR:')
    console.log(e)
  })

  req.write(JSON.stringify(data))
  req.end()
}
