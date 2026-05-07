"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.issueStripeRefund = void 0;
// Firebase
const firebase_functions_1 = require("firebase-functions");
const https_1 = require("firebase-functions/v2/https");
// Utils
const utils_1 = require("../utils");
const slackChannelWebhooks_1 = require("../slack/slackChannelWebhooks");
/**
 * Issues a full refund for the charge from a given Stripe checkout session.
 * @param stripeId The Stripe ID associated with the charge being refunded
 * @param amount A positive integer in representing how much of this charge to refund (in cents)
 * @param isTestData Whether this request is for test data
 * @returns Code 200 if successful, 402 if any error occurs
 */
exports.issueStripeRefund = (0, https_1.onCall)({ cors: true }, async (request) => {
    // If the user isn't signed in, then this isn't a valid request.
    if (!request.auth) {
        return {
            status: "error",
            code: 401,
            message: "Not signed in",
        };
    }
    try {
        const stripe = (0, utils_1.getStripe)(!request.data.isTestData);
        let paymentIntent = null;
        if (request.data.stripeId.includes("pi_")) {
            paymentIntent = request.data.stripeId;
        }
        else if (request.data.stripeId.includes("cs_")) {
            const checkoutSession = await stripe.checkout.sessions.retrieve(request.data.stripeId);
            paymentIntent =
                typeof checkoutSession.payment_intent === "string"
                    ? checkoutSession.payment_intent
                    : checkoutSession.payment_intent.id;
        }
        else {
            throw new Error("stripeId is neither payment intent or checkout session!");
        }
        const refundResponse = await stripe.refunds.create({
            amount: request.data.amount,
            payment_intent: paymentIntent,
        });
        const formattedAmount = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(request.data.amount / 100.0);
        return {
            status: "success",
            code: 200,
            message: `created refund (${refundResponse.id}) of ${formattedAmount}`,
        };
    }
    catch (e) {
        firebase_functions_1.logger.error(e);
        (0, slackChannelWebhooks_1.sendMessageToRegistrationErrorMessages)(`Failed to create a Stripe refund for session: ${request.data.stripeId}`);
        return {
            status: "error",
            code: 402,
            message: "failed to create refund",
        };
    }
});
//# sourceMappingURL=issueStripeRefund.js.map