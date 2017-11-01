# slack-bot-notification

Send a Slack notification with Graphcool Functions ⚡️

## Getting Started

```sh
npm -g install graphcool
graphcool init --schema https://graphqlbin.com/instagram.graphql
```

## Setup the Slack Bot

* [Create a new Bot](https://api.slack.com/apps) for one of your Slack Teams and **copy its Webhook URL**.

* Create a new **Server-Side Subscription** event and insert this as the trigger + payload:

  ```graphql
  subscription {
    Post(filter: {
      mutation_in: [CREATED]
    }) {
      node {
        id
        description
        imageUrl
      }
    }
  }
  ```

  This will trigger the Slack notification whenever a new post is created.

* Paste the code from `slack-bot-notifications.js` as the inline function and replace `__SLACK_WEBHOOK_ID__` with the URL to your bot.

## Test the Code

Go to the Graphcool Playground:

```sh
graphcool playground
```

Run this mutation to create a new post and trigger the Slack notification:

```graphql
mutation testSlackNotification {
  createPost(
    description: "Sky of Stars"
    imageUrl: "https://images.unsplash.com/photo-1468956398224-6d6f66e22c35?dpr=2&auto=compress,format&fit=crop&w=991&h=656&q=80&cs=tinysrgb&crop=&bg="
  ) {
    id
  }
}
```

You should see a notification in your Slack channel like this:

![](./screenshot.png)

![](http://i.imgur.com/5RHR6Ku.png)
