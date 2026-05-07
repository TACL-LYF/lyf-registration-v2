import Stripe from "stripe";
import {logger} from "firebase-functions";

// Local imports
import {
  createStripeCheckoutSession,
  LineItem,
} from "../stripe/createStripeCheckoutSession";
import {getStripeCustomerId} from "../registrationUtils";
import {
  functionsRegion,
  getFirestoreDb,
  StripeWebhookEventType,
} from "../utils";

// Import schema
import {PreRegistrationInputPayload} from "lyf-registration-schemas";

export interface PreRegistrationLineItemMetadata extends Stripe.Metadata {
  campYear: string;
  camperName: string;
  camperRefString: string;
  currentGradeString: string;
}

export const createPreRegistrationSession = functionsRegion.https.onCall(
  (data: PreRegistrationInputPayload, context) => {
    // If the user isn't signed in, then this isn't a valid request.
    if (!context.auth) {
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
    } = data;

    const db = getFirestoreDb(!isTestData);
    // Need to convert to strings since the value is possibly null.
    const camperCurrentGradesString = camperCurrentGrades?.map((grade) =>
      grade ? grade.toString() : ""
    );

    // Price of a pre-registration is hard-coded at $500 right now but eventually we can get this from the firebase
    // database for the camp document.
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

    // If the user included a donation, then add that line item.
    if (donationAmount > 0) {
      stripeLineItems.push({
        priceInDollars: donationAmount,
        name: "Donation",
      });
    }

    // Create the parent mapping based on the path of one of the campers.
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

    // Try and get an existing customer. If one doesn't exist, then create one.
    // Then use that customer to create a checkout session.
    return getStripeCustomerId(parentRef, email, isTestData)
      .then((stripeCustomerId) =>
        // Create the stripe checkout session with the new id
        createStripeCheckoutSession(
          stripeLineItems,
          successUrl,
          cancelUrl,
          stripeCustomerId,
          StripeWebhookEventType.PreRegistration,
          paymentDescription,
          isTestData,
          null /* discount */
        )
      )
      .then((result) => {
        return {
          sessionId: result.id,
        };
      })
      .catch((error) => {
        logger.error(error);
        return {
          status: "error",
          code: 402,
          message: "Failed to create a Stripe Checkout session",
        };
      })
      .catch((error) => {
        logger.error(error);
        return {
          status: "error",
          code: 402,
          message: "Failed to create the Stripe Customer",
        };
      });
  }
);
