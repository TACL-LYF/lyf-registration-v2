import { DocumentReference, Timestamp } from 'firebase/firestore';
import { Registration } from './camp';

export type Payment = Partial<{
    createdAt: Timestamp,
    customerEmail: string,
    // Corresponds with the Stripe customer ID
    customerId: string,
    customerName: string,

    donation: number,
    items: {
        amount: number,
        description: string
    }[],
    discount: {
        name: string,
        amount: number,
    } | null,

    paymentMethod: string,
    // Any linked registrations this payment is for.
    // Added in 2024, may not be present in past payments.
    registrations: DocumentReference<Registration>[],
    // This might actually be a string enum but can't find it for now.
    status: string,

    // The Stripe ID for the payment. Can be used with the Stripe API to get
    // the original payment.
    stripeId: string,

    total: number,
    // What platform the payment was made on.
    type: string,

    updatedAt: Timestamp,
}>
