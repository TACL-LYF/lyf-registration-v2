"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStripeCheckoutSession = createStripeCheckoutSession;
const utils_1 = require("../utils");
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
async function createStripeCheckoutSession(items, successUrl, cancelUrl, customerId, eventType, description, isTestData, discount) {
    const discounts = [];
    const stripe = (0, utils_1.getStripe)(!isTestData);
    if (discount) {
        const coupon = await stripe.coupons.create({
            amount_off: discount.amount * 100,
            currency: "usd",
            name: discount.name,
            duration: "once",
        });
        discounts.push({
            coupon: coupon.id,
        });
    }
    return await stripe.checkout.sessions.create({
        line_items: items.map((item) => ({
            price_data: {
                currency: "usd",
                product_data: {
                    name: item.name,
                    metadata: item.metadata,
                },
                unit_amount: item.priceInDollars * 100,
            },
            quantity: 1,
        })),
        mode: "payment",
        metadata: {
            eventType: eventType,
        },
        success_url: successUrl,
        cancel_url: cancelUrl,
        customer: customerId,
        // payment_method_types: ["us_bank_account", "card"],
        payment_intent_data: {
            description: description,
        },
        discounts: discounts,
    });
}
//# sourceMappingURL=createStripeCheckoutSession.js.map