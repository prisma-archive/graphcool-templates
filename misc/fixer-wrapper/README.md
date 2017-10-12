# fixer-wrapper

Wraps the [fixer](http://fixer.io) API using Graphcool Resolver Functions ⚡️

[Demo](https://graphqlbin.com/RoQhG)

## Get Started

```sh
npm install -g graphcool@next
graphcool init
graphcool deploy
```

## Example Queries

[Try them out in the demo](https://graphqlbin.com/RoQhG) or open the Playground for your deployed service: `graphcool playground`.

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
