"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addAdminByEmail = exports.updateAdminStatus = void 0;
const tslib_1 = require("tslib");
const auth_1 = require("firebase-admin/auth");
const https_1 = require("firebase-functions/v2/https");
const functions = tslib_1.__importStar(require("firebase-functions"));
const listAdminUsers_1 = require("./listAdminUsers");
// CORS origins based on environment
const getCorsOrigins = () => {
    // In emulator, allow localhost. In production, only allow production domain
    if (process.env.FUNCTIONS_EMULATOR === "true") {
        return ["http://localhost:8000", "http://localhost:3000"];
    }
    return ["https://lyf.tacl.org"];
};
// // Role hierarchy index (higher = more powerful)
// const ROLE_HIERARCHY: Record<UserRole, number> = {
//   staff: 1,
//   superuser: 2,
//   admin: 3,
// };
/**
 * Check if the caller can modify the target's role.
 * Rules:
 * - Admin can modify anyone's role
 * - Superuser can only modify staff roles
 * - Staff cannot modify anyone's role
 */
const canModifyRole = (callerRole, targetCurrentRole, targetNewRole) => {
    // const callerLevel = ROLE_HIERARCHY[callerRole];
    // Admin can do anything
    if (callerRole === "admin")
        return true;
    // Staff cannot modify roles
    if (callerRole === "staff")
        return false;
    // Superuser can only modify users with lower roles
    if (callerRole === "superuser") {
        // Can't modify admins
        if (targetCurrentRole === "admin")
            return false;
        // Can't promote to admin
        if (targetNewRole === "admin")
            return false;
        // Can't promote to superuser (only admin can)
        if (targetNewRole === "superuser")
            return false;
        return true;
    }
    return false;
};
/**
 * Updates the role of a user.
 * Only callable by users who have appropriate permissions.
 */
exports.updateAdminStatus = (0, https_1.onCall)({ cors: getCorsOrigins() }, async (request) => {
    // Check if the user is signed in
    if (!request.auth) {
        return {
            status: "error",
            code: 401,
            message: "Not signed in",
        };
    }
    // Check if the caller has a role
    const callerRole = (0, listAdminUsers_1.getRoleFromClaims)(request.auth.token);
    if (!callerRole) {
        return {
            status: "error",
            code: 403,
            message: "Unauthorized: Role required",
        };
    }
    const { targetUid, role } = request.data;
    // Validate role
    if (role !== null && !listAdminUsers_1.VALID_ROLES.includes(role)) {
        return {
            status: "error",
            code: 400,
            message: `Invalid role: ${role}. Valid roles are: ${listAdminUsers_1.VALID_ROLES.join(", ")}`,
        };
    }
    // Prevent users from modifying their own role
    if (targetUid === request.auth.uid) {
        return {
            status: "error",
            code: 400,
            message: "Cannot modify your own role",
        };
    }
    try {
        const auth = (0, auth_1.getAuth)();
        // Get the target user to verify they exist and get their current role
        const targetUser = await auth.getUser(targetUid);
        const targetCurrentRole = (0, listAdminUsers_1.getRoleFromClaims)(targetUser.customClaims);
        // Check permissions
        if (!canModifyRole(callerRole, targetCurrentRole, role)) {
            return {
                status: "error",
                code: 403,
                message: "Insufficient permissions to modify this user's role",
            };
        }
        // Update the custom claims
        if (role === null) {
            // Remove role - clear all role-related claims
            await auth.setCustomUserClaims(targetUid, {});
        }
        else {
            // Set new role and remove legacy admin claim
            await auth.setCustomUserClaims(targetUid, { role });
        }
        const action = role ? `set to ${role}` : "removed";
        functions.logger.info(`Role ${action} for ${targetUser.email} (${targetUid}) by ${request.auth.token.email}`);
        return {
            status: "success",
            code: 200,
            message: `Role ${action} for ${targetUser.email}`,
        };
    }
    catch (error) {
        functions.logger.error(`Failed to update user role: ${error}`);
        return {
            status: "error",
            code: 500,
            message: `Failed to update user role: ${error}`,
        };
    }
});
/**
 * Adds a role to a user by email.
 * Only callable by users who have appropriate permissions.
 */
exports.addAdminByEmail = (0, https_1.onCall)({ cors: getCorsOrigins() }, async (request) => {
    // Check if the user is signed in
    if (!request.auth) {
        return {
            status: "error",
            code: 401,
            message: "Not signed in",
        };
    }
    // Check if the caller has a role
    const callerRole = (0, listAdminUsers_1.getRoleFromClaims)(request.auth.token);
    if (!callerRole) {
        return {
            status: "error",
            code: 403,
            message: "Unauthorized: Role required",
        };
    }
    const { email, role } = request.data;
    // Validate role
    if (!listAdminUsers_1.VALID_ROLES.includes(role)) {
        return {
            status: "error",
            code: 400,
            message: `Invalid role: ${role}. Valid roles are: ${listAdminUsers_1.VALID_ROLES.join(", ")}`,
        };
    }
    // Check if caller can assign this role
    if (callerRole !== "admin") {
        if (role === "admin" || role === "superuser") {
            return {
                status: "error",
                code: 403,
                message: "Only admins can assign admin or superuser roles",
            };
        }
        if (callerRole === "staff") {
            return {
                status: "error",
                code: 403,
                message: "Staff cannot assign roles",
            };
        }
    }
    try {
        const auth = (0, auth_1.getAuth)();
        // Get the user by email
        const targetUser = await auth.getUserByEmail(email);
        // Check if user already has a role
        const existingRole = (0, listAdminUsers_1.getRoleFromClaims)(targetUser.customClaims);
        if (existingRole) {
            return {
                status: "error",
                code: 400,
                message: `User already has role: ${existingRole}. Use update role to change it.`,
            };
        }
        // Set the role
        await auth.setCustomUserClaims(targetUser.uid, { role });
        functions.logger.info(`Role ${role} granted to ${email} (${targetUser.uid}) by ${request.auth.token.email}`);
        return {
            status: "success",
            code: 200,
            message: `Role ${role} granted to ${email}`,
        };
    }
    catch (error) {
        functions.logger.error(`Failed to add role by email: ${error}`);
        // Check if user not found
        if (error &&
            typeof error === "object" &&
            "code" in error &&
            error.code === "auth/user-not-found") {
            return {
                status: "error",
                code: 404,
                message: `No user found with email: ${email}`,
            };
        }
        return {
            status: "error",
            code: 500,
            message: `Failed to add role: ${error}`,
        };
    }
});
//# sourceMappingURL=updateAdminStatus.js.map