# fixer

Wraps the [fixer](http://fixer.io) API with GraphQL ⚡️

## Getting Started

### 1. Add the template to your Graphcool service

```sh
graphcool add-template misc/fixer
```

### 2. Uncomment lines in `graphcool.yml` and `types.graphql`

The [`add-template`](https://www.graph.cool/docs/reference/graphcool-cli/commands-aiteerae6l#graphcool-add-template) command is performing three major steps:

1. Download the source files from the [`src`](./src) directory and put them into your service's `src` directory (into a subdirectory called `fixer`).
2. Download the contents from [`graphcool.yml`](./graphcool.yml) and append them as comments to your service's `graphcool.yml`.
3. Download the contents from [`types.graphql`](./types.graphql) and append them as comments to your service's `types.graphql`.

In order for the changes to take effect, you need to manually uncomment all the lines that have been added by the `add-template` command.

### 3. Deploy the service

Finally, you need to install the [node dependencies](./package.json#L2) and apply all the changes you just made by deploying the service:

```sh
npm install
graphcool deploy
```

## Test the code

Open the Playground for your deployed service: `graphcool playground`.

#### Simple Example

```graphql
query simple {
  fixer {
    base
    date
    eur
    usd
    rub
  }
}
```

* By default, the input parameter `base` is `EUR` and `date` is today.
* `base` returns the specified base, `date` returns the latest date before the specified date
* querying the base itself returns `null`

#### Different base currency

You can specify a different base currency:

```graphql
query base {
  fixer(
    base: "USD"
  ) {
    base
    date
    eur
    usd
    rub
  }
}
```

#### Different date

You can specify a different date:

```graphql
query date {
  fixer(
    date: "2017-09-16"
  ) {
    base
    date
    usd
    rub
  }
}
```

#### Future date

You can specify a future date:

```graphql
query future {
  fixer(
    date: "2200-09-16"
  ) {
    base
    date
    usd
    rub
  }
}
```

![](http://i.imgur.com/5RHR6Ku.png)
