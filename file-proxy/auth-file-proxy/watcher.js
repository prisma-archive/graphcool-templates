"use latest"

import request from 'request';
import moment from 'moment';

// Graphcool expects all dates in UTC
process.env.TZ = 'UTC';

export default (ctx, cb) => {
  // Load the project id from the supplied secret
  const project = ctx.secrets.PROJECT_ID

  // Because the File node is created before the MyFile node, we only look
  // at suspects older than 5 minutes. For authentication, we use a PAT.
  const dateThreshold = moment().subtract(5, 'minutes').toISOString();

  // Retrieve the list of files not uploaded through our own endpoint
  // Those are the ones not linked to a MyFile object
  request.post({
      url: `https://api.graph.cool/simple/v1/${project}`,
      method: 'post',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        query: `query { allFiles(filter: { AND: [ { myFile: null }, { createdAt_lt: "${dateThreshold}"} ]  }) { id } }`
      })
    },
    (err,resp,body) => {
      // Get a list of the ID's of the files that were found
      const idArr = JSON.parse(body).data.allFiles;

      // Check if we found any files
      if (idArr.length > 0)
      {
        // Next, we create one batch delete mutation for all found files
        // Again using our PAT for authentication
        request.post({
            url: `https://api.graph.cool/simple/v1/${project}`,
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              query: `mutation {
                ${idArr.map((value,index) => `mut${index}: deleteFile(id: "${value.id}") { id }`).join('\n')}
              }`
            })
          },
          (err,resp,body) => {
            cb(null, `Deleted ${Object.keys(JSON.parse(body).data).length} files!`);
          }).auth(null,null,true, ctx.secrets.PAT);
      }
      else {
        cb(null, `No files found!`);
      }
    }).auth(null,null,true, ctx.secrets.PAT);
};
