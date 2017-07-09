# github-fetch-repo

Save Github Repo info with Graphcool Functions ⚡️

## Getting Started

```sh
npm -g install graphcool
graphcool init --schema github-repo.graphql
```

## Setup

Create a new Request Pipeline function

Paste the code from `github-fetch-repo.js` as an inline function at the Transform Argument step and replace `__GITHUB_API_TOKEN__` with your unique Github API Token.

## Test the Code

Go to the Graphcool Playground:

```sh
graphcool playground
```

Run this mutation to create a new Github Repository:

```graphql
mutation($repoUrl: String!) {
  createGithubRepo(
    repoUrl: "https://github.com/facebook/react"
  ) {
    name
    owner
    description
    homepageUrl
    repoUrl
  }
}
```

You should receive the following response:

```json
{
  "data": {
    "createGithubRepo": {
      "name": "react",
      "repoUrl": "https://github.com/facebook/react",
      "description": "A declarative, efficient, and flexible JavaScript library for building user interfaces.",
      "homepageUrl": "https://facebook.github.io/react/",
      "owner": "facebook"
    }
  }
}
```

## Contributions

Thanks so much [@dkh215](https://github.com/dkh215) for contributing this example! :tada:

![](http://i.imgur.com/5RHR6Ku.png)