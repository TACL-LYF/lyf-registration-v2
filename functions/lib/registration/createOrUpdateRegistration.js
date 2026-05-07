"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrUpdateRegistration = createOrUpdateRegistration;
const firestore_1 = require("firebase-admin/firestore");
const lyf_registration_schemas_1 = require("lyf-registration-schemas");
const registrationUtils_1 = require("../registrationUtils");
/**
 * Given a family payload, update the family and return the reference to it.
 * @param db
 * @param familyPayload
 * @param emails
 * @returns
 */
async function updateAndGetFamily(db, familyPayload, emails, householdCulture) {
    const familyRef = await (0, registrationUtils_1.findOrCreateFamily)(db, emails);
    await familyRef.set({
        emails: firestore_1.FieldValue.arrayUnion(...emails),
        household: householdCulture,
        ...familyPayload,
    }, {
        merge: true,
    });
    return familyRef;
}
/**
 * Given a parent payload, update each parent and return the references to them.
 * @param db
 * @param familyRef
 * @param parentsPayload
 * @returns
 */
async function updateAndGetParents(db, familyRef, parentsPayload) {
    const parentRefs = [];
    await Promise.all(parentsPayload.map(async (parent) => {
        const parentRef = await (0, registrationUtils_1.findOrCreateParent)(familyRef, parent);
        parentRefs.push(parentRef);
        await parentRef.set({
            ...parent,
        }, {
            merge: true,
        });
    }));
    return parentRefs;
}
/**
 * Given a camper payload, update the camper and return the reference to it.
 * @param familyRef
 * @param camperAndRegInfo
 * @param demographics
 * @returns
 */
async function updateAndGetCamper(familyRef, camperAndRegInfo, demographics) {
    const camperRef = await (0, registrationUtils_1.findOrCreateCamper)(familyRef, camperAndRegInfo);
    await camperRef.set({
        firstName: camperAndRegInfo.firstName,
        lastName: camperAndRegInfo.lastName,
        preferredName: camperAndRegInfo.preferredName ?? null,
        birthDate: camperAndRegInfo.birthDate,
        gender: camperAndRegInfo.gender,
        pronouns: camperAndRegInfo.pronouns ?? null,
        dietAndFoodAllergies: camperAndRegInfo.dietAndFoodAllergies ?? null,
        medicalConditions: camperAndRegInfo.medicalConditions ?? null,
        // Start including the demographics info as part of the camper itself
        // rather than the registration like it was in 2023
        demographics: demographics,
    }, {
        merge: true,
    });
    return camperRef;
}
/**
 * Either create new family, camper, or registration references
 * or update the existing ones
 * @param registrationPayload The client-provided registration information.
 */
async function createOrUpdateRegistration(db, registrationPayload, remainingSpots, forceWaitlist, authEmail) {
    // TODO: Add HouseholdCulture property here to update into firebase for each family
    const { campYear, family, parents, campers, demographics, household } = registrationPayload;
    const campRef = db.collection("camps").doc(campYear.toString());
    // Get the parent's emails to determine if
    // TODO include the auth email in this too because that's guaranteed to be the same
    const emails = parents.map((p) => p.email);
    // Update the family, parents, and campers according to the payload.
    const familyRef = await updateAndGetFamily(db, family, emails, household);
    const parentRefs = await updateAndGetParents(db, familyRef, parents);
    // Update each camper and create an initial registration for them
    const camperAndStatuses = [];
    await Promise.all(campers.map(async (camperAndRegInfo, index) => {
        const camperRef = await updateAndGetCamper(familyRef, camperAndRegInfo, demographics[index]);
        // Find or create the registration
        const registrationRefAndDidExist = await (0, registrationUtils_1.findOrCreateRegistration)(camperRef, campRef);
        // If the camper should be waitlisted and they didn't already exist, then
        // mark the registration as Waitlist. Otherwise, we'll mark them as Pending Payment
        // until the Stripe payment succeeds.
        // NOTE: that it's possible we could have only one remaining spot but two campers we're registering here.
        // In this scenario, we want to ensure both campers in the family can register, and we'll have one or two additional
        // capacity. This is an edge case where we hope that other campers will end up cancelling.
        const campTrack = (0, lyf_registration_schemas_1.getCampTrack)(camperAndRegInfo.grade ?? 4);
        const remainingSpotsForTrack = remainingSpots[campTrack] ?? 0;
        const shouldWaitlist = forceWaitlist || remainingSpotsForTrack <= 0;
        let status = shouldWaitlist
            ? lyf_registration_schemas_1.RegistrationStatus.WAITLIST
            : lyf_registration_schemas_1.RegistrationStatus.PENDING_PAYMENT;
        if (shouldWaitlist && registrationRefAndDidExist.didExist) {
            const existingRegistration = await registrationRefAndDidExist.ref.get();
            // If we hit the waitlist stage, but there's an existing status for pending payment
            // meaning they've been moved off the waitlist, then we should continue with the pending registration.
            const existingStatus = existingRegistration.data()?.status;
            if (existingStatus == lyf_registration_schemas_1.RegistrationStatus.PENDING_PAYMENT) {
                status = lyf_registration_schemas_1.RegistrationStatus.PENDING_PAYMENT;
            }
        }
        const camperName = `${camperAndRegInfo?.firstName} ${camperAndRegInfo?.lastName}`;
        await registrationRefAndDidExist.ref.set({
            camperName: camperName,
            camper: camperRef,
            campTrack: campTrack,
            grade: camperAndRegInfo.grade,
            status: status,
            shirtSize: camperAndRegInfo.shirtSize,
            isReturning: camperAndRegInfo?.isReturning ?? false,
            cabinPreference: camperAndRegInfo?.cabinPreference ?? "",
            // createdAt already set
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
            waitlistTime: firestore_1.FieldValue.serverTimestamp(),
            // payments not updated yet
            additionalNotes: camperAndRegInfo?.additionalNotes ?? null,
            // internalNotes not set here
            waiverFullName: camperAndRegInfo?.waiverFullName ?? "",
            waiverSignature: camperAndRegInfo?.waiverSignature ?? "",
            waiverSignDate: camperAndRegInfo?.waiverSignDate ?? "",
        }, {
            merge: true,
        });
        // Add the registration to the camper if it didn't already eixst
        await camperRef.update({
            registrations: firestore_1.FieldValue.arrayUnion(registrationRefAndDidExist.ref),
        });
        // Update camperAndStatuses so we can properly create the Stripe checkout session
        camperAndStatuses.push({
            camperName: camperName,
            campTrack: campTrack,
            isWaitlisted: status === lyf_registration_schemas_1.RegistrationStatus.WAITLIST,
            status: status,
            registrationRef: registrationRefAndDidExist.ref,
        });
    }));
    return {
        familyRef: familyRef,
        parentRefs: parentRefs,
        camperAndStatuses: camperAndStatuses,
    };
}
//# sourceMappingURL=createOrUpdateRegistration.js.map