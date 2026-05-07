"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleTestStripeWebhook = exports.handleStripeWebhook = void 0;
const firebase_functions_1 = require("firebase-functions");
const utils_1 = require("../utils");
const fullfillRegistration_1 = require("../registration/fullfillRegistration");
const fulfillPreRegistrations_1 = require("../preRegistration/fulfillPreRegistrations");
const slackChannelWebhooks_1 = require("../slack/slackChannelWebhooks");
/**
 * A wrapper around the anonymous function handler used in onRequest. This wrapper
 * provides the database object as needed.
 * @param isProd Whether the request is coming from the production or test webhook
 * @returns The actual onRequest object used by the webhook.
 */
function handleStripeWebhookHelper(isProd) {
    const db = (0, utils_1.getFirestoreDb)(isProd);
    const stripe = (0, utils_1.getStripe)(isProd);
    return async (request, response) => {
        const sig = request.headers["stripe-signature"];
        let event;
        try {
            // Verify the request against our endpointSecret
            event = stripe.webhooks.constructEvent(request.rawBody, sig, isProd ? utils_1.stripeEndpointSecret : utils_1.testStripeEndpointSecret);
        }
        catch (err) {
            // We couldn't parse the event so send down 400 so the server will try again.
            firebase_functions_1.logger.error("Invalid Stripe event", err);
            response.status(400).send();
            return;
        }
        try {
            switch (event.type) {
                case "checkout.session.completed":
                case "checkout.session.async_payment_succeeded": {
                    firebase_functions_1.logger.info("Handling a checkout session");
                    const session = event.data.object;
                    const sessionWithLineItems = await stripe.checkout.sessions.retrieve(session.id, {
                        // We want to get the metadata on the product item.
                        // https://stripe.com/docs/expand
                        expand: [
                            "line_items.data.price.product",
                            "payment_intent.payment_method",
                        ],
                    });
                    const eventType = sessionWithLineItems.metadata?.eventType ?? "-1";
                    switch (parseInt(eventType)) {
                        case utils_1.StripeWebhookEventType.Registration:
                            await (0, fullfillRegistration_1.fulfillRegistration)(db, sessionWithLineItems, !isProd /* isTestData */);
                            break;
                        case utils_1.StripeWebhookEventType.PreRegistration:
                            await (0, fulfillPreRegistrations_1.fulfillPreRegistrations)(db, sessionWithLineItems, !isProd /* isTestData */);
                            break;
                        case utils_1.StripeWebhookEventType.Donation:
                            await (0, slackChannelWebhooks_1.sendMessageToRegistrationForCampChannel)(`Donation: ${(sessionWithLineItems?.amount_total ?? 0) / 100} from ${sessionWithLineItems.customer_email ??
                                sessionWithLineItems.customer_details?.email ??
                                ""}`);
                            break;
                        default:
                            firebase_functions_1.logger.error(`Invalid event type: ${sessionWithLineItems.metadata?.eventType}`);
                            (0, slackChannelWebhooks_1.sendMessageToRegistrationErrorMessages)(`Invalid event type: ${sessionWithLineItems.metadata?.eventType}`);
                    }
                    break;
                }
                default:
                    firebase_functions_1.logger.error("Unhandled event type");
            }
        }
        catch (error) {
            firebase_functions_1.logger.error("Failed to handle the event: ", error);
            (0, slackChannelWebhooks_1.sendMessageToRegistrationErrorMessages)("Failed to handle an event");
            response.status(500).send();
            return;
        }
        response
            .status(200)
            .json({
            received: true,
        })
            .send();
    };
}
exports.handleStripeWebhook = utils_1.functionsRegion.https.onRequest(handleStripeWebhookHelper(true /* isProd */));
exports.handleTestStripeWebhook = utils_1.functionsRegion.https.onRequest(handleStripeWebhookHelper(false /* isProd */));
//# sourceMappingURL=handleStripeWebhook.js.map