"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAdminUsers = exports.getRoleFromClaims = exports.hasAnyRole = exports.VALID_ROLES = void 0;
const auth_1 = require("firebase-admin/auth");
const https_1 = require("firebase-functions/v2/https");
// CORS origins based on environment
const getCorsOrigins = () => {
    // In emulator, allow localhost. In production, only allow production domain
    if (process.env.FUNCTIONS_EMULATOR === "true") {
        return ["http://localhost:8000", "http://localhost:3000"];
    }
    return ["https://lyf.tacl.org"];
};
// Valid roles in order of hierarchy (lowest to highest)
exports.VALID_ROLES = ["staff", "superuser", "admin"];
/**
 * Checks if a user has any valid role (staff, superuser, or admin)
 */
const hasAnyRole = (claims) => {
    if (!claims)
        return false;
    // Support both old 'admin' claim and new 'role' claim
    if (claims.admin === true)
        return true;
    if (claims.role && exports.VALID_ROLES.includes(claims.role))
        return true;
    return false;
};
exports.hasAnyRole = hasAnyRole;
/**
 * Gets the role from claims, handling legacy 'admin' claim
 */
const getRoleFromClaims = (claims) => {
    if (!claims)
        return null;
    // Support legacy 'admin' claim - treat as admin role
    if (claims.admin === true && !claims.role)
        return "admin";
    if (claims.role && exports.VALID_ROLES.includes(claims.role)) {
        return claims.role;
    }
    return null;
};
exports.getRoleFromClaims = getRoleFromClaims;
/**
 * Lists all users that have any role (staff, superuser, or admin).
 * Only callable by users who have a role themselves.
 */
exports.listAdminUsers = (0, https_1.onCall)({ cors: getCorsOrigins() }, async (request) => {
    // Check if the user is signed in
    if (!request.auth) {
        return {
            status: "error",
            code: 401,
            message: "Not signed in",
        };
    }
    // Check if the caller has any role
    const callerRole = (0, exports.getRoleFromClaims)(request.auth.token);
    if (!callerRole) {
        return {
            status: "error",
            code: 403,
            message: "Unauthorized: Role required",
        };
    }
    try {
        const roleUsers = [];
        const auth = (0, auth_1.getAuth)();
        // List all users and filter for those with any role
        const listAllUsers = async (nextPageToken) => {
            const listUsersResult = await auth.listUsers(1000, nextPageToken);
            for (const userRecord of listUsersResult.users) {
                const role = (0, exports.getRoleFromClaims)(userRecord.customClaims);
                if (role) {
                    roleUsers.push({
                        uid: userRecord.uid,
                        email: userRecord.email,
                        displayName: userRecord.displayName,
                        photoURL: userRecord.photoURL,
                        creationTime: userRecord.metadata.creationTime,
                        lastSignInTime: userRecord.metadata.lastSignInTime,
                        role: role,
                    });
                }
            }
            if (listUsersResult.pageToken) {
                await listAllUsers(listUsersResult.pageToken);
            }
        };
        await listAllUsers();
        return {
            status: "success",
            code: 200,
            users: roleUsers,
        };
    }
    catch (error) {
        return {
            status: "error",
            code: 500,
            message: `Failed to list users with roles: ${error}`,
        };
    }
});
//# sourceMappingURL=listAdminUsers.js.map