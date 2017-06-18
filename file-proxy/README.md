# file-proxy

This set of examples shows how to implement a set of webtask endpoints for file upload and download. Starting out with a basic upload/download proxy to demonstrate the pattern, this pattern can be extended to include additional features, like encryption, authentication, metadata support, multiple file upload support, and extension support.  
Be aware that most of the examples are not production-ready with regards to things like error handling and security.

## Included examples
[simple-file-proxy](#simple-file-proxy)  
[multiple-file-proxy](#multiple-file-proxy)  
[metadata-file-proxy](#metadata-file-proxy)  
[extension-file-proxy](#extension-file-proxy)  
[encrypted-file-proxy](#encrypted-file-proxy)  
[auth-file-proxy](#auth-file-proxy)

## Getting started

### Setup Graphcool project

Make sure you have the Graphcool cli installed:
```sh
npm -g install graphcool
```

### Setup webtask.io
Install the webtask.io cli, and initialize your webtask.io profile, by running:
```sh
npm -g install wt-cli
wt init
```
If you have never used wt-cli before, the `wt init` command will ask for your e-mail address or phone number to set up or connect to your webtask container.

## Examples
### simple-file-proxy

This is the starting point for the examples. It is a basic file upload/download proxy.

First, initialize a new Graphcool project with the required schema, by running:
```sh
graphcool init --schema ./schemas/simple-file-proxy.graphql
```
Note the ID that this command returns. We will need this project ID later on.

You can deploy the webtask for this example to webtask.io by running the following command:
```sh
wt create ./simple-file-proxy.js --name simple
```
After running this command, `wt-cli` will return the url of your webtask. Using the `-name` argument, you can specify a different name for the webtask (the last part of the url).

Your webtask is now deployed! You can upload a file using any tool that support `multipart/form-data`, like Postman, or the command-line tool `curl`:
```sh
curl -X POST '<webtask endpoint url>/__PROJECT_ID__' -F "data=@example.png;filename=myname.png"
```
This uploads the local file `example.png` with the new name `myname.png`. The response should look something like this:
```json
{
  "name": "myname.png",
  "size": 123456,
  "newUrl": "https://<webtask endpoint url>/__PROJECT_ID__/__SECRET__",
  "id": "<omitted>",
  "contentType": "image/png"
}
```
Notice that the `url` field in the response is replaced by a new field, `newUrl`, that points to your own endpoint for downloading the file.
You can open the url from the `newUrl` field in your browser to download the file you have just uploaded.

### multiple-file-proxy

This example adds the possibility to upload multiple files in one request.

This example uses the same GraphQL schema as `simple-file-proxy`. Follow the instructions above if you haven't created a Graphcool project based on this schema.

Next, deploy the webtask for this example to webtask.io by running the following command:
```sh
wt create ./multiple-file-proxy.js --name multiple
```
Now, try to upload more than one file at once to your endpoint:
```sh
curl -X POST '<webtask endpoint url>/__PROJECT_ID__' -F "file1=@example.png;filename=myname.png;file2=@example2.png;filename=testfile.png"
```
The response will be an array of File objects, like this:
```json
[
  {
    "name": "myname.png",
    "size": 123456,
    "newUrl": "https://<webtask endpoint url>/__PROJECT_ID__/__SECRET__",
    "id": "<omitted>",
    "contentType": "image/png"
  },
  {
    "name": "testfile.png",
    "size": 234567,
    "newUrl": "https://<webtask endpoint url>/__PROJECT_ID__/__SECRET__",
    "id": "<omitted>",
    "contentType": "image/png"
  }
]
```

### metadata-file-proxy

This example adds the possibility to upload metadata with your files. It performs no checks on the supplied metadata fields, so if you include any field that is not part of the File Type, the upload fails.

Initialize a new Graphcool project by running:
```sh
graphcool init --schema ./schemas/metadata-file-proxy.graphql
```
This schema adds the previous `newUrl` field to the File Type, as well as two metadata fields: `description` and `category`.

Next, deploy the webtask for this example to webtask.io by running the following command:
```sh
wt create ./metadata-file-proxy.js --name metadata
```

Now, let's see what happens if we specify the two extra metadata fields when uploading a file. Make sure to specify the metadata fields **first**. This is due to the file streaming implementation.
```sh
curl -X POST '<webtask endpoint url>/__PROJECT_ID__' -F "description=\"Example picture\";category=\"examples\";data=@example.png;filename=myname.png"
```
The response should look something like this:
```json
{
  "name": "myname.png",
  "size": 123456,
  "newUrl": "https://<webtask endpoint url>/__PROJECT_ID__/__SECRET__",
  "id": "<omitted>",
  "contentType": "image/png",
  "description": "Example picture",
  "category": "examples"
}
```
The two extra fields, `description` and `category`, are added to the response.

### extension-file-proxy

This example adds minimal file extension support to the download endpoint. It could be further extended to perform additional checks.
It was inspired by [this](https://github.com/graphcool/feature-requests/issues/180) FR.

This example uses the same GraphQL schema as `simple-file-proxy`. Follow the instructions above if you haven't created a Graphcool project based on this schema.

Next, deploy the webtask for this example to webtask.io by running the following command:
```sh
wt create ./extension-file-proxy.js --name extension
```
Now upload a file like before. The `newUrl` field in the response now includes the file extension:
```json
{
  ...
  "newUrl": "https://<webtask endpoint url>/__PROJECT_ID__/__SECRET__.png",
  ...
}
```


### encrypted-file-proxy

This example adds encryption to our file proxy. Files are encrypted on the fly while uploading, and decrypted while downloading.

This example uses the same GraphQL schema as  `simple-file-proxy`. Follow the instructions above if you haven't created a Graphcool project based on this schema.

Next, deploy the webtask for this example to webtask.io by running the following command:
```sh
wt create ./encrypted-file-proxy.js --name encrypted --secret FILE_ENC_PASSWORD=<password>
```
The `--secret` argument is used to specify the password that is used to encrypt/decrypt the files. Secrets are not visible from the code, but are accessible from the `webtaskContext`. See the webtask [documentation](https://webtask.io/docs/editor/secrets) for more information.

Follow the instructions in the `simple-file-proxy` example to upload a file to your new, encrypted, endpoint. Use a simple textfile to test the encryption.

You'll notice that this example also returns the url generated by Graphcool. Use this url to download the file. If you open it, you will see that the contents of the file are encrypted. Using your new endpoint url to download the file, you will see that the file is decrypted automatically.

The file is now protected from access through the public file endpoint Graphcool offers. However, the endpoint you have just created to download the encrypted file is also still accessible to everyone. That's why we will add authentication in the next example.

### auth-file-proxy

See [here](./auth-file-proxy/README.md)
