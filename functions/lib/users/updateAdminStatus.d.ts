import { UserRole } from "./processSignUp";
export type UpdateUserRoleRequest = {
    targetUid: string;
    role: UserRole | null;
};
export type UpdateUserRoleResponse = {
    status: "success" | "error";
    code: number;
    message: string;
};
/**
 * Updates the role of a user.
 * Only callable by users who have appropriate permissions.
 */
export declare const updateAdminStatus: import("firebase-functions/v2/https").CallableFunction<UpdateUserRoleRequest, Promise<UpdateUserRoleResponse>>;
export type AddUserRoleByEmailRequest = {
    email: string;
    role: UserRole;
};
/**
 * Adds a role to a user by email.
 * Only callable by users who have appropriate permissions.
 */
export declare const addAdminByEmail: import("firebase-functions/v2/https").CallableFunction<AddUserRoleByEmailRequest, Promise<UpdateUserRoleResponse>>;
//# sourceMappingURL=updateAdminStatus.d.ts.map