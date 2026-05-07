import * as functions from "firebase-functions";
import {getAuth} from "firebase-admin/auth";

import {functionsRegion} from "../utils";

const processSignUp = functionsRegion.auth.user().onCreate(async (user) => {
  // If the user's email ends with tacl.org then we should grant them admin access.
  if (user.email && user.emailVerified && user.email.endsWith("@tacl.org")) {
    try {
      await getAuth().setCustomUserClaims(user.uid, {admin: true});
      functions.logger.debug(`Granted ${user.email} admin access`);
    } catch (err) {
      functions.logger.error(
        `Error adding admin status to tacl email: ${user.email}`
      );
    }
  }
});

export default processSignUp;
