'use latest';

import Webtask from 'webtask-tools';
import express from 'express';
import multiparty from 'multiparty';
import formData from 'form-data';
import request from 'request';
import { request as gqlRequest } from 'graphql-request';

const app = express();

// The upload endpoint
app.post('/:projectId', (req, res) => {
  const webtaskName = req.originalUrl.split('/')[1];
  const projectId = req.params.projectId;
  const graphCoolFileEndpoint = `https://api.graph.cool/file/v1/${projectId}`;
  const graphCoolSimpleEndpoint = `https://api.graph.cool/simple/v1/${projectId}`;

  // We set up a new multiparty form to process our request later on
  const form = new multiparty.Form();

  // Multiparty generates a 'part' event for every file in the request
  // This implementation assumes a single file is posted
  form.on('part', part => {
    // We construct a new form for posting to the actual Graphcool File API
    const formdata = new formData();

    // To reduce memory footprint for large file uploads, we use streaming
    formdata.append('data', part, {filename: part.filename, contentType: part.headers['content-type']});

    // Post the constructed form to the Graphcool File API
    request.post(graphCoolFileEndpoint,
      {
        headers: {'transfer-encoding': 'chunked'},
        _form: formdata
      }, (err, resp, body) => {
        const result = JSON.parse(body)

        // If an image is uploaded, then we submit it for scoring
        // to the Everypixel API
        if (part.headers['content-type'].startsWith('image/')) {
          const { url } = result;
          const { EVERYPIXEL_CLIENT_ID, EVERYPIXEL_CLIENT_SECRET } = req.webtaskContext.secrets
          const authUrl = `https://api.everypixel.com/oauth/token?client_id=${EVERYPIXEL_CLIENT_ID}&client_secret=${EVERYPIXEL_CLIENT_SECRET}&grant_type=client_credentials`
          const keywordUrl = `https://api.everypixel.com/v1/keywords?url=${url}&num_keywords=10`
          const qualityUrl = `https://api.everypixel.com/v1/quality?url=${url}`

          // Get the authentication token
          request.get(authUrl, (err, resp, body) => {
            const access_token = JSON.parse(body).access_token

            // Get the keywords
            request.get(keywordUrl, (err, resp, body) => {
              const keywords = JSON.parse(body).keywords

              // Get the quality
              request.get(qualityUrl, { 'auth': { 'bearer': access_token } }, (err, resp, body) => {
                const score = JSON.parse(body).quality.score

                // The File API has created a File node. We need to update the URL to
                // point to our own endpoint. Unfortunately, we can't, so we use a new
                // field on the File Type to store our URL.
                const query = `
                  mutation updateFile($id: ID!, $keywords: [Json!], $quality: Float) {
                    updateFile (id: $id, keywords: $keywords, quality: $quality)
                    { name size url id keywords quality contentType }
                  }`;

                const variables = {
                  id: result.id,
                  keywords: keywords,
                  quality: score
                };

                gqlRequest(graphCoolSimpleEndpoint, query, variables)
                  .then(data => res.status(200).send(data.updateFile))
              }).auth(null, null, true, access_token)
            }).auth(null, null, true, access_token)
          })
        }
      });
  });

  // Let multiparty parse the incoming request
  form.parse(req);
});

export default Webtask.fromExpress(app);
