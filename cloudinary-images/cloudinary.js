const cloudinary = require('cloudinary@1.2.1')

module.exports = function (event) {
  cloudinary.config({
    cloud_name: '___CLOUDINARY_NAME___',
    api_key: '___CLOUDINARY_KEY___',
    api_secret: '___CLOUDINARY_SECRET___'
  })
  return new Promise(function(resolve, reject) {
    // The `transformation` option performs an on-the-fly image transformation: crops an image to a 400x400 circular thumbnail while automatically focusing on the face, and then scales down the result to a width of 200 pixels
    cloudinary.uploader.upload(event.data.UserAvatar.node.file.url, (result) => {
      console.log(result)
      resolve(result)
    }, {
      public_id: 'astroluv/avatars/' + event.data.UserAvatar.node.user.id,
      transformation: [
        {width: 200, height: 200, gravity: "face", radius: "max", crop: "thumb"}
      ]
    })
  })
  .then(function (response) {
    const request = require('request@2.81.0')
    const mutation = `mutation {
      updateUserAvatar(id: "${event.data.UserAvatar.node.id}", cloudinaryUrl: "${response.secure_url}") {
        id
        cloudinaryUrl
      }
    }`
    return new Promise(function(resolve, reject) {
      request.post({
        url: 'https://api.graph.cool/simple/v1/___PROJECT_ID___',
        headers: {
          'Authorization' : 'Bearer ___GRAPHCOOL_PAT___',
          'content-type': 'application/json'
        },
        body: JSON.stringify({ query: mutation })
      })
      .on('error', (e) => {
        reject(e)
      })
      .on('data', (response) => {
        resolve(response)
      })
    })
      .then(function(response) {
        console.log('Final response');
        console.log(response);
      })
  })
}
