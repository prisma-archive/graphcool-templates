# sendgrid-email

Upload, automatically transform an image using Cloudinary with Graphcool Functions ⚡️

## Getting Started

* Create the following schema:

```type UserAvatar implements Node {
  cloudinaryUrl: String @isUnique
  createdAt: DateTime!
  file: File @relation(name: "UserAvatarToFileRelation")
  id: ID! @isUnique
  imageUrl: String
  updatedAt: DateTime!
  user: User @relation(name: "UserAvatarToUserRelation")
}
```

## Setup

* Create a new **Server-Side Subscription** event and insert this as the trigger + payload:

  ```subscription {
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

* Paste the code from `cloudinary.js` as the inline function and replace `___CLOUDINARY_NAME___`, `___CLOUDINARY_KEY___`, `___CLOUDINARY_SECRET___` with your unique Cloudinary information. Also replace your `___PROJECT_ID___` and add a unique `___GRAPHCOOL_PAT___` permanent access token.

* On the front-end, implement `upload-avatar.js` (using React) and `graphql.js`. Local state will update image once transformed image from Cloudinary has been received. From there, you can add all sorts of shenanigans (such as a loading modal instead of showing the original image).
