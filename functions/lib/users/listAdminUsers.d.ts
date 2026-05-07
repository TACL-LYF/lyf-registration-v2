import { UserRole } from "./processSignUp";
export type RoleUser = {
    uid: string;
    email: string | undefined;
    displayName: string | undefined;
    photoURL: string | undefined;
    creationTime: string | undefined;
    lastSignInTime: string | undefined;
    role: UserRole;
};
export type ListRoleUsersResponse = {
    status: "success" | "error";
    code: number;
    message?: string;
    users?: RoleUser[];
};
export declare const VALID_ROLES: UserRole[];
/**
 * Checks if a user has any valid role (staff, superuser, or admin)
 */
export declare const hasAnyRole: (claims: Record<string, unknown> | undefined) => boolean;
/**
 * Gets the role from claims, handling legacy 'admin' claim
 */
export declare const getRoleFromClaims: (claims: Record<string, unknown> | undefined) => UserRole | null;
/**
 * Lists all users that have any role (staff, superuser, or admin).
 * Only callable by users who have a role themselves.
 */
export declare const listAdminUsers: import("firebase-functions/v2/https").CallableFunction<void, Promise<ListRoleUsersResponse>>;
//# sourceMappingURL=listAdminUsers.d.ts.map