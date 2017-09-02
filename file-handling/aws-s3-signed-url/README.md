# AWS S3 - Signed URLs

Get an signed URL to allow authenticated uploads to AWS S3 from clients, without exposing your AWS KEYs

More info on using AWS S3 Signed URLs for file uploading at [http://docs.aws.amazon.com/AmazonS3/latest/dev/PresignedUrlUploadObject.html](http://docs.aws.amazon.com/AmazonS3/latest/dev/PresignedUrlUploadObject.html)

## Example GraphQL request

```graphql
{
  SignedUrl(filePath: "filePath.jpg") {
    fileName
    signedUrl
    getUrl
  }
}
```

Example return

```json
{
  "data": {
    "SignedUrl": {
      "fileName": "graphcool_uploads/1504353705891-filePath.jpg",
      "signedUrl": "https://s3.amazonaws.com/_AWS_BUCKET_/graphcool_uploads/1504353705891-filePath.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=_KEY_ID_%2F20170902%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20170902T120145Z&X-Amz-Expires=300&X-Amz-Signature=d7370f599fe9feaef643baf62f70d867cf9d5b094998a28e201067c5a53fbcac&X-Amz-SignedHeaders=host",
      "getUrl": "https://_AWS_BUCKET_.s3.amazonaws.com/graphcool_uploads/1504353705891-filePath.jpg"
    }
  }
}
```


## Getting Started

1. Create a new `Schema Extension` function
1. Add the content of [schema.graphql](./schema.graphql) as the function's _Schema Extension DSL_
1. Add the content of [s3.js](./s3.js) as the function's _Inline Code_
1. Replace constants by your AWS credentials and settings.

## AWS Setup

1. Create an AWS bucket at https://s3.console.aws.amazon.com/s3/home
1. Setup IAM permissions to access the bucket
```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject"
            ],
            "Resource": "arn:aws:s3:::replace-by-your-bucket-name-here/*"
        }
    ]
}
```
1. If you want files to be later publicly available for download, go to the bucket settings, click on Permissions and add the following bucket policy
```
{
    "Version": "2012-10-17",
    "Id": "Policy1480459267404",
    "Statement": [
        {
            "Sid": "Stmt1480459264483",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::replace-by-your-bucket-name-here/*"
        }
    ]
}
```

## Contributions

- [@felipesabino](https://github.com/felipesabino)

![](http://i.imgur.com/5RHR6Ku.png)
