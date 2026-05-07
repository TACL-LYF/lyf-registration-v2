"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStripeCustomerId = getStripeCustomerId;
const firebase_functions_1 = require("firebase-functions");
// Local imports
const utils_1 = require("../utils");
/**
 * Given a reference to a parent document, create a customerId by retrieving it from the document or creating a new one.
 * @param parentRef
 * @param email
 * @returns
 */
async function getStripeCustomerId(parentRef, email, isTestData = false) {
    const stripe = (0, utils_1.getStripe)(!isTestData);
    // Fallback on creating a new customer.
    if (!parentRef) {
        firebase_functions_1.logger.warn("No parent was found.");
        return (await stripe.customers.create({
            email: email,
        })).id;
    }
    const parentData = (await parentRef.get()).data();
    if (!parentData) {
        firebase_functions_1.logger.warn("No data found for the parentRef", parentRef.path);
        return (await stripe.customers.create({
            email: email,
        })).id;
    }
    const customerId = parentData.stripeCustomerId;
    if (customerId) {
        firebase_functions_1.logger.info("Found an existing stripe customer");
        return customerId;
    }
    // No customerId found so create a new one
    const customer = await stripe.customers.create({
        name: `${parentData.firstName} ${parentData.lastName}`,
        email: email,
    });
    await parentRef.update({
        stripeCustomerId: customer.id,
    });
    firebase_functions_1.logger.info(`Created a new customer id: ${customer.id}`);
    return customer.id;
}
//# sourceMappingURL=getStripeCustomerId.js.map