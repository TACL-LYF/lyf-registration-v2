export type AdminInfo = {
    uid: string;
    email: string | undefined;
    displayName: string | undefined;
    creationTime: string | undefined;
    lastSignInTime: string | undefined;
};
export type ListAdminsResponse = {
    admins: AdminInfo[];
    error?: string;
};
/**
 * Lists all users with admin custom claims.
 * Only accessible by authenticated admin users.
 */
export declare const listAdmins: import("firebase-functions/v2/https").CallableFunction<ListAdminsResponse, any>;
//# sourceMappingURL=listAdmins.d.ts.map