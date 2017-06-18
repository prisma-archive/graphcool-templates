# auth-file-proxy

## Table of contents

* [Introduction](#introduction)
  * [File create permissions - authentication](#file-create-permissions---authentication)
  * [File create permissions - authorization](#file-create-permissions---authorization)
  * [File download permissions](#file-download-permissions)
  * [Other benefits](#other-benefits)
* [Setup](#setup)
  * [Graphcool project](#graphcool-project)
  * [Webtask endpoints](#webtask-endpoints)
  * [Permissions](#permissions)
  * [Extension points](#extension-points)
  * [Cron webtask](#cron-webtask)

## Introduction

This is the most extensive example of the file proxy. It deals with a number of authentication issues that the current Graphcool File API has.

### File create permissions - authentication

The regular File API allows everyone to upload and download files to any project. On every website using Graphcool as backend, the Project ID is out in the open, because it is used in every request to the backend. This makes every project into a free-for-all file share. This example deals with that:
- Every request to our endpoint is checked for authentication
- This example includes a cron webtask, that monitors the `File` Type for any unverified uploads, and automatically deletes them

### File create permissions - authorization

Even though we include authentication on our endpoint, we also want to set permissions for file uploads. The built-in `File` Type does not allow that. A file can be uploaded, and a new File node will be created, regardless of any `CREATE` permissions defined for the `File` Type. This example deals with that:
- A new Type is created that mirrors the built-in `File` Type
- When a file is uploaded using our own endpoint, a new node is created of that Type
- This allows you to define a `CREATE` permission query for this Type that _will_ fire on every upload

### File download permissions

Like we mentioned above, access to files is unrestricted by the regular File API. And there's nothing we can do about it. What we can do however, is encrypt the files. That's why this example builds on the encrypted-file-proxy example, to effectively make access to the contents of the files impossible using the regular File API.  
However, the encrypted-file-proxy example did not deal with authentication and authorization of our own download endpoint. In this example, we will extend this by:
- Defining a `READ` permission query on our new `File` Type mirror
- So even if someone has the direct link to our download endpoint for a specific file, the request still goes through the Graphcool authentication and permission query mechanism

### Other benefits

The mirror `File` Type is a normal Type like any other user-defined Type in your Graphcool project. This means you can use all features that Graphcool offers for this type: event hooks, server side subscriptions, permission queries, etc.

## Setup

### Graphcool project

Initialize a new Graphcool project with the required schema, by running:
```sh
graphcool init --schema ./auth-file-proxy.graphql
```
This will create a new project with our new `MyFile` type.

For the file watcher cron webtask, we also need a Permanent Auth Token. Open the console for your new project using the `graphcool console` command, and create a new PAT on the Authentication tab on the Project Settings page. You can pick any name for the PAT. See the [Graphcool documentation](https://www.graph.cool/docs/reference/auth/authentication-tokens-eip7ahqu5o/#token-types) for more information on creating Permanent Auth Tokens.

### Webtask endpoints

You can deploy the webtask for this example to webtask.io by running the following command:
```sh
wt create ./auth-file-proxy.js --name auth-file-proxy
```
After running this command, `wt-cli` will return the url of your webtask. Using the `-name` argument, you can specify a different name for the webtask (the last part of the url).

### Permissions

Both uploading and downloading files is authenticated and authorized using the `MyFile` Type. You can set permissions on this type in the Graphcool console for your project. If you enable 'Authentication required' on the `READ` and `CREATE` permissions for the `MyFile` Type, and try to upload or download a file, you will get a `403 Forbidden` response from the endpoints.

To use these endpoints with authentication, you need to pass an `Authorization: Bearer <token>` header to your request. If you access this endpoint from a client application when a user has already signed in, you get this token from the `signinUser` request.

For test purposes, you can copy the Permanent Auth Token you have create above, and call the endpoint:
```sh
curl -X POST '<webtask endpoint url>/__PROJECT_ID__' -F "data=@example.png;filename=myname.png" -H "Authorization: Bearer ey...<token>"
```
You can use the URL from the response to try downloading the file, using the same token:
```sh
curl -X GET '<file url>' -H "Authorization: Bearer ey...<token>"
```

### Extension points

Because the `MyFile` Type is a normal user Type, you can use any extension point that Graphcool offers, like Request Pipeline Functions and Server Side Subscriptions to tailor this example to your own needs.

### Cron webtask

To setup the cron webtask that will monitor unauthorized file uploads, use the following commands:
```sh
 wt cron schedule --name watcher --secret PROJECT_ID=<project id> --secret PAT=<pat> "*/10 * * * *" ./watcher.js
```
Use the project id and permanent auth token from above. This schedules the wachter to run every 10 minutes. You can pick a different interval by changing the `*/10 * * * *` schedule. The website  [crontab.guru](https://contrab.guru) offers an easy way to create your own schedule.

You can use `wt cron history watcher` to see the results of each execution.
