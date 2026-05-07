import Stripe from "stripe";
import {logger} from "firebase-functions";
import {onCall} from "firebase-functions/v2/https";

// Local imports
import {
  createStripeCheckoutSession,
  LineItem,
} from "../stripe/createStripeCheckoutSession";
import {getStripeCustomerId} from "../registrationUtils";
import {getFirestoreDb, StripeWebhookEventType} from "../utils";

// Import schema
import {PreRegistrationInputPayload} from "lyf-registration-schemas";

export interface PreRegistrationLineItemMetadata extends Stripe.Metadata {
  campYear: string;
  camperName: string;
  camperRefString: string;
  currentGradeString: string;
}

export const createPreRegistrationSession = onCall<PreRegistrationInputPayload>(
  {cors: true},
  async (request) => {
    if (!request.auth) {
      return {
        status: "error",
        code: 401,
        message: "Not signed in",
      };
    }

    const {
      campersToPreRegister,
      camperRefsToPreRegister,
      camperCurrentGrades,
      campYear,
      donationAmount,
      email,
      successUrl,
      cancelUrl,
      isTestData = false,
    } = request.data;

    const db = getFirestoreDb(!isTestData);
    const camperCurrentGradesString = camperCurrentGrades?.map((grade) =>
      grade ? grade.toString() : ""
    );

    const stripeLineItems: LineItem<PreRegistrationLineItemMetadata>[] =
      campersToPreRegister.map((name, index) => ({
        priceInDollars: 500,
        name: `TACL LYF Camp ${campYear} Pre-Registration: ${name}`,
        metadata: {
          campYear: campYear.toString(),
          camperName: name,
          camperRefString: camperRefsToPreRegister[index],
          currentGradeString:
            camperCurrentGradesString &&
            camperCurrentGradesString.length > index
              ? camperCurrentGradesString[index]
              : "",
        },
      }));

    if (donationAmount > 0) {
      stripeLineItems.push({
        priceInDollars: donationAmount,
        name: "Donation",
      });
    }

    const parentRef =
      camperRefsToPreRegister.length > 0
        ? db
            .doc(camperRefsToPreRegister[0])
            .parent.parent?.collection("parents")
            .doc(email)
        : undefined;

    const paymentDescription =
      campersToPreRegister.length <= 0
        ? "LYF Camp Donation"
        : `LYF Camp ${campYear} Pre-Registration - ${campersToPreRegister.join(
            ", "
          )}${donationAmount > 0 ? " + Donation" : ""}`;

    try {
      const stripeCustomerId = await getStripeCustomerId(
        parentRef,
        email,
        isTestData
      );
      const result = await createStripeCheckoutSession(
        stripeLineItems,
        successUrl,
        cancelUrl,
        stripeCustomerId,
        StripeWebhookEventType.PreRegistration,
        paymentDescription,
        isTestData,
        null /* discount */
      );
      return {sessionId: result.id};
    } catch (error) {
      logger.error(error);
      return {
        status: "error",
        code: 402,
        message: "Failed to create a Stripe Checkout session",
      };
    }
  }
);
