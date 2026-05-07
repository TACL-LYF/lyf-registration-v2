import Stripe from "stripe";
import { StripeWebhookEventType } from "../utils";
export type LineItem<T extends Stripe.Metadata> = {
    priceInDollars: number;
    name: string;
    metadata?: T;
};
/**
 * Create a Stripe checkout session.
 * @param items The individual line items in the order
 * @param successUrl The URL to return to if successful
 * @param cancelUrl The URL to return to if cancelled
 * @param customerId The customer ID to attach the session to
 * @param eventType The type of event this checkout is for and will subsequently trigger in the webhook
 * @param description The description of the order
 * @param discount Any applicable discounts
 * @param isTestData Whether this request is for test data
 * @returns
 */
export declare function createStripeCheckoutSession<T extends Stripe.Metadata>(items: LineItem<T>[], successUrl: string, cancelUrl: string, customerId: string, eventType: StripeWebhookEventType, description: string, isTestData: boolean, discount?: {
    amount: number;
    name: string;
} | null): Promise<Stripe.Checkout.Session>;
//# sourceMappingURL=createStripeCheckoutSession.d.ts.map