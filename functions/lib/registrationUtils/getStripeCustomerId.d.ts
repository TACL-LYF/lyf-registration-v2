import { DocumentReference } from "firebase-admin/firestore";
/**
 * Given a reference to a parent document, create a customerId by retrieving it from the document or creating a new one.
 * @param parentRef
 * @param email
 * @returns
 */
export declare function getStripeCustomerId(parentRef: DocumentReference | undefined, email: string, isTestData?: boolean): Promise<string>;
//# sourceMappingURL=getStripeCustomerId.d.ts.map