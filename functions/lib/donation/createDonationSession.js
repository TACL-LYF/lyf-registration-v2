"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDonationSession = createDonationSession;
exports.createRegistrationDonationSession = createRegistrationDonationSession;
const firebase_functions_1 = require("firebase-functions");
// Local Imports
const slackChannelWebhooks_1 = require("../slack/slackChannelWebhooks");
const createStripeCheckoutSession_1 = require("../stripe/createStripeCheckoutSession");
const registrationUtils_1 = require("../registrationUtils");
const utils_1 = require("../utils");
/**
 * Create a standalone Donation Stripe Checkout Session.
 * @param campYear
 * @param parentRef
 * @param parentEmail
 * @param donationAmount
 * @param successUrl
 * @param cancelUrl
 * @returns
 */
async function createDonationSession(campYear, parentRef, parentEmail, donationAmount, successUrl, cancelUrl, isTestData) {
    const customerId = await (0, registrationUtils_1.getStripeCustomerId)(parentRef, parentEmail, isTestData).catch((e) => {
        firebase_functions_1.logger.error(e);
        return null;
    });
    if (!customerId) {
        (0, slackChannelWebhooks_1.sendMessageToRegistrationErrorMessages)(`Failed to create Stripe Customer: ${parentEmail}`);
        return null;
    }
    const lineItems = [
        {
            priceInDollars: donationAmount,
            name: `$${donationAmount} Donation`,
        },
    ];
    try {
        const session = await (0, createStripeCheckoutSession_1.createStripeCheckoutSession)(lineItems, successUrl, cancelUrl, customerId, utils_1.StripeWebhookEventType.Donation, `TACL-LYF Camp ${campYear} $${donationAmount} Donation`, isTestData);
        return session;
    }
    catch (e) {
        firebase_functions_1.logger.error(e);
        (0, slackChannelWebhooks_1.sendMessageToRegistrationErrorMessages)(`Failed to create a Stripe Checkout session: ${parentEmail}`);
        return null;
    }
}
/**
 * Create a donation session specific to the registration flow.
 *
 * Should immediately return from this response.
 * @param campYear
 * @param donation
 * @param signedInParentRef
 * @param signedInParentEmail
 * @param successUrl
 * @param cancelUrl
 * @param isWaitlist
 * @param isTestData
 * @returns
 */
async function createRegistrationDonationSession(campYear, donation, signedInParentRef, signedInParentEmail, successUrl, cancelUrl, isWaitlist, isTestData) {
    try {
        const session = await createDonationSession(campYear, signedInParentRef, signedInParentEmail, donation, isWaitlist ? `${successUrl}&waitlist=1` : successUrl, cancelUrl, isTestData);
        return {
            status: "success",
            code: 200, // Even if we failed to create the checkout session, we'll just return without creating the donation.
            sessionId: session?.id,
            isWaitlist: isWaitlist,
        };
    }
    catch (e) {
        firebase_functions_1.logger.error(e);
        (0, slackChannelWebhooks_1.sendMessageToRegistrationErrorMessages)(`Failed to create a Stripe Checkout session for donation: ${signedInParentEmail}`);
        return {
            status: "error",
            code: 402,
            message: "Failed to create a Stripe Checkout session for donation",
            isWaitlist: isWaitlist,
        };
    }
}
//# sourceMappingURL=createDonationSession.js.map