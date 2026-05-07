import {
  DocumentReference,
  FieldValue,
  Firestore,
} from "firebase-admin/firestore";
import {
  Camper,
  CamperHealth,
  CampRemainingSpots,
  Demographics,
  Family,
  HouseholdCulture,
  Parent,
  Registration,
  RegistrationPayload,
  RegistrationStatus,
  getCampTrack,
  CampTrack,
} from "lyf-registration-schemas";
import {
  findOrCreateCamper,
  findOrCreateFamily,
  findOrCreateParent,
  findOrCreateRegistration,
} from "../registrationUtils";
import {assertCallerEmailInList} from "../utils/auth";

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

type CamperAndRegInfo = RegistrationPayload["campers"][0];

/**
 * Given a family payload, update the family and return the reference to it.
 * @param db
 * @param familyPayload
 * @param emails
 * @returns
 */
async function updateAndGetFamily(
  db: Firestore,
  familyPayload: Family,
  emails: string[],
  householdCulture: HouseholdCulture,
  authEmail: string
): Promise<DocumentReference<Family>> {
  const familyRef = await findOrCreateFamily(db, authEmail);
  await familyRef.set(
    {
      emails: FieldValue.arrayUnion(...emails),
      household: householdCulture,
      city: familyPayload.city,
      state: familyPayload.state,
      zip: familyPayload.zip,
      street: familyPayload.street,
    },
    {
      merge: true,
    }
  );

  return familyRef;
}

/**
 * Given a parent payload, update each parent and return the references to them.
 * @param db
 * @param familyRef
 * @param parentsPayload
 * @returns
 */
async function updateAndGetParents(
  db: Firestore,
  familyRef: DocumentReference<Family>,
  parentsPayload: Parent[]
): Promise<DocumentReference<Parent>[]> {
  const parentRefs: DocumentReference<Parent>[] = [];
  await Promise.all(
    parentsPayload.map(async (parent) => {
      const parentRef = await findOrCreateParent(familyRef, parent);
      parentRefs.push(parentRef);
      await parentRef.set(
        {
          email: parent.email,
          firstName: parent.firstName,
          lastName: parent.lastName,
          phoneNumber: parent.phoneNumber,
          lineId: parent.lineId,
          subscribeToMailingList: parent.subscribeToMailingList,
        },
        {
          merge: true,
        }
      );
    })
  );

  return parentRefs;
}

/**
 * Given a camper payload, update the camper base doc and write health/demographics
 * to private sub-documents for RBAC-gated access.
 */
async function updateAndGetCamper(
  familyRef: DocumentReference<Family>,
  camperAndRegInfo: CamperAndRegInfo,
  demographics: Demographics
): Promise<DocumentReference<Camper>> {
  const camperRef = await findOrCreateCamper(familyRef, camperAndRegInfo);

  // Base camper doc — accessible to all admin roles
  await camperRef.set(
    {
      firstName: camperAndRegInfo.firstName,
      lastName: camperAndRegInfo.lastName,
      preferredName: camperAndRegInfo.preferredName ?? null,
      birthDate: camperAndRegInfo.birthDate,

      gender: camperAndRegInfo.gender,
      pronouns: camperAndRegInfo.pronouns ?? null,
    },
    {
      merge: true,
    }
  );

  // Private health sub-doc — accessible to health_staff and full_admin
  const healthRef = camperRef.collection("private").doc("health");
  await healthRef.set(
    {
      dietAndFoodAllergies: camperAndRegInfo.dietAndFoodAllergies ?? null,
      medicalConditions: camperAndRegInfo.medicalConditions ?? null,
    } as CamperHealth,
    { merge: true }
  );

  // Private demographics sub-doc — accessible to full_admin only
  const demographicsRef = camperRef.collection("private").doc("demographics");
  await demographicsRef.set(demographics as Demographics, { merge: true });

  return camperRef;
}

/**
 * Either create new family, camper, or registration references
 * or update the existing ones
 * @param registrationPayload The client-provided registration information.
 */
export async function createOrUpdateRegistration(
  db: Firestore,
  registrationPayload: RegistrationPayload,
  remainingSpots: CampRemainingSpots,
  forceWaitlist: boolean,
  authEmail: string
): Promise<RegistrationReferences> {
  // TODO: Add HouseholdCulture property here to update into firebase for each family
  const {campYear, family, parents, campers, demographics, household} =
    registrationPayload;

  const campRef = db.collection("camps").doc(campYear.toString());

  const emails = parents.map((p) => p.email as string);

  assertCallerEmailInList(authEmail, emails);

  // Update the family, parents, and campers according to the payload.
  const familyRef = await updateAndGetFamily(
    db, family, emails, household, authEmail
  );
  const parentRefs = await updateAndGetParents(db, familyRef, parents);

  // Update each camper and create an initial registration for them
  const camperAndStatuses: CamperAndStatus[] = [];
  await Promise.all(
    campers.map(async (camperAndRegInfo, index) => {
      const camperRef = await updateAndGetCamper(
        familyRef,
        camperAndRegInfo,
        demographics[index]
      );

      // Find or create the registration
      const registrationRefAndDidExist = await findOrCreateRegistration(
        camperRef,
        campRef
      );

      // If the camper should be waitlisted and they didn't already exist, then
      // mark the registration as Waitlist. Otherwise, we'll mark them as Pending Payment
      // until the Stripe payment succeeds.
      // NOTE: that it's possible we could have only one remaining spot but two campers we're registering here.
      // In this scenario, we want to ensure both campers in the family can register, and we'll have one or two additional
      // capacity. This is an edge case where we hope that other campers will end up cancelling.
      const campTrack = getCampTrack(camperAndRegInfo.grade ?? 4);
      const remainingSpotsForTrack = remainingSpots[campTrack] ?? 0;
      const shouldWaitlist = forceWaitlist || remainingSpotsForTrack <= 0;

      let status = shouldWaitlist
        ? RegistrationStatus.WAITLIST
        : RegistrationStatus.PENDING_PAYMENT;
      if (shouldWaitlist && registrationRefAndDidExist.didExist) {
        const existingRegistration = await registrationRefAndDidExist.ref.get();

        // If we hit the waitlist stage, but there's an existing status for pending payment
        // meaning they've been moved off the waitlist, then we should continue with the pending registration.
        const existingStatus = existingRegistration.data()?.status;
        if (existingStatus == RegistrationStatus.PENDING_PAYMENT) {
          status = RegistrationStatus.PENDING_PAYMENT;
        }
      }

      const camperName = `${camperAndRegInfo?.firstName} ${camperAndRegInfo?.lastName}`;
      await registrationRefAndDidExist.ref.set(
        {
          camperName: camperName,
          camper: camperRef,
          campTrack: campTrack,

          grade: camperAndRegInfo.grade,
          status: status,
          shirtSize: camperAndRegInfo.shirtSize,
          isReturning: camperAndRegInfo?.isReturning ?? false,
          cabinPreference: camperAndRegInfo?.cabinPreference ?? "",

          // createdAt already set
          updatedAt: FieldValue.serverTimestamp(),
          waitlistTime: FieldValue.serverTimestamp(),

          // payments not updated yet

          additionalNotes: camperAndRegInfo?.additionalNotes ?? null,
          // internalNotes not set here

          waiverFullName: camperAndRegInfo?.waiverFullName ?? "",
          waiverSignature: camperAndRegInfo?.waiverSignature ?? "",
          waiverSignDate: camperAndRegInfo?.waiverSignDate ?? "",

          familyEmails: emails.map((e) => e.toLowerCase()),
        },
        {
          merge: true,
        }
      );

      // Add the registration to the camper if it didn't already eixst
      await camperRef.update({
        registrations: FieldValue.arrayUnion(registrationRefAndDidExist.ref),
      });

      // Update camperAndStatuses so we can properly create the Stripe checkout session
      camperAndStatuses.push({
        camperName: camperName,
        campTrack: campTrack,
        isWaitlisted: status === RegistrationStatus.WAITLIST,
        status: status,
        registrationRef: registrationRefAndDidExist.ref,
      });
    })
  );

  return {
    familyRef: familyRef,
    parentRefs: parentRefs,
    camperAndStatuses: camperAndStatuses,
  };
}
