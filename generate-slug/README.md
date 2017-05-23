# generate-slug

Generate a slug for items with Graphcool Functions ⚡️

## Getting Started

```sh
npm -g install graphcool
graphcool init --schema generate-slug.graphql
```

## Setup the Slug Generation

* Create a new function as part of the **`TRANSFORM_ARGUMENT` step of the Request Pipeline** and paste the code from `generate-slug.js`. This will create a slug whenever an item is created.

## Test the Code

Go to the Graphcool Playground:

```sh
graphcool playground
```

Run this mutation to create a new item and query its generated slug:

```graphql
mutation testSlugGeneration {
  createItem(
    name: "A new Item"
  ) {
    id
    name
    slug
  }
}
```

You should see the generated slug `a-new-item`.

![](http://i.imgur.com/5RHR6Ku.png)
