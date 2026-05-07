import Stripe from "stripe";
import {logger} from "firebase-functions";

import {
  functionsRegion,
  stripeEndpointSecret,
  testStripeEndpointSecret,
  StripeWebhookEventType,
  getFirestoreDb,
  getStripe,
} from "../utils";
import {fulfillRegistration} from "../registration/fullfillRegistration";
import {fulfillPreRegistrations} from "../preRegistration/fulfillPreRegistrations";
import {
  sendMessageToRegistrationErrorMessages,
  sendMessageToRegistrationForCampChannel,
} from "../slack/slackChannelWebhooks";

type OnRequestType = typeof functionsRegion.https.onRequest;
type OnRequestHandler = Parameters<OnRequestType>[0];

/**
 * A wrapper around the anonymous function handler used in onRequest. This wrapper
 * provides the database object as needed.
 * @param isProd Whether the request is coming from the production or test webhook
 * @returns The actual onRequest object used by the webhook.
 */
function handleStripeWebhookHelper(isProd: boolean): OnRequestHandler {
  const db = getFirestoreDb(isProd);
  const stripe = getStripe(isProd);

  return async (request, response) => {
    const sig = request.headers["stripe-signature"] as string;
    let event: Stripe.Event;
    try {
      // Verify the request against our endpointSecret
      event = stripe.webhooks.constructEvent(
        request.rawBody,
        sig,
        isProd ? stripeEndpointSecret : testStripeEndpointSecret
      );
    } catch (err) {
      // We couldn't parse the event so send down 400 so the server will try again.
      logger.error("Invalid Stripe event", err);
      response.status(400).send();
      return;
    }

    try {
      switch (event.type) {
        case "checkout.session.completed":
        case "checkout.session.async_payment_succeeded": {
          logger.info("Handling a checkout session");
          const session = event.data.object as Stripe.Checkout.Session;
          const sessionWithLineItems = await stripe.checkout.sessions.retrieve(
            session.id,
            {
              // We want to get the metadata on the product item.
              // https://stripe.com/docs/expand
              expand: [
                "line_items.data.price.product",
                "payment_intent.payment_method",
              ],
            }
          );

          const eventType = sessionWithLineItems.metadata?.eventType ?? "-1";

          switch (parseInt(eventType)) {
            case StripeWebhookEventType.Registration:
              await fulfillRegistration(
                db,
                sessionWithLineItems,
                !isProd /* isTestData */
              );
              break;
            case StripeWebhookEventType.PreRegistration:
              await fulfillPreRegistrations(
                db,
                sessionWithLineItems,
                !isProd /* isTestData */
              );
              break;
            case StripeWebhookEventType.Donation:
              await sendMessageToRegistrationForCampChannel(
                `Donation: ${
                  (sessionWithLineItems?.amount_total ?? 0) / 100
                } from ${
                  sessionWithLineItems.customer_email ??
                  sessionWithLineItems.customer_details?.email ??
                  ""
                }`
              );
              break;
            default:
              logger.error(
                `Invalid event type: ${sessionWithLineItems.metadata?.eventType}`
              );
              sendMessageToRegistrationErrorMessages(
                `Invalid event type: ${sessionWithLineItems.metadata?.eventType}`
              );
          }
          break;
        }
        default:
          logger.error("Unhandled event type");
      }
    } catch (error) {
      logger.error("Failed to handle the event: ", error);
      sendMessageToRegistrationErrorMessages("Failed to handle an event");
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

export const handleStripeWebhook = functionsRegion.https.onRequest(
  handleStripeWebhookHelper(true /* isProd */)
);

export const handleTestStripeWebhook = functionsRegion.https.onRequest(
  handleStripeWebhookHelper(false /* isProd */)
);
