"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailTransport = exports.REGISTRATION_EMAIL = exports.RegistrationType = exports.StripeWebhookEventType = exports.combineNames = exports.getFirstName = exports.getStripe = exports.testStripeEndpointSecret = exports.stripeEndpointSecret = exports.testStripe = exports.stripe = exports.getFirestoreDb = exports.testDb = exports.db = exports.functionsRegion = void 0;
const tslib_1 = require("tslib");
const firebase_functions_1 = require("firebase-functions");
const stripe_1 = tslib_1.__importDefault(require("stripe"));
const dotenv_1 = require("dotenv");
const firestore_1 = require("firebase-admin/firestore");
const nodemailer_1 = require("nodemailer");
(0, dotenv_1.config)();
// Firebase Utils
exports.functionsRegion = (0, firebase_functions_1.region)(firebase_functions_1.SUPPORTED_REGIONS[3]);
exports.db = (0, firestore_1.getFirestore)();
exports.testDb = (0, firestore_1.getFirestore)("internal-test");
const getFirestoreDb = (isProd) => (isProd ? exports.db : exports.testDb);
exports.getFirestoreDb = getFirestoreDb;
// Stripe Utils
exports.stripe = new stripe_1.default(process.env.STRIPE_API_KEY, {
    apiVersion: "2023-10-16",
});
exports.testStripe = new stripe_1.default(process.env.STRIPE_TEST_API_KEY, {
    apiVersion: "2023-10-16",
});
exports.stripeEndpointSecret = process.env
    .STRIPE_ENDPOINT_SECRET;
exports.testStripeEndpointSecret = process.env
    .STRIPE_TEST_ENDPOINT_SECRET;
const getStripe = (isProd) => (isProd ? exports.stripe : exports.testStripe);
exports.getStripe = getStripe;
// Registration Utils
const getFirstName = (name) => name.split(" ")[0];
exports.getFirstName = getFirstName;
const combineNames = (names) => names.length <= 2
    ? names.join(" and ")
    : `${names.slice(0, -1).join(", ")}, and ${names.at(-1)}`;
exports.combineNames = combineNames;
var StripeWebhookEventType;
(function (StripeWebhookEventType) {
    StripeWebhookEventType[StripeWebhookEventType["Registration"] = 0] = "Registration";
    StripeWebhookEventType[StripeWebhookEventType["PreRegistration"] = 1] = "PreRegistration";
    StripeWebhookEventType[StripeWebhookEventType["Donation"] = 2] = "Donation";
})(StripeWebhookEventType || (exports.StripeWebhookEventType = StripeWebhookEventType = {}));
var RegistrationType;
(function (RegistrationType) {
    RegistrationType["PreRegistration"] = "PreReg";
    RegistrationType["Registration"] = "Reg";
})(RegistrationType || (exports.RegistrationType = RegistrationType = {}));
exports.REGISTRATION_EMAIL = process.env.EMAIL;
const EMAIL_CLIENT_ID = process.env.EMAIL_CLIENT_ID;
const EMAIL_CLIENT_SECRET = process.env.EMAIL_CLIENT_SECRET;
const EMAIL_REFRESH_TOKEN = process.env.EMAIL_REFRESH_TOKEN;
exports.emailTransport = (0, nodemailer_1.createTransport)({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        type: "OAuth2",
        user: exports.REGISTRATION_EMAIL,
        clientId: EMAIL_CLIENT_ID,
        clientSecret: EMAIL_CLIENT_SECRET,
        refreshToken: EMAIL_REFRESH_TOKEN,
    },
});
//# sourceMappingURL=utils.js.map