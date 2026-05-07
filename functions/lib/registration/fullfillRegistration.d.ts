import Stripe from "stripe";
import { DocumentReference, Firestore } from "firebase-admin/firestore";
import { Family, Registration } from "lyf-registration-schemas";
/**
 * Finalize the registration by
 * 1. Sending confirmation emails for each of the registered campers
 * 2. Sending messages to the registration channel for each camper
 * 3. Adding the parents to the mailchimp list
 * 4. Updating the remaining spots
 * 5. Subtracting camp credit if it was used
 *
 * @param db
 * @param isTestData
 * @param campYear
 * @param email
 * @param familyRef
 * @param registrationRefs
 * @param registrationDescriptions
 * @param campCreditUsed
 * @param campTrackSpots
 */
export declare function completeRegistration(db: Firestore, isTestData: boolean, campYear: string, email: string, familyRef: DocumentReference<Family>, registrationRefs: DocumentReference<Registration>[], registrationDescriptions: string[], campCreditUsed: number, campTrackSpots: Map<string, number>): Promise<void>;
/**
 * Given a Stripe Checkout Session, parse the payment and fulfill the registration.
 * @param checkoutSession
 * @returns
 */
export declare function fulfillRegistration(db: Firestore, checkoutSession: Stripe.Checkout.Session, isTestData: boolean): Promise<void>;
//# sourceMappingURL=fullfillRegistration.d.ts.map