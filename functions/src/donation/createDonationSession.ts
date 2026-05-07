import Stripe from "stripe";
import {DocumentReference} from "firebase-admin/firestore";
import {logger} from "firebase-functions";

// Local Imports
import {sendMessageToRegistrationErrorMessages} from "../slack/slackChannelWebhooks";
import {createStripeCheckoutSession} from "../stripe/createStripeCheckoutSession";
import {getStripeCustomerId} from "../registrationUtils";

import {StripeWebhookEventType} from "../utils";

// Import Schema
import {Parent, RegistrationSessionResponse} from "lyf-registration-schemas";

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
export async function createDonationSession(
  campYear: number,
  parentRef: DocumentReference<Parent>,
  parentEmail: string,
  donationAmount: number,
  successUrl: string,
  cancelUrl: string,
  isTestData: boolean
): Promise<Stripe.Checkout.Session | null> {
  const customerId = await getStripeCustomerId(
    parentRef,
    parentEmail,
    isTestData
  ).catch((e) => {
    logger.error(e);
    return null;
  });

  if (!customerId) {
    sendMessageToRegistrationErrorMessages(
      `Failed to create Stripe Customer: ${parentEmail}`
    );
    return null;
  }

  const lineItems = [
    {
      priceInDollars: donationAmount,
      name: `$${donationAmount} Donation`,
    },
  ];

  try {
    const session = await createStripeCheckoutSession(
      lineItems,
      successUrl,
      cancelUrl,
      customerId,
      StripeWebhookEventType.Donation,
      `TACL-LYF Camp ${campYear} $${donationAmount} Donation`,
      isTestData
    );
    return session;
  } catch (e) {
    logger.error(e);
    sendMessageToRegistrationErrorMessages(
      `Failed to create a Stripe Checkout session: ${parentEmail}`
    );
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
export async function createRegistrationDonationSession(
  campYear: number,
  donation: number,
  signedInParentRef: DocumentReference<Parent>,
  signedInParentEmail: string,
  successUrl: string,
  cancelUrl: string,
  isWaitlist: boolean,
  isTestData: boolean
): Promise<RegistrationSessionResponse> {
  try {
    const session = await createDonationSession(
      campYear,
      signedInParentRef,
      signedInParentEmail,
      donation,
      isWaitlist ? `${successUrl}&waitlist=1` : successUrl,
      cancelUrl,
      isTestData
    );
    return {
      status: "success",
      code: 200, // Even if we failed to create the checkout session, we'll just return without creating the donation.
      sessionId: session?.id,
      isWaitlist: isWaitlist,
    };
  } catch (e) {
    logger.error(e);
    sendMessageToRegistrationErrorMessages(
      `Failed to create a Stripe Checkout session for donation: ${signedInParentEmail}`
    );
    return {
      status: "error",
      code: 402,
      message: "Failed to create a Stripe Checkout session for donation",
      isWaitlist: isWaitlist,
    };
  }
}
