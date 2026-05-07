type IssueStripeRefundRequest = {
    stripeId: string;
    amount: number;
    isTestData: boolean;
};
/**
 * Issues a full refund for the charge from a given Stripe checkout session.
 * @param stripeId The Stripe ID associated with the charge being refunded
 * @param amount A positive integer in representing how much of this charge to refund (in cents)
 * @param isTestData Whether this request is for test data
 * @returns Code 200 if successful, 402 if any error occurs
 */
export declare const issueStripeRefund: import("firebase-functions/v2/https").CallableFunction<IssueStripeRefundRequest, any>;
export {};
//# sourceMappingURL=issueStripeRefund.d.ts.map