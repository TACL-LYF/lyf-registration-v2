import { DocumentReference, Firestore } from "firebase-admin/firestore";
import { CampYear, Camper, Family, Parent, Registration } from "lyf-registration-schemas";
type RefAndExisting<T> = {
    ref: DocumentReference<T>;
    didExist: boolean;
};
/**
 * Given emails, find the familiy that has at least one match.
 * @param db The firestore database to query from.
 * @param emails
 */
export declare function findOrCreateFamily(db: Firestore, emails: string[]): Promise<DocumentReference<Family>>;
/**
 * Given a parent object and an existing family ref, try to
 * @param familyRef The document reference for a new or existing family
 * @param parent The parent object to get data from.
 */
export declare function findOrCreateParent(familyRef: DocumentReference<Family>, parent: Parent): Promise<DocumentReference<Parent>>;
/**
 * Given a family and a camper object, either find an existing camper using the ID or name
 * or create a new one
 * @param familyRef The family that this camper is associated with.
 * @param camper The camper data object
 * @returns The camper document reference
 */
export declare function findOrCreateCamper(familyRef: DocumentReference<Family>, camper: Camper): Promise<DocumentReference<Camper>>;
/**
 * Find or create a new registration for the camper and camp year
 * @param camperRef The camper this registration is associated with
 * @param campRef The document referencing the curren't camp year
 * @returns The registration document reference
 */
export declare function findOrCreateRegistration(camperRef: DocumentReference<Camper>, campRef: DocumentReference<CampYear>): Promise<RefAndExisting<Registration>>;
export {};
//# sourceMappingURL=findOrCreateDocument.d.ts.map