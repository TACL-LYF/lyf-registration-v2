import { DocumentReference, Firestore } from "firebase-admin/firestore";
import { Camper, CamperHealth, Registration } from "lyf-registration-schemas";
/**
 * Helper that gets the registration and camper info from a registration ref
 * @param db
 * @param registrationRef
 * @returns
 */
export declare function getRegistrationAndCamperInfo(db: Firestore, registrationRef: DocumentReference<Registration>): Promise<{
    camper: Camper | null;
    camperHealth: CamperHealth | null;
    registration: Registration | null;
}>;
//# sourceMappingURL=getRegistrationAndCamperInfo.d.ts.map