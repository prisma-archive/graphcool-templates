var SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/__SLACK_WEBHOOK_ID__'
var slack = require('slack-notify')(SLACK_WEBHOOK_URL)

module.exports = function (event) {
  console.log('New post created:')
  console.log(event.data.Post.node)

  slack.send({
   text: ('New Post:' + event.data.Post.node.imageUrl + '\n> ' + event.data.Post.node.description),
   unfurl_links: 1,
  })
}
