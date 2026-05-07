import Stripe from "stripe";
import { Firestore } from "firebase-admin/firestore";
/**
 * Complete the Stripe webhook event that let us know a pre-registration succeeded.
 * @param checkoutSession
 * @returns
 */
export declare function fulfillPreRegistrations(db: Firestore, checkoutSession: Stripe.Checkout.Session, isTestData: boolean): Promise<void>;
//# sourceMappingURL=fulfillPreRegistrations.d.ts.map