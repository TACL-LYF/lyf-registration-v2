import Stripe from "stripe";
export declare const db: FirebaseFirestore.Firestore;
export declare const testDb: FirebaseFirestore.Firestore;
export declare const getFirestoreDb: (isProd: boolean) => FirebaseFirestore.Firestore;
export declare const stripe: Stripe;
export declare const testStripe: Stripe;
export declare const stripeEndpointSecret: string;
export declare const testStripeEndpointSecret: string;
export declare const getStripe: (isProd: boolean) => Stripe;
export declare const getFirstName: (name: string) => string;
export declare const combineNames: (names: string[]) => string;
export declare enum StripeWebhookEventType {
    Registration = 0,
    PreRegistration = 1,
    Donation = 2
}
export declare enum RegistrationType {
    PreRegistration = "PreReg",
    Registration = "Reg"
}
export declare const REGISTRATION_EMAIL: string;
export declare const emailTransport: import("nodemailer").Transporter<import("nodemailer/lib/smtp-transport").SentMessageInfo, import("nodemailer/lib/smtp-transport").Options>;
//# sourceMappingURL=utils.d.ts.map