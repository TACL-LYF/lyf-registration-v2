"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRegistrationSession = void 0;
const firebase_functions_1 = require("firebase-functions");
const https_1 = require("firebase-functions/v2/https");
// Local imports
const createStripeCheckoutSession_1 = require("../stripe/createStripeCheckoutSession");
const utils_1 = require("../utils");
const slackChannelWebhooks_1 = require("../slack/slackChannelWebhooks");
const registrationUtils_1 = require("../registrationUtils");
const createDonationSession_1 = require("../donation/createDonationSession");
const createOrUpdateRegistration_1 = require("./createOrUpdateRegistration");
// Import schema
const lyf_registration_schemas_1 = require("lyf-registration-schemas");
const sendWaitlistEmail_1 = require("../registrationUtils/sendWaitlistEmail");
const fullfillRegistration_1 = require("./fullfillRegistration");
const firestore_1 = require("firebase-admin/firestore");
exports.createRegistrationSession = (0, https_1.onCall)({ cors: true }, async (request) => {
    // If the user isn't signed in, then this isn't a valid request.
    if (!request.auth) {
        return {
            status: "error",
            code: 401,
            message: "Not signed in",
        };
    }
    const { campYear, parents, campers, donation, successUrl, cancelUrl, isTestData = false, forceWaitlist = false, } = request.data;
    const db = (0, utils_1.getFirestoreDb)(!isTestData);
    // Get the registration pricing.
    const campRef = db.collection("camps").doc(campYear.toString());
    const campData = (await campRef.get()).data();
    const campPrice = (0, lyf_registration_schemas_1.getRegistrationPrice)(campData);
    const campPreRegistrationFee = campData?.preRegistrationFee ?? 500;
    const siblingDiscount = campData?.siblingDiscount ?? 80;
    const remainingSpots = campData?.remainingSpots ?? {
        [lyf_registration_schemas_1.CampTrack.YOUNGER]: 0,
        [lyf_registration_schemas_1.CampTrack.OLDER]: 0,
    };
    // Update the family, parent, camper, and registration info accordingly
    const { familyRef, parentRefs, camperAndStatuses } = await (0, createOrUpdateRegistration_1.createOrUpdateRegistration)(db, request.data, remainingSpots, forceWaitlist, request.auth.token.email);
    // Assume the first parent is the signed in parent.
    const signedInParentRef = parentRefs[0];
    const signedInParentEmail = request.auth.token.email ?? parents[0].email?.toLowerCase();
    const waitlistedCampers = camperAndStatuses.filter(({ isWaitlisted }) => isWaitlisted);
    const registeredCampers = camperAndStatuses.filter(({ isWaitlisted }) => !isWaitlisted);
    const allWaitlisted = waitlistedCampers.length === campers.length;
    const hasWaitlistedCampers = waitlistedCampers.length > 0;
    // Send waitlist message to camp channel for all waitlisted campers.
    await Promise.all(waitlistedCampers.map(async ({ camperName, campTrack }) => {
        await (0, slackChannelWebhooks_1.sendMessageToRegistrationForCampChannel)(`LYF Camp ${campYear} Waitlist: ${camperName}`, isTestData);
        // TODO: Replace this with an individualized waitlist email once we have that ready.
        await (0, sendWaitlistEmail_1.sendWaitlistEmail)(signedInParentEmail, campYear, campTrack, camperName);
    }));
    // If all the campers are waitlisted, then that means we can early return.
    if (allWaitlisted) {
        // If there's no donation, then we can just return from here.
        if (donation <= 0) {
            return {
                status: "success",
                code: 200,
                sessionId: null,
                isWaitlist: true,
            };
        }
        return await (0, createDonationSession_1.createRegistrationDonationSession)(campYear, donation, signedInParentRef, signedInParentEmail, successUrl, cancelUrl, true, // isWaitlist
        isTestData);
    }
    let totalRegistrationCost = 0;
    const stripeLineItems = [];
    // Create Stripe line items for the registrations.
    await Promise.all(registeredCampers.map(async ({ camperName, campTrack, registrationRef }) => {
        const regData = (await registrationRef.get()).data();
        const isPreRegistered = regData?.isPreRegistered ?? false;
        const registrationCost = campPrice - (isPreRegistered ? campPreRegistrationFee : 0);
        totalRegistrationCost += registrationCost;
        stripeLineItems.push({
            priceInDollars: registrationCost,
            name: `LYF Camp ${campYear} Registration${isPreRegistered ? " for Pre-Registered Camper" : ""}: ${camperName}`,
            metadata: {
                familyRef: familyRef.path,
                registrationRef: registrationRef.path,
                // Metadata can only be strings, and even enums have to be converted to strings.
                campYear: campYear.toString(),
                campTrack: campTrack.toString(),
            },
        });
    }));
    // We don't trust any discounts applied from the client-side, so re-compute them here.
    const siblingDiscountAmount = siblingDiscount * (campers.length - 1);
    totalRegistrationCost -= siblingDiscountAmount;
    // Apply any camp credit that the family has.
    const campCredit = await db.collection("credits").doc(familyRef.id).get();
    const campCreditRemaining = campCredit.data()?.amountRemaining ?? 0;
    const campCreditUsed = Math.min(totalRegistrationCost, campCreditRemaining);
    // At this point, if they have more camp credit than the total registration cost
    // (i.e. financial aid), then we just need to immediately return or create a donation session
    if (totalRegistrationCost <= campCreditUsed) {
        // Complete the registrations
        const campTrackSpots = new Map();
        await Promise.all(camperAndStatuses.map(async (c) => {
            await c.registrationRef.update({
                status: lyf_registration_schemas_1.RegistrationStatus.ACTIVE,
                updatedAt: firestore_1.FieldValue.serverTimestamp(),
            });
            campTrackSpots.set(c.campTrack, (campTrackSpots.get(c.campTrack) ?? 0) + 1);
        }));
        await (0, fullfillRegistration_1.completeRegistration)(db, isTestData, campYear.toString(), signedInParentEmail, familyRef, camperAndStatuses.map((c) => c.registrationRef), stripeLineItems.map((s) => s.name), campCreditUsed, campTrackSpots);
        // If there's no donation, then we can just return from here.
        if (donation <= 0) {
            return {
                status: "success",
                code: 200,
                sessionId: null,
                isWaitlist: hasWaitlistedCampers,
            };
        }
        return await (0, createDonationSession_1.createRegistrationDonationSession)(campYear, donation, signedInParentRef, signedInParentEmail, hasWaitlistedCampers ? `${successUrl}&waitlist=1` : successUrl, cancelUrl, hasWaitlistedCampers, // isWaitlist
        isTestData);
    }
    // Otherwise, we'll continue with the checkout session creation
    const camperNames = registeredCampers
        .map(({ camperName }) => camperName)
        .join(", ");
    const paymentDescription = `TACL-LYF Camp ${campYear} Registration for ${camperNames}${donation > 0 ? " + Donation" : ""}`;
    // If the user included a donation, then add that line item.
    if (donation > 0) {
        stripeLineItems.push({
            priceInDollars: donation,
            name: "Donation",
        });
    }
    const totalOff = siblingDiscountAmount + campCreditUsed;
    const discount = totalOff > 0
        ? {
            name: (0, registrationUtils_1.createDiscountName)(siblingDiscountAmount, campCreditUsed),
            amount: totalOff,
        }
        : null;
    const customerId = await (0, registrationUtils_1.getStripeCustomerId)(signedInParentRef, signedInParentEmail, isTestData).catch((e) => {
        firebase_functions_1.logger.error(e);
        return null;
    });
    if (!customerId) {
        (0, slackChannelWebhooks_1.sendMessageToRegistrationErrorMessages)(`Failed to create Stripe Customer: ${signedInParentEmail}`);
        return {
            status: "error",
            code: 402,
            message: "Failed to create the Stripe Customer",
        };
    }
    try {
        const session = await (0, createStripeCheckoutSession_1.createStripeCheckoutSession)(stripeLineItems, hasWaitlistedCampers ? `${successUrl}&waitlist=1` : successUrl, cancelUrl, customerId, utils_1.StripeWebhookEventType.Registration, paymentDescription, isTestData, discount);
        return {
            status: "success",
            code: 200,
            sessionId: session.id,
            isWaitlist: hasWaitlistedCampers,
        };
    }
    catch (e) {
        firebase_functions_1.logger.error(e);
        (0, slackChannelWebhooks_1.sendMessageToRegistrationErrorMessages)(`Failed to create a Stripe Checkout session: ${signedInParentEmail}`);
        return {
            status: "error",
            code: 402,
            message: "Failed to create a Stripe Checkout session",
        };
    }
});
//# sourceMappingURL=createRegistrationSession.js.map