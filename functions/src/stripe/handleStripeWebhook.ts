import * as Sentry from "@sentry/node";
import Stripe from "stripe";
import {logger} from "firebase-functions";
import {onRequest, Request} from "firebase-functions/v2/https";
import {Response} from "express";
import {FieldValue} from "firebase-admin/firestore";

import {
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

/**
 * A wrapper around the anonymous function handler used in onRequest. This wrapper
 * provides the database object as needed.
 * @param isProd Whether the request is coming from the production or test webhook
 * @returns The actual onRequest handler used by the webhook.
 */
function handleStripeWebhookHelper(
  isProd: boolean
): (request: Request, response: Response) => Promise<void> {
  const db = getFirestoreDb(isProd);
  const stripe = getStripe(isProd);

  return async (request, response) => {
    const sig = request.headers["stripe-signature"] as string;
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        request.rawBody,
        sig,
        isProd ? stripeEndpointSecret : testStripeEndpointSecret
      );
    } catch (err) {
      Sentry.captureException(err);
      logger.error("Invalid Stripe event", err);
      response.status(400).send();
      return;
    }

    // Idempotency: skip if this event has already been processed
    const eventRef = db.collection("_processedEvents").doc(event.id);
    const eventDoc = await eventRef.get();
    if (eventDoc.exists) {
      logger.info(`Event ${event.id} already processed, skipping`);
      response.status(200).json({received: true}).send();
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
      Sentry.captureException(error);
      logger.error("Failed to handle the event: ", error);
      sendMessageToRegistrationErrorMessages("Failed to handle an event");
      response.status(500).send();
      return;
    }

    // Mark event as processed for idempotency
    await eventRef.set({
      type: event.type,
      processedAt: FieldValue.serverTimestamp(),
    });

    response
      .status(200)
      .json({
        received: true,
      })
      .send();
  };
}

export const handleStripeWebhook = onRequest(
  {cors: false},
  handleStripeWebhookHelper(true /* isProd */)
);

export const handleTestStripeWebhook = onRequest(
  {cors: false},
  handleStripeWebhookHelper(false /* isProd */)
);
