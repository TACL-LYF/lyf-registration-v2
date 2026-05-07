// Firebase
import {logger} from "firebase-functions";
import {onCall} from "firebase-functions/v2/https";

// Utils
import {getStripe} from "../utils";
import {sendMessageToRegistrationErrorMessages} from "../slack/slackChannelWebhooks";
import {assertAdmin} from "../utils/auth";

type IssueStripeRefundRequest = {
  stripeId: string;
  amount: number;
  isTestData: boolean;
};

/**
 * Issues a full refund for the charge from a given Stripe checkout session.
 * @param stripeId The Stripe ID associated with the charge being refunded
 * @param amount A positive integer in representing how much of this charge to refund (in cents)
 * @param isTestData Whether this request is for test data
 * @returns Code 200 if successful, 402 if any error occurs
 */
export const issueStripeRefund = onCall<IssueStripeRefundRequest>(
  {cors: true},
  async (request) => {
    await assertAdmin(request, ["full_admin"]);

    try {
      const stripe = getStripe(!request.data.isTestData);
      let paymentIntent = null;
      if (request.data.stripeId.includes("pi_")) {
        paymentIntent = request.data.stripeId;
      } else if (request.data.stripeId.includes("cs_")) {
        const checkoutSession = await stripe.checkout.sessions.retrieve(
          request.data.stripeId
        );
        paymentIntent =
          typeof checkoutSession.payment_intent === "string"
            ? checkoutSession.payment_intent
            : checkoutSession.payment_intent!.id;
      } else {
        throw new Error(
          "stripeId is neither payment intent or checkout session!"
        );
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
    } catch (e) {
      logger.error(e);
      sendMessageToRegistrationErrorMessages(
        `Failed to create a Stripe refund for session: ${request.data.stripeId}`
      );
      return {
        status: "error",
        code: 402,
        message: "failed to create refund",
      };
    }
  }
);
