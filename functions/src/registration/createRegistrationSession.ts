import Stripe from "stripe";
import {logger} from "firebase-functions";
import {HttpsError, onCall} from "firebase-functions/v2/https";

// Local imports
import {
  createStripeCheckoutSession,
  LineItem,
} from "../stripe/createStripeCheckoutSession";
import {getFirestoreDb, StripeWebhookEventType} from "../utils";
import {
  sendMessageToRegistrationErrorMessages,
  sendMessageToRegistrationForCampChannel,
} from "../slack/slackChannelWebhooks";
import {createDiscountName, getStripeCustomerId} from "../registrationUtils";
import {createRegistrationDonationSession} from "../donation/createDonationSession";
import {createOrUpdateRegistration} from "./createOrUpdateRegistration";
import {
  validateRedirectUrl,
  resolveTestDataFlag,
  validateDollarAmount,
} from "../utils/auth";

// Import schema
import {
  CampTrack,
  CampYear,
  getRegistrationPrice,
  RegistrationPayload,
  RegistrationStatus,
} from "lyf-registration-schemas";
import {sendWaitlistEmail} from "../registrationUtils/sendWaitlistEmail";
import {completeRegistration} from "./fullfillRegistration";
import {FieldValue} from "firebase-admin/firestore";

export interface RegistrationLineItemMetadata extends Stripe.Metadata {
  familyRef: string;
  registrationRef: string;
  campYear: string;
  campTrack: string;
}

export const createRegistrationSession = onCall<RegistrationPayload>(
  {cors: true},
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Not signed in");
    }

    const {
      campYear,
      parents,
      campers,
      donation,
      successUrl,
      cancelUrl,
      isTestData: requestedTestData = false,
      forceWaitlist = false,
    } = request.data;

    validateRedirectUrl(successUrl);
    validateRedirectUrl(cancelUrl);
    if (donation > 0) {
      validateDollarAmount(donation, "donation", 10000);
    }

    const isTestData = await resolveTestDataFlag(request, requestedTestData);
    const db = getFirestoreDb(!isTestData);

    // Get the registration pricing.
    const campRef = db.collection("camps").doc(campYear.toString());
    const campData = (await campRef.get()).data() as CampYear;
    const campPrice = getRegistrationPrice(campData);
    const campPreRegistrationFee = campData?.preRegistrationFee ?? 500;
    const siblingDiscount = campData?.siblingDiscount ?? 80;
    const remainingSpots = campData?.remainingSpots ?? {
      [CampTrack.YOUNGER]: 0,
      [CampTrack.OLDER]: 0,
    };

    // Update the family, parent, camper, and registration info accordingly
    const {familyRef, parentRefs, camperAndStatuses} =
      await createOrUpdateRegistration(
        db,
        request.data,
        remainingSpots,
        forceWaitlist,
        request.auth.token.email!
      );

    // Assume the first parent is the signed in parent.
    const signedInParentRef = parentRefs[0];
    const signedInParentEmail =
      request.auth.token.email ?? (parents[0].email?.toLowerCase() as string);

    const waitlistedCampers = camperAndStatuses.filter(
      ({isWaitlisted}) => isWaitlisted
    );
    const registeredCampers = camperAndStatuses.filter(
      ({isWaitlisted}) => !isWaitlisted
    );
    const allWaitlisted = waitlistedCampers.length === campers.length;
    const hasWaitlistedCampers = waitlistedCampers.length > 0;

    // Send waitlist message to camp channel for all waitlisted campers.
    await Promise.all(
      waitlistedCampers.map(async ({camperName, campTrack}) => {
        await sendMessageToRegistrationForCampChannel(
          `LYF Camp ${campYear} Waitlist: ${camperName}`,
          isTestData
        );

        // TODO: Replace this with an individualized waitlist email once we have that ready.
        await sendWaitlistEmail(
          signedInParentEmail,
          campYear,
          campTrack,
          camperName
        );
      })
    );

    // If all the campers are waitlisted, then that means we can early return.
    if (allWaitlisted) {
      // If there's no donation, then we can just return from here.
      if (donation <= 0) {
        return {
          status: "success",
          code: 200,
          sessionId: null,
          isWaitlist: true,
        };
      }

      return await createRegistrationDonationSession(
        campYear,
        donation,
        signedInParentRef,
        signedInParentEmail,
        successUrl,
        cancelUrl,
        true, // isWaitlist
        isTestData
      );
    }

    let totalRegistrationCost = 0;
    const stripeLineItems: LineItem<RegistrationLineItemMetadata>[] = [];

    // Create Stripe line items for the registrations.
    await Promise.all(
      registeredCampers.map(
        async ({camperName, campTrack, registrationRef}) => {
          const regData = (await registrationRef.get()).data();
          const isPreRegistered = regData?.isPreRegistered ?? false;
          const registrationCost =
            campPrice - (isPreRegistered ? campPreRegistrationFee : 0);

          totalRegistrationCost += registrationCost;
          stripeLineItems.push({
            priceInDollars: registrationCost,
            name: `LYF Camp ${campYear} Registration${
              isPreRegistered ? " for Pre-Registered Camper" : ""
            }: ${camperName}`,
            metadata: {
              familyRef: familyRef.path,
              registrationRef: registrationRef.path,
              // Metadata can only be strings, and even enums have to be converted to strings.
              campYear: campYear.toString(),
              campTrack: campTrack.toString(),
            },
          });
        }
      )
    );

    // We don't trust any discounts applied from the client-side, so re-compute them here.
    const siblingDiscountAmount = siblingDiscount * (campers.length - 1);
    totalRegistrationCost -= siblingDiscountAmount;

    // Apply any camp credit that the family has.
    const campCredit = await db.collection("credits").doc(familyRef.id).get();
    const campCreditRemaining = campCredit.data()?.amountRemaining ?? 0;
    const campCreditUsed = Math.min(totalRegistrationCost, campCreditRemaining);

    // At this point, if they have more camp credit than the total registration cost
    // (i.e. financial aid), then we just need to immediately return or create a donation session
    if (totalRegistrationCost <= campCreditUsed) {
      // Complete the registrations
      const campTrackSpots = new Map<string, number>();
      await Promise.all(
        camperAndStatuses.map(async (c) => {
          await c.registrationRef.update({
            status: RegistrationStatus.ACTIVE,
            updatedAt: FieldValue.serverTimestamp(),
          });

          campTrackSpots.set(
            c.campTrack,
            (campTrackSpots.get(c.campTrack) ?? 0) + 1
          );
        })
      );

      await completeRegistration(
        db,
        isTestData,
        campYear.toString(),
        signedInParentEmail,
        familyRef,
        camperAndStatuses.map((c) => c.registrationRef),
        stripeLineItems.map((s) => s.name),
        campCreditUsed,
        campTrackSpots
      );

      // If there's no donation, then we can just return from here.
      if (donation <= 0) {
        return {
          status: "success",
          code: 200,
          sessionId: null,
          isWaitlist: hasWaitlistedCampers,
        };
      }

      return await createRegistrationDonationSession(
        campYear,
        donation,
        signedInParentRef,
        signedInParentEmail,
        hasWaitlistedCampers ? `${successUrl}&waitlist=1` : successUrl,
        cancelUrl,
        hasWaitlistedCampers, // isWaitlist
        isTestData
      );
    }

    // Otherwise, we'll continue with the checkout session creation
    const camperNames = registeredCampers
      .map(({camperName}) => camperName)
      .join(", ");
    const paymentDescription = `TACL-LYF Camp ${campYear} Registration for ${camperNames}${
      donation > 0 ? " + Donation" : ""
    }`;

    // If the user included a donation, then add that line item.
    if (donation > 0) {
      stripeLineItems.push({
        priceInDollars: donation,
        name: "Donation",
      });
    }

    const totalOff = siblingDiscountAmount + campCreditUsed;
    const discount =
      totalOff > 0
        ? {
            name: createDiscountName(siblingDiscountAmount, campCreditUsed),
            amount: totalOff,
          }
        : null;

    const customerId = await getStripeCustomerId(
      signedInParentRef,
      signedInParentEmail,
      isTestData
    ).catch((e) => {
      logger.error(e);
      return null;
    });

    if (!customerId) {
      sendMessageToRegistrationErrorMessages(
        `Failed to create Stripe Customer: ${signedInParentEmail}`
      );
      return {
        status: "error",
        code: 402,
        message: "Failed to create the Stripe Customer",
      };
    }

    try {
      const session = await createStripeCheckoutSession(
        stripeLineItems,
        hasWaitlistedCampers ? `${successUrl}&waitlist=1` : successUrl,
        cancelUrl,
        customerId,
        StripeWebhookEventType.Registration,
        paymentDescription,
        isTestData,
        discount
      );
      return {
        status: "success",
        code: 200,
        sessionId: session.id,
        isWaitlist: hasWaitlistedCampers,
      };
    } catch (e) {
      logger.error(e);
      sendMessageToRegistrationErrorMessages(
        `Failed to create a Stripe Checkout session: ${signedInParentEmail}`
      );
      return {
        status: "error",
        code: 402,
        message: "Failed to create a Stripe Checkout session",
      };
    }
  }
);
