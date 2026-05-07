/**
 * Stripe requires us to load from their site,
 * so they provide a wrapper for us to use.
 *
 * This code uses a singleton to prevent having to re-initialize
 * stripe every time
 *
 * Code from: https://www.gatsbyjs.com/tutorial/ecommerce-tutorial/#loading-stripejs
 */

import { loadStripe, Stripe } from "@stripe/stripe-js"

const PUBLIC_KEY = process.env.GATSBY_STRIPE_PUBLIC_KEY ?? ""
const TEST_PUBLIC_KEY = "pk_test_Fh1MV1vkyv2EwF5k6LhSel8a"

export type GetStripePromise = () => Promise<Stripe | null>

let stripePromiseProd: Promise<Stripe | null>
let stripePromiseTest: Promise<Stripe | null>
export const getStripeProd: GetStripePromise = () => {
  if (!stripePromiseProd) {
    stripePromiseProd = loadStripe(PUBLIC_KEY)
  }
  return stripePromiseProd
}

export const getStripeTest: GetStripePromise = () => {
  if (!stripePromiseTest) {
    stripePromiseTest = loadStripe(TEST_PUBLIC_KEY)
  }
  return stripePromiseTest
}
