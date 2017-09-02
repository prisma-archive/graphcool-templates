const AWS_ACCESS_KEY = '_ACCESS_KEY_';
const AWS_KEY_ID = '_KEY_ID_';
const AWS_REGION = 'us-east-1'; // values at http://docs.aws.amazon.com/general/latest/gr/rande.html
const AWS_BUCKET = '_AWS_BUCKET_';
const URL_EXPIRATION_TIME = 300; // 5 minutes * 60 seconds
const FILE_PREFIX = 'graphcool_uploads/'; // prefix to add to all files befo uploading
const SHOULD_ADD_TIMESTAMP_PREFIX = true // if should add epoch prefix to file names

const AWS = require('aws-sdk') 

var options = null;
var s3 = null;

var getUrlForPath = (filePath) => {
  return `https://${options.bucket}.s3.amazonaws.com/${filePath}`;
}

var configure = () => {
  options = {
    awsAccessKey: AWS_ACCESS_KEY,
    awsKeyId: AWS_KEY_ID,
    region: AWS_REGION,
    bucket: AWS_BUCKET,
    signedUrlExpiration: URL_EXPIRATION_TIME,
    filePrefix: FILE_PREFIX,
    shouldAddTimestampPrefix: SHOULD_ADD_TIMESTAMP_PREFIX,
  };

  awsConfig = new AWS.Config({
    credentials: new AWS.Credentials({
      accessKeyId: options.awsKeyId,
      secretAccessKey: options.awsAccessKey,
      sessionToken: null,
    }),
    region: options.region,
    apiVersion: 'v4',
    signatureVersion: 'v4',
    maxRetries: 5,
  });
  s3 = new AWS.S3(awsConfig);
};

module.exports = function(event) {
  configure();
  var fileName = event.data.filePath;
  var timestampPrefix = options.shouldAddTimestampPrefix ? Date.now() + '-' : '';
  var filePath = `${options.filePrefix}${timestampPrefix}${fileName}`;
  var params = {
  	Bucket: options.bucket,
    Expires: options.signedUrlExpiration || 300,
    Key: filePath,
  };

  return new Promise((resolve, reject) => {
    s3.getSignedUrl('putObject', params, (error, url) => {
      if (error) {
        throw new Error(error.message);
      } else {
        return resolve({
          data: {
            fileName: filePath,
            signedUrl: url,
            getUrl: getUrlForPath(filePath),
          }
        });
      }
    });
  });
}
