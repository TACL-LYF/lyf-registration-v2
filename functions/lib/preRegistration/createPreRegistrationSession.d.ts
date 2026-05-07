import Stripe from "stripe";
import { PreRegistrationInputPayload } from "lyf-registration-schemas";
export interface PreRegistrationLineItemMetadata extends Stripe.Metadata {
    campYear: string;
    camperName: string;
    camperRefString: string;
    currentGradeString: string;
}
export declare const createPreRegistrationSession: import("firebase-functions/v2/https").CallableFunction<PreRegistrationInputPayload, any>;
//# sourceMappingURL=createPreRegistrationSession.d.ts.map