import Stripe from "stripe";
import { DocumentReference } from "firebase-admin/firestore";
import { Parent, RegistrationSessionResponse } from "lyf-registration-schemas";
/**
 * Create a standalone Donation Stripe Checkout Session.
 * @param campYear
 * @param parentRef
 * @param parentEmail
 * @param donationAmount
 * @param successUrl
 * @param cancelUrl
 * @returns
 */
export declare function createDonationSession(campYear: number, parentRef: DocumentReference<Parent>, parentEmail: string, donationAmount: number, successUrl: string, cancelUrl: string, isTestData: boolean): Promise<Stripe.Checkout.Session | null>;
/**
 * Create a donation session specific to the registration flow.
 *
 * Should immediately return from this response.
 * @param campYear
 * @param donation
 * @param signedInParentRef
 * @param signedInParentEmail
 * @param successUrl
 * @param cancelUrl
 * @param isWaitlist
 * @param isTestData
 * @returns
 */
export declare function createRegistrationDonationSession(campYear: number, donation: number, signedInParentRef: DocumentReference<Parent>, signedInParentEmail: string, successUrl: string, cancelUrl: string, isWaitlist: boolean, isTestData: boolean): Promise<RegistrationSessionResponse>;
//# sourceMappingURL=createDonationSession.d.ts.map