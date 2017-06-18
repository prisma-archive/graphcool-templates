"use latest"

import Webtask from 'webtask-tools';
import express from 'express';
import multiparty from 'multiparty';
import formData from 'form-data';
import request from 'request';

var app = express();

// The upload endpoint
app.post('/:projectid', (req, res) => {
  const webtaskName = req.originalUrl.split('/')[1];

  // Variables to keep track of responses from the file uploads
  const fileUploadResponses = [];
  let count = 0;

  // We set up a new multiparty form to process our request later on
  const form = new multiparty.Form();

  // Multiparty generates a 'part' event for every file in the request
  form.on('part', (part) => {
    count++;
    // We construct a new form for posting to the actual Graphcool File API
    var formdata = new formData();
    // To reduce memory footprint for large file uploads, we use streaming
    formdata.append("data", part, { filename: part.filename, contentType: part["content-type"] });

    // Post the constructed form to the Graphcool File API
    request.post(`https://api.graph.cool/file/v1/${req.params.projectid}`,
      {
        headers: { "transfer-encoding": "chunked" },
        _form: formdata
      }, (err, resp, body) => {
        var result = JSON.parse(body);

        // The File API has created a File node. We need to update the URL to
        // point to our own endpoint. Unfortunately, we can't, so we use a new
        // field on the File Type to store our URL.
        request.post(
          {
            url: `https://api.graph.cool/simple/v1/${req.params.projectid}`,
            method: 'post',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              query: `
                mutation {
                  updateFile (id: "${result.id}",
                              newUrl: "${result.url.replace('files.graph.cool', req.headers.host + '/' + webtaskName)}")
                  {
                    name
                    size
                    newUrl
                    id
                    contentType
                  }
                }
              `
            })
          },
          (err,resp,body) => {
            // Collect the response for the current file
            fileUploadResponses.push(JSON.parse(body).data.updateFile);
          });
      });
  });

  form.on('close', () => {
    // This event should fire after all parts are processed, but it fires too soon
    // Workaround: we wait here, until the responses from all parts are gathered
    let intervalId = setInterval(function() {
      if (fileUploadResponses.length == count)
      {
        clearInterval(intervalId);
        res.status(200).send(fileUploadResponses);
      }
    }, 200);
  })

  // Let multiparty parse the incoming request
  form.parse(req);
});

// The download endpoint
app.get('/:projectid/:filesecret', (req, res) => {

  // The request to the actual file
  var resource = request.get(`https://files.graph.cool/${req.params.projectid}/${req.params.filesecret}`);

  // As soon as we get a response, we copy the headers and status code
  resource.on('response', (response) => {
    res.set(response.headers);
    res.status(response.statusCode);
  });

  // To reduce the memory footprint, we use streaming again
  resource.pipe(res);
});

export default Webtask.fromExpress(app);
