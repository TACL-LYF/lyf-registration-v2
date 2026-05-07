import {initializeApp} from "firebase-admin/app";
import {SUPPORTED_REGIONS} from "firebase-functions";
import {setGlobalOptions} from "firebase-functions/v2/options";

// Initialize our app once which allows us to perform Admin SDK operations.
initializeApp();
setGlobalOptions({region: SUPPORTED_REGIONS[3]});

// Import our function that grants TACL users admin access
import processSignUp from "./users/processSignUp";

// Import our function for handling paid Stripe invoices
import {handleStripeWebhook, handleTestStripeWebhook} from "./stripe/handleStripeWebhook";

// Import our function for create pre-registration sessions.
import {createPreRegistrationSession} from "./preRegistration/createPreRegistrationSession";

// Import our function for creating a registration session.
import {createRegistrationSession} from "./registration/createRegistrationSession";

// Import our function for moving campers off the waitlist
import {moveCampersOffWaitlist} from "./registration/moveCampersOffWaitlist";

// Import our function for issuing a refund for a given Stripe checkout session ID
import {issueStripeRefund} from "./stripe/issueStripeRefund";

export {
  processSignUp,
  handleStripeWebhook,
  handleTestStripeWebhook,
  createPreRegistrationSession,
  createRegistrationSession,
  moveCampersOffWaitlist,
  issueStripeRefund,
};
