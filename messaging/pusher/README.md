# pusher

Send push notifications with Pusher in your Graphcool project 🎁

## Getting Started

### 1. Add the template to your Graphcool service

```sh
graphcool add-template messaging/pusher
```

### 2. Uncomment lines in `graphcool.yml` and `types.graphql`

The [`add-template`](https://www.graph.cool/docs/reference/graphcool-cli/commands-aiteerae6l#graphcool-add-template) command is performing three major steps:

1. Download the source files from the [`src`](./src) directory and put them into your service's `src` directory (into a subdirectory called `pusher`).
2. Download the contents from [`graphcool.yml`](./graphcool.yml) and append them as comments to your service's `graphcool.yml`.
3. Download the contents from [`types.graphql`](./types.graphql) and append them as comments to your service's `types.graphql`.

In order for the changes to take effect, you need to manually uncomment all the lines that have been added by the `add-template` command.

### 3. Setup Pusher credentials

You need to configure these credentials as environment variables:

* `PUSHER_APP_ID`
* `PUSHER_KEY`
* `PUSHER_SECRET`
* `PUSHER_CLUSTER`

You can receive them after [signing up at Pusher](https://pusher.com/).

To manage your environment variables, you can use a tool like [direnv](https://direnv.net/).

### 4. Deploy the service

Finally, you need to install the [node dependencies](./package.json#L2) and apply all the changes you just made by deploying the service:

```sh
npm install
graphcool deploy
```

## Test the Code

First, setup the Pusher configuration in `notification.html`. Please replace the following constants with the same value you used for the environment variables above:

* `APP_KEY`: Pusher app key
* `CLUSTER`: Pusher cluster

Then, serve the file `notification.html`, for example with:

```sh
python -m SimpleHTTPServer
```

and open it in your browser.

Open the playground:

```sh
graphcool playground
```

and run this mutation to push a notification to your browser:

```graphql
mutation {
  pushNotification(
    channels: ["my-channel"]
    event: "my-event"
    message: "Hello from the Graphcool pusher module!"
  ) {
    success
  }
}
```
