"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPreRegistrationSession = void 0;
const firebase_functions_1 = require("firebase-functions");
const https_1 = require("firebase-functions/v2/https");
// Local imports
const createStripeCheckoutSession_1 = require("../stripe/createStripeCheckoutSession");
const registrationUtils_1 = require("../registrationUtils");
const utils_1 = require("../utils");
exports.createPreRegistrationSession = (0, https_1.onCall)({ cors: true }, async (request) => {
    if (!request.auth) {
        return {
            status: "error",
            code: 401,
            message: "Not signed in",
        };
    }
    const { campersToPreRegister, camperRefsToPreRegister, camperCurrentGrades, campYear, donationAmount, email, successUrl, cancelUrl, isTestData = false, } = request.data;
    const db = (0, utils_1.getFirestoreDb)(!isTestData);
    const camperCurrentGradesString = camperCurrentGrades?.map((grade) => grade ? grade.toString() : "");
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
    if (donationAmount > 0) {
        stripeLineItems.push({
            priceInDollars: donationAmount,
            name: "Donation",
        });
    }
    const parentRef = camperRefsToPreRegister.length > 0
        ? db
            .doc(camperRefsToPreRegister[0])
            .parent.parent?.collection("parents")
            .doc(email)
        : undefined;
    const paymentDescription = campersToPreRegister.length <= 0
        ? "LYF Camp Donation"
        : `LYF Camp ${campYear} Pre-Registration - ${campersToPreRegister.join(", ")}${donationAmount > 0 ? " + Donation" : ""}`;
    try {
        const stripeCustomerId = await (0, registrationUtils_1.getStripeCustomerId)(parentRef, email, isTestData);
        const result = await (0, createStripeCheckoutSession_1.createStripeCheckoutSession)(stripeLineItems, successUrl, cancelUrl, stripeCustomerId, utils_1.StripeWebhookEventType.PreRegistration, paymentDescription, isTestData, null /* discount */);
        return { sessionId: result.id };
    }
    catch (error) {
        firebase_functions_1.logger.error(error);
        return {
            status: "error",
            code: 402,
            message: "Failed to create a Stripe Checkout session",
        };
    }
});
//# sourceMappingURL=createPreRegistrationSession.js.map