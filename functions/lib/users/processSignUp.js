"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const functions = tslib_1.__importStar(require("firebase-functions"));
const auth_1 = require("firebase-admin/auth");
const utils_1 = require("../utils");
const processSignUp = utils_1.functionsRegion.auth.user().onCreate(async (user) => {
    // If the user's email ends with tacl.org then we should grant them admin access.
    if (user.email && user.emailVerified && user.email.endsWith("@tacl.org")) {
        try {
            await (0, auth_1.getAuth)().setCustomUserClaims(user.uid, { admin: true });
            functions.logger.debug(`Granted ${user.email} admin access`);
        }
        catch (err) {
            functions.logger.error(`Error adding admin status to tacl email: ${user.email}`);
        }
    }
});
exports.default = processSignUp;
//# sourceMappingURL=processSignUp.js.map