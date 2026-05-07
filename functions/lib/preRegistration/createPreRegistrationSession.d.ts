import Stripe from "stripe";
export interface PreRegistrationLineItemMetadata extends Stripe.Metadata {
    campYear: string;
    camperName: string;
    camperRefString: string;
    currentGradeString: string;
}
export declare const createPreRegistrationSession: import("firebase-functions").HttpsFunction & import("firebase-functions").Runnable<any>;
//# sourceMappingURL=createPreRegistrationSession.d.ts.map