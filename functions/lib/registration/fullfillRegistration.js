"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeRegistration = completeRegistration;
exports.fulfillRegistration = fulfillRegistration;
const firestore_1 = require("firebase-admin/firestore");
const firebase_functions_1 = require("firebase-functions");
// Local imports
const lyf_registration_schemas_1 = require("lyf-registration-schemas");
const registrationUtils_1 = require("../registrationUtils");
const slackChannelWebhooks_1 = require("../slack/slackChannelWebhooks");
const mailchimp_1 = require("../utils/mailchimp");
const utils_1 = require("../utils");
const getRegistrationAndCamperInfo_1 = require("../registrationUtils/getRegistrationAndCamperInfo");
const sendRegistrationEmail_1 = require("../registrationUtils/sendRegistrationEmail");
/**
 * Small helper to calculate the discounts used while early-returning if we don't need to get the firestore object
 * @param db
 * @param discountAmount
 * @param campYearRef
 * @param numberOfRegistrations
 * @returns
 */
async function calculateDiscountAmounts(db, discountAmount, campYearRef, numberOfRegistrations) {
    if (discountAmount <= 0)
        return [0, 0];
    const campYearInfo = (await campYearRef.get()).data();
    const siblingDiscount = campYearInfo?.siblingDiscount ?? 0;
    const siblingDiscountUsed = (numberOfRegistrations - 1) * siblingDiscount;
    const campCreditUsed = discountAmount - siblingDiscountUsed;
    return [siblingDiscountUsed, campCreditUsed];
}
/**
 * Finalize the registration by
 * 1. Sending confirmation emails for each of the registered campers
 * 2. Sending messages to the registration channel for each camper
 * 3. Adding the parents to the mailchimp list
 * 4. Updating the remaining spots
 * 5. Subtracting camp credit if it was used
 *
 * @param db
 * @param isTestData
 * @param campYear
 * @param email
 * @param familyRef
 * @param registrationRefs
 * @param registrationDescriptions
 * @param campCreditUsed
 * @param campTrackSpots
 */
async function completeRegistration(db, isTestData, campYear, email, familyRef, registrationRefs, registrationDescriptions, campCreditUsed, campTrackSpots) {
    // Send confirmation emails to registered campers
    await Promise.all(registrationRefs.map(async (ref) => {
        const { camper, camperHealth, registration } = await (0, getRegistrationAndCamperInfo_1.getRegistrationAndCamperInfo)(db, ref);
        if (!camper || !registration) {
            await (0, slackChannelWebhooks_1.sendMessageToRegistrationErrorMessages)(`Failed to send confirmation email to ${email} for ${registration?.camperName ?? ref.id}`);
            return;
        }
        firebase_functions_1.logger.info(`Sending confirmation email to ${email}`);
        try {
            await (0, sendRegistrationEmail_1.sendRegistrationEmail)(email, Number.parseInt(campYear), camper, registration, camperHealth);
        }
        catch (e) {
            await (0, slackChannelWebhooks_1.sendMessageToRegistrationErrorMessages)(`Failed to send confirmation email to ${email} for ${registration?.camperName ?? ref.id}`);
            firebase_functions_1.logger.error(`Error sending confirmation email: ${e}`);
        }
    }));
    // Send messages to the registration channel for every camper
    await Promise.all(registrationDescriptions.map(async (description) => {
        try {
            await (0, slackChannelWebhooks_1.sendMessageToRegistrationForCampChannel)(description, isTestData);
        }
        catch (e) {
            firebase_functions_1.logger.error(`Error sending slack message: ${e}`);
        }
    }));
    // Make sure the parents are signed up to the proper mailchimp list
    const parentCollectionRef = familyRef.collection("parents");
    await (0, mailchimp_1.addParentsToMailchimpList)(utils_1.RegistrationType.Registration, parentCollectionRef, campYear, Array.from(campTrackSpots.keys()));
    // Update the remaining spots
    if (campTrackSpots.size > 0) {
        const campYearRef = db.collection("camps").doc(campYear);
        await db.runTransaction(async (t) => {
            const campYearDoc = await t.get(campYearRef);
            const campYear = campYearDoc.data();
            const remainingSpots = campYear?.remainingSpots;
            // No camp year data found so just early return
            if (!remainingSpots)
                return;
            const newRemainingSpots = new Map();
            Object.entries(remainingSpots).forEach(([campTrack, spots]) => {
                const spotsToSubtract = campTrackSpots.get(campTrack) ?? 0;
                newRemainingSpots.set(campTrack, spots - spotsToSubtract);
            });
            t.update(campYearRef, {
                remainingSpots: Object.fromEntries(newRemainingSpots),
            });
        });
    }
    // Subtract camp credit if it was used
    if (campCreditUsed > 0) {
        const familyId = familyRef.id;
        const message = `Used camp credit for ${email} from family ${familyId}`;
        firebase_functions_1.logger.info(message);
        await (0, slackChannelWebhooks_1.sendMessageToRegistrationForCampChannel)(message);
        const creditRef = db.collection("credits").doc(familyId);
        await creditRef.update({
            amountRemaining: firestore_1.FieldValue.increment(-campCreditUsed),
            notes: firestore_1.FieldValue.arrayUnion(`-${campCreditUsed}: ${campYear} LYF Camp Registration`),
        });
    }
}
/**
 * Given a Stripe Checkout Session, parse the payment and fulfill the registration.
 * @param checkoutSession
 * @returns
 */
async function fulfillRegistration(db, checkoutSession, isTestData) {
    const lineItems = checkoutSession.line_items;
    const customerEmail = checkoutSession.customer_email ??
        checkoutSession.customer_details?.email ??
        "";
    const sessionMessage = `session ${checkoutSession.id} from ${customerEmail}`;
    firebase_functions_1.logger.debug(`Fulfilling registration for ${sessionMessage}`);
    if (!lineItems) {
        firebase_functions_1.logger.error("No line items found");
        (0, slackChannelWebhooks_1.sendMessageToRegistrationErrorMessages)(`No line items found in ${sessionMessage}`);
        return;
    }
    if (checkoutSession.payment_status === "unpaid") {
        firebase_functions_1.logger.warn("Payment not yet completed, so we'll finish the registration later");
        // We'll wait until the full payment is completed.
        return;
    }
    const donation = lineItems.data.find((item) => item.description.includes("Donation"))?.amount_total;
    const registrationLineItems = lineItems.data.filter((item) => item.description.includes("Registration"));
    const paymentIntent = checkoutSession.payment_intent;
    const paymentMethod = paymentIntent.payment_method
        .type;
    // Set default values we'll update with metadata from the registration line items
    let campYear = "";
    let familyRef = null;
    // Process the registration line items.
    const registrationRefs = [];
    const registrationDescriptions = [];
    const campTrackSpotsToSubtract = new Map();
    await Promise.all(registrationLineItems.map(async (item) => {
        const product = item.price?.product;
        const metadata = product?.metadata;
        if (!metadata) {
            firebase_functions_1.logger.error("No metadata found on line item: ", item);
            return;
        }
        firebase_functions_1.logger.debug("Processing registration line item metadata", metadata);
        const registrationRef = db.doc(metadata.registrationRef);
        registrationRefs.push(registrationRef);
        registrationDescriptions.push(item.description);
        campTrackSpotsToSubtract.set(metadata.campTrack, (campTrackSpotsToSubtract.get(metadata.campTrack) ?? 0) + 1);
        // Assume that this is the same for every registration line item
        familyRef = db.doc(metadata.familyRef);
        campYear = metadata.campYear;
    }));
    // Create the camp year document reference
    if (campYear === "") {
        firebase_functions_1.logger.error("Couldn't find camp year in any registration line items");
        (0, slackChannelWebhooks_1.sendMessageToRegistrationErrorMessages)(`Couldn't find camp year in any registration line items ${sessionMessage}`);
        return;
    }
    const campYearRef = db.collection("camps").doc(campYear);
    // Process the discount
    const discountAmount = (checkoutSession.total_details?.amount_discount ?? 0) / 100;
    const [siblingDiscountUsed, campCreditUsed] = await calculateDiscountAmounts(db, discountAmount, campYearRef, registrationRefs.length);
    // Create a payment in the payments collection
    const paymentRef = await db
        .collection("payments")
        .doc(checkoutSession.id);
    await paymentRef.set({
        customerEmail: customerEmail,
        customerName: checkoutSession.customer_details?.name ?? "",
        customerId: checkoutSession.customer ?? "",
        donation: (donation || 0) / 100,
        discount: discountAmount > 0
            ? {
                amount: discountAmount,
                name: (0, registrationUtils_1.createDiscountName)(siblingDiscountUsed, campCreditUsed),
            }
            : null,
        items: lineItems.data.map((item) => ({
            amount: item.amount_total / 100,
            description: item.description,
        })),
        paymentMethod: paymentMethod,
        registrations: firestore_1.FieldValue.arrayUnion(...registrationRefs),
        status: checkoutSession.payment_status,
        stripeId: checkoutSession.id,
        type: "Stripe",
        total: (checkoutSession.amount_total || 0) / 100,
        createdAt: firestore_1.FieldValue.serverTimestamp(),
        updatedAt: firestore_1.FieldValue.serverTimestamp(),
    }, {
        merge: true,
    });
    // Link the payment to the registration and update the status to active
    await Promise.all(registrationRefs.map(async (ref) => {
        await ref.update({
            payments: firestore_1.FieldValue.arrayUnion(paymentRef),
            status: checkoutSession.payment_status === "paid"
                ? lyf_registration_schemas_1.RegistrationStatus.ACTIVE
                : lyf_registration_schemas_1.RegistrationStatus.PROCESSING_PAYMENT,
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
        });
    }));
    // At this point even if the payment isn't fully processed, we should decrement the remaining spots.
    // This has to be done as an atomic operation to prevent
    // If the payment isn't yet paid, then we're done.
    if (checkoutSession.payment_status !== "paid") {
        await (0, slackChannelWebhooks_1.sendMessageToRegistrationForCampChannel)(`Processing payment from: ${customerEmail}`, isTestData);
        return;
    }
    // Otherwise, we need to do some additional processing afterwards.
    if (!familyRef) {
        const message = `No family ref found for ${sessionMessage}`;
        firebase_functions_1.logger.error(message);
        (0, slackChannelWebhooks_1.sendMessageToRegistrationErrorMessages)(message);
        return;
    }
    await completeRegistration(db, isTestData, campYear, customerEmail, familyRef, registrationRefs, registrationDescriptions, campCreditUsed, campTrackSpotsToSubtract);
}
//# sourceMappingURL=fullfillRegistration.js.map