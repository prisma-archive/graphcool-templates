// @flow
//
// copied from:
// https://gist.github.com/jhalborg/5042201f558034243376cffb55111d85
// Thanks, @jhalborg

import { auth } from "firebase-admin";
import Graphcool, { fromEvent } from "graphcool-lib";
const jwt = require("jsonwebtoken");
const lambdaProxy = require("lambda-proxy-response");

const pat = process.env.graphcoolPAT;
const projectId = process.env.graphcoolProjectId;
const apiType = "simple/v1";

export const AuthenticateFirebaseToken = async (event: any) => {
  if (!event.body) {
    return lambdaProxy.response(400, null, {
      error: "No data found for event.body"
    });
  }

  const payload = JSON.parse(event.body);
  if (!payload.data || !payload.data.firebaseIdToken) {
    return lambdaProxy.response(400, null, {
      error: "No data found for event.body.data.firebaseIdToken"
    });
  }
  payload.context = { graphcool: { pat, projectId } }; // Adding context manually, should not be needed when out of beta
  const graphcool = fromEvent(payload);
  const api = graphcool.api(apiType);
  const { firebaseIdToken } = payload.data;
  let firebaseUserId: string = "";
  let graphcoolUserId: string = "";

  // Verify the token with Firebase SDK
  try {
    const decodedToken = await auth().verifyIdToken(firebaseIdToken);
    firebaseUserId = decodedToken.uid;
  } catch (error) {
    return lambdaProxy.response(401, null, {
      error: `"Could not verify id token with Firebase ${error}"`
    });
  }

  try {
    var progress = "";
    const user = await getGraphcoolUser(firebaseUserId, graphcool);
    if (user === null) {
      graphcoolUserId = await createGraphcoolUser(firebaseUserId, graphcool);
    } else {
      graphcoolUserId = user.id;
    }

    const graphcoolToken = await generateGraphcoolToken(
      graphcoolUserId,
      graphcool
    );

    const decoded = jwt.decode(graphcoolToken);
    const exp = decoded.exp;

    return lambdaProxy.response(200, null, {
      data: {
        wrappedToken: JSON.stringify({
          token: graphcoolToken,
          exp,
          firebaseUserId,
          graphcoolUserId
        })
      }
    });
  } catch (error) {
    return lambdaProxy.response(503, null, {
      error: `"Error communicating with GraphCool: ${error}"`
    });
  }
};

const generateGraphcoolToken = async (
  graphcoolUserId: string,
  graphcool: Graphcool
) => {
  return graphcool.generateAuthToken(graphcoolUserId, "User");
};

const createGraphcoolUser = async (
  firebaseUserId: string,
  graphcool: Graphcool
) => {
  return new Promise(async (resolve, reject) => {
    const api = graphcool.api(apiType);

    try {
      const createUserResult = await api.request(`
      mutation {
        createUser(firebaseUserId: "${firebaseUserId}") {
          id
        }
      }`);
      const graphcoolUserId: string = createUserResult.createUser.user.id;
      resolve(graphcoolUserId);
    } catch (error) {
      reject(`Could not create GraphCool user. ${error}`);
    }
  });
};

const getGraphcoolUser = async (firebaseId: string, graphcool: Graphcool) => {
  return new Promise(async (resolve, reject) => {
    const api = graphcool.api(apiType);
    try {
      const userQueryResult: any = await api.request(`
      query {
        User(firebaseUserId: "${firebaseId}"){
          id
        }
      }`);

      if (userQueryResult.error) {
        reject(userQueryResult.error);
      } else {
        resolve(userQueryResult.User);
      }
    } catch (error) {
      reject(`Could not retrieve GraphCool user. ${error}`);
    }
  });
};
