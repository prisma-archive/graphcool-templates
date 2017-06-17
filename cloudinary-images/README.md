# cloudinary-images

Upload, automatically transform an image using Cloudinary with Graphcool Functions ⚡️

## Getting Started

```sh
npm -g install graphcool
graphcool init --schema cloudinary-images.graphql
```

## Setup

* Create a new **Server-Side Subscription** event and insert this as the trigger + payload:

  ```graphql
  subscription {
    UserAvatar(filter: {
      mutation_in: [UPDATED]
      updatedFields_contains: "imageUrl"
    }) {
      node {
        id
        file {
          url
        }
        user {
          id
        }
      }
    }
  }
  ```

  This will trigger the Cloudinary upload and image transformation whenever a new image is uploaded.

* Paste the code from `cloudinary.js` as the inline function and replace `___CLOUDINARY_NAME___`, `___CLOUDINARY_KEY___`, `___CLOUDINARY_SECRET___` with your unique Cloudinary information. Also replace your `___PROJECT_ID___` and add a `___GRAPHCOOL_PAT___` permanent authentication token.

* On the front-end, implement `upload-avatar.js` (using React) and `graphql.js`. Local state will update image once transformed image from Cloudinary has been received. From there, you can add all sorts of shenanigans (such as a loading modal instead of showing the original image).

## Contributions

Thanks so much @heymartinadams for contributing this example!

![](http://i.imgur.com/5RHR6Ku.png)
