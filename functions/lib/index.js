"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.issueStripeRefund = exports.moveCampersOffWaitlist = exports.createRegistrationSession = exports.createPreRegistrationSession = exports.handleTestStripeWebhook = exports.handleStripeWebhook = exports.processSignUp = void 0;
const tslib_1 = require("tslib");
const app_1 = require("firebase-admin/app");
const firebase_functions_1 = require("firebase-functions");
const options_1 = require("firebase-functions/v2/options");
// Initialize our app once which allows us to perform Admin SDK operations.
(0, app_1.initializeApp)();
(0, options_1.setGlobalOptions)({ region: firebase_functions_1.SUPPORTED_REGIONS[3] });
// Import our function that grants TACL users admin access
const processSignUp_1 = tslib_1.__importDefault(require("./users/processSignUp"));
exports.processSignUp = processSignUp_1.default;
// Import our function for handling paid Stripe invoices
const handleStripeWebhook_1 = require("./stripe/handleStripeWebhook");
Object.defineProperty(exports, "handleStripeWebhook", { enumerable: true, get: function () { return handleStripeWebhook_1.handleStripeWebhook; } });
Object.defineProperty(exports, "handleTestStripeWebhook", { enumerable: true, get: function () { return handleStripeWebhook_1.handleTestStripeWebhook; } });
// Import our function for create pre-registration sessions.
const createPreRegistrationSession_1 = require("./preRegistration/createPreRegistrationSession");
Object.defineProperty(exports, "createPreRegistrationSession", { enumerable: true, get: function () { return createPreRegistrationSession_1.createPreRegistrationSession; } });
// Import our function for creating a registration session.
const createRegistrationSession_1 = require("./registration/createRegistrationSession");
Object.defineProperty(exports, "createRegistrationSession", { enumerable: true, get: function () { return createRegistrationSession_1.createRegistrationSession; } });
// Import our function for moving campers off the waitlist
const moveCampersOffWaitlist_1 = require("./registration/moveCampersOffWaitlist");
Object.defineProperty(exports, "moveCampersOffWaitlist", { enumerable: true, get: function () { return moveCampersOffWaitlist_1.moveCampersOffWaitlist; } });
// Import our function for issuing a refund for a given Stripe checkout session ID
const issueStripeRefund_1 = require("./stripe/issueStripeRefund");
Object.defineProperty(exports, "issueStripeRefund", { enumerable: true, get: function () { return issueStripeRefund_1.issueStripeRefund; } });
//# sourceMappingURL=index.js.map