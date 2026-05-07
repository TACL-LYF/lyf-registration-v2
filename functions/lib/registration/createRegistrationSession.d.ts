import Stripe from "stripe";
import { RegistrationPayload } from "lyf-registration-schemas";
export interface RegistrationLineItemMetadata extends Stripe.Metadata {
    familyRef: string;
    registrationRef: string;
    campYear: string;
    campTrack: string;
}
export declare const createRegistrationSession: import("firebase-functions/v2/https").CallableFunction<RegistrationPayload, any>;
//# sourceMappingURL=createRegistrationSession.d.ts.map