import Stripe from "stripe";
import {FieldValue, Firestore} from "firebase-admin/firestore";
import {logger} from "firebase-functions";

// Local imports
import {RegistrationStatus} from "lyf-registration-schemas";
import {PreRegistrationLineItemMetadata} from "./createPreRegistrationSession";
import {
  sendMessageToRegistrationForCampChannel,
  sendMessageToRegistrationErrorMessages,
} from "../slack/slackChannelWebhooks";
import {addParentsToMailchimpList} from "../utils/mailchimp";
import {RegistrationType} from "../utils";

/**
 * Complete the Stripe webhook event that let us know a pre-registration succeeded.
 * @param checkoutSession
 * @returns
 */
export async function fulfillPreRegistrations(
  db: Firestore,
  checkoutSession: Stripe.Checkout.Session,
  isTestData: boolean
) {
  const lineItems = checkoutSession.line_items;
  const sessionMessage = `session ${checkoutSession.id} from ${checkoutSession.customer_email}`;
  if (!lineItems) {
    logger.error(`No line items found on ${sessionMessage}`);
    sendMessageToRegistrationErrorMessages(
      `No line items found on ${sessionMessage}`
    );
    return;
  }

  const isPendingPayment = checkoutSession.payment_status === "unpaid";

  if (isPendingPayment) {
    logger.warn(
      `Payment not yet completed, so we'll finish the pre-registration later on ${sessionMessage}`
    );
  }

  const donation = lineItems.data.find((item) =>
    item.description.includes("Donation")
  )?.amount_total;
  const lineItemsWithoutDonation = lineItems.data.filter(
    (item) => !item.description.includes("Donation")
  );

  // Add a payment to our Stripe database
  const paymentIntent = checkoutSession.payment_intent as Stripe.PaymentIntent;
  const paymentMethod = (paymentIntent.payment_method as Stripe.PaymentMethod)
    .type;

  const paymentRef = db.collection("payments").doc(paymentIntent.id);

  await paymentRef.set(
    {
      customerEmail: checkoutSession.customer_details?.email,
      customerName: checkoutSession.customer_details?.name,
      customerId: checkoutSession.customer,
      donation: (donation || 0) / 100,
      items: lineItemsWithoutDonation.map((item) => ({
        amount: item.amount_total / 100,
        description: item.description,
      })),
      stripeId: paymentIntent.id,
      total: (checkoutSession.amount_total || 0) / 100,
      type: "Stripe",
      paymentMethod: paymentMethod,
      status: checkoutSession.payment_status,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    {
      merge: true,
    }
  );

  // Pre-Register the campers
  await Promise.all(
    lineItemsWithoutDonation.map(async (item, index) => {
      const product = item.price?.product as Stripe.Product;
      const metadata = product?.metadata as PreRegistrationLineItemMetadata;

      if (!metadata) {
        logger.error("No metadata found on line item: ", item);
        sendMessageToRegistrationErrorMessages(
          `No metadata found on line item with index ${index} on ${sessionMessage}`
        );
        return;
      }

      const {campYear, camperName, camperRefString, currentGradeString} =
        metadata;

      if (campYear === "") {
        logger.error(
          `Couldn't find camp year in the pre-registration line items on ${sessionMessage}`
        );
        sendMessageToRegistrationErrorMessages(
          `Couldn't find camp year in the pre-registration line items on ${sessionMessage}`
        );
        return;
      }

      // Create all the references and data used to create the pre-registration
      const nextYearsCamp = db
        .collection("camps")
        .doc(campYear)
        .collection("registrations");
      const camperRef = db.doc(camperRefString);
      const nextYearGrade =
        currentGradeString != "" ? parseInt(currentGradeString) + 1 : null;

      // Create a pre-registration for next year's camp.
      const preRegistrationRef = nextYearsCamp.doc(camperRef.id);
      await preRegistrationRef.set(
        {
          // If the payment isn't completed yet, then mark the camper as pending payment.
          status: isPendingPayment
            ? RegistrationStatus.PENDING_PAYMENT
            : RegistrationStatus.PARTIAL_PAYMENT,
          amountPaid: FieldValue.increment(
            isPendingPayment ? 0 : item.amount_subtotal / 100
          ),
          grade: nextYearGrade,
          isPreRegistered: true,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
          camper: camperRef,
          camperName: camperName,
          payments: FieldValue.arrayUnion(paymentRef),
        },
        {
          merge: true,
        }
      );

      // Associate that pre-registration with the camper.
      await camperRef.update({
        registrations: FieldValue.arrayUnion(preRegistrationRef),
      });

      // Send a message to our Slack channel
      await sendMessageToRegistrationForCampChannel(
        isPendingPayment
          ? `Processing payment from: ${checkoutSession.customer_email}`
          : item.description,
        isTestData
      );

      // If this is the last item, then update the parent's mailchimp info as well.
      // This is a bit hacky but we couldn't put this after the loop if we wanted all of them to be processed in parallel.
      const parentCollectionRef =
        camperRef.parent.parent?.collection("parents");
      if (
        index === lineItemsWithoutDonation.length - 1 &&
        parentCollectionRef
      ) {
        await addParentsToMailchimpList(
          RegistrationType.PreRegistration,
          parentCollectionRef,
          campYear
        );
      }
    })
  );

  logger.info(
    `Successfully recorded payment from ${checkoutSession.customer_details?.email} with status: ${checkoutSession.payment_status}`
  );
}
