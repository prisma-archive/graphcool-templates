import { AuthenticateFirebaseToken, Response } from "./firebase-auth";
import * as admin from "firebase-admin";

const serviceAccount = JSON.parse(process.env.firebaseKey);
if (admin.apps.length < 1) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.databaseURL
  });
}

export const firebaseAuthentication = (event, context, callback) => {
  return AuthenticateFirebaseToken(event)
    .then(res => {
      return callback(null, res);
    })
    .catch(err => {
      return callback(err, null);
    });
};
