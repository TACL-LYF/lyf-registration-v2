import { DocumentReference, Firestore } from "firebase-admin/firestore";
import { CampRemainingSpots, Family, Parent, Registration, RegistrationPayload, RegistrationStatus, CampTrack } from "lyf-registration-schemas";
type CamperAndStatus = {
    camperName: string;
    campTrack: CampTrack;
    isWaitlisted: boolean;
    status: RegistrationStatus;
    registrationRef: DocumentReference<Registration>;
};
export type RegistrationReferences = {
    familyRef: DocumentReference<Family>;
    parentRefs: DocumentReference<Parent>[];
    camperAndStatuses: CamperAndStatus[];
};
/**
 * Either create new family, camper, or registration references
 * or update the existing ones
 * @param registrationPayload The client-provided registration information.
 */
export declare function createOrUpdateRegistration(db: Firestore, registrationPayload: RegistrationPayload, remainingSpots: CampRemainingSpots, forceWaitlist: boolean, authEmail: string): Promise<RegistrationReferences>;
export {};
//# sourceMappingURL=createOrUpdateRegistration.d.ts.map