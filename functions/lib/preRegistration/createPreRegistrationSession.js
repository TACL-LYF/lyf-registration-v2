"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPreRegistrationSession = void 0;
const firebase_functions_1 = require("firebase-functions");
// Local imports
const createStripeCheckoutSession_1 = require("../stripe/createStripeCheckoutSession");
const registrationUtils_1 = require("../registrationUtils");
const utils_1 = require("../utils");
exports.createPreRegistrationSession = utils_1.functionsRegion.https.onCall((data, context) => {
    // If the user isn't signed in, then this isn't a valid request.
    if (!context.auth) {
        return {
            status: "error",
            code: 401,
            message: "Not signed in",
        };
    }
    const { campersToPreRegister, camperRefsToPreRegister, camperCurrentGrades, campYear, donationAmount, email, successUrl, cancelUrl, isTestData = false, } = data;
    const db = (0, utils_1.getFirestoreDb)(!isTestData);
    // Need to convert to strings since the value is possibly null.
    const camperCurrentGradesString = camperCurrentGrades?.map((grade) => grade ? grade.toString() : "");
    // Price of a pre-registration is hard-coded at $500 right now but eventually we can get this from the firebase
    // database for the camp document.
    const stripeLineItems = campersToPreRegister.map((name, index) => ({
        priceInDollars: 500,
        name: `TACL LYF Camp ${campYear} Pre-Registration: ${name}`,
        metadata: {
            campYear: campYear.toString(),
            camperName: name,
            camperRefString: camperRefsToPreRegister[index],
            currentGradeString: camperCurrentGradesString &&
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
    const parentRef = camperRefsToPreRegister.length > 0
        ? db
            .doc(camperRefsToPreRegister[0])
            .parent.parent?.collection("parents")
            .doc(email)
        : undefined;
    const paymentDescription = campersToPreRegister.length <= 0
        ? "LYF Camp Donation"
        : `LYF Camp ${campYear} Pre-Registration - ${campersToPreRegister.join(", ")}${donationAmount > 0 ? " + Donation" : ""}`;
    // Try and get an existing customer. If one doesn't exist, then create one.
    // Then use that customer to create a checkout session.
    return (0, registrationUtils_1.getStripeCustomerId)(parentRef, email, isTestData)
        .then((stripeCustomerId) => 
    // Create the stripe checkout session with the new id
    (0, createStripeCheckoutSession_1.createStripeCheckoutSession)(stripeLineItems, successUrl, cancelUrl, stripeCustomerId, utils_1.StripeWebhookEventType.PreRegistration, paymentDescription, isTestData, null /* discount */))
        .then((result) => {
        return {
            sessionId: result.id,
        };
    })
        .catch((error) => {
        firebase_functions_1.logger.error(error);
        return {
            status: "error",
            code: 402,
            message: "Failed to create a Stripe Checkout session",
        };
    })
        .catch((error) => {
        firebase_functions_1.logger.error(error);
        return {
            status: "error",
            code: 402,
            message: "Failed to create the Stripe Customer",
        };
    });
});
//# sourceMappingURL=createPreRegistrationSession.js.map