"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAdmins = void 0;
const https_1 = require("firebase-functions/v2/https");
const auth_1 = require("firebase-admin/auth");
/**
 * Lists all users with admin custom claims.
 * Only accessible by authenticated admin users.
 */
exports.listAdmins = (0, https_1.onCall)({ cors: true }, async (request) => {
    // If the user isn't signed in, then this isn't a valid request.
    if (!request.auth) {
        return {
            admins: [],
            error: "Not signed in",
        };
    }
    // Verify the caller is an admin
    const token = request.auth.token;
    if (!token.admin) {
        return {
            admins: [],
            error: "Unauthorized: Admin access required",
        };
    }
    try {
        const auth = (0, auth_1.getAuth)();
        const admins = [];
        // List all users (paginated)
        let nextPageToken;
        do {
            const listUsersResult = await auth.listUsers(1000, nextPageToken);
            for (const userRecord of listUsersResult.users) {
                // Check if user has admin custom claim
                if (userRecord.customClaims?.admin === true) {
                    admins.push({
                        uid: userRecord.uid,
                        email: userRecord.email,
                        displayName: userRecord.displayName,
                        creationTime: userRecord.metadata.creationTime,
                        lastSignInTime: userRecord.metadata.lastSignInTime,
                    });
                }
            }
            nextPageToken = listUsersResult.pageToken;
        } while (nextPageToken);
        return {
            admins: admins.sort((a, b) => {
                // Sort by email, with undefined emails at the end
                const emailA = a.email?.toLowerCase() || "";
                const emailB = b.email?.toLowerCase() || "";
                if (!a.email && b.email)
                    return 1;
                if (a.email && !b.email)
                    return -1;
                return emailA.localeCompare(emailB);
            }),
        };
    }
    catch (error) {
        return {
            admins: [],
            error: `Failed to list admins: ${error}`,
        };
    }
});
//# sourceMappingURL=listAdmins.js.map