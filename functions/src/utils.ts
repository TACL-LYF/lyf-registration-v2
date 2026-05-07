import Stripe from "stripe";
import {config} from "dotenv";
import {getFirestore} from "firebase-admin/firestore";
import {createTransport} from "nodemailer";
config();

export const db = getFirestore();
export const testDb = getFirestore("internal-test");

export const getFirestoreDb = (isProd: boolean) => (isProd ? db : testDb);

// Stripe Utils
export const stripe = new Stripe(process.env.STRIPE_API_KEY as string, {
  apiVersion: "2023-10-16",
});
export const testStripe = new Stripe(
  process.env.STRIPE_TEST_API_KEY as string,
  {
    apiVersion: "2023-10-16",
  }
);
export const stripeEndpointSecret = process.env
  .STRIPE_ENDPOINT_SECRET as string;
export const testStripeEndpointSecret = process.env
  .STRIPE_TEST_ENDPOINT_SECRET as string;

export const getStripe = (isProd: boolean) => (isProd ? stripe : testStripe);

// Registration Utils
export const getFirstName = (name: string) => name.split(" ")[0];
export const combineNames = (names: string[]) =>
  names.length <= 2
    ? names.join(" and ")
    : `${names.slice(0, -1).join(", ")}, and ${names.at(-1)}`;

/** Strip CR/LF to prevent email header injection via user-supplied values. */
export const sanitizeForEmailHeader = (value: string) =>
  value.replace(/[\r\n]/g, " ").trim();

export enum StripeWebhookEventType {
  Registration = 0,
  PreRegistration = 1,
  Donation = 2,
}

export enum RegistrationType {
  PreRegistration = "PreReg",
  Registration = "Reg",
}

export const REGISTRATION_EMAIL = process.env.EMAIL as string;
const EMAIL_CLIENT_ID = process.env.EMAIL_CLIENT_ID as string;
const EMAIL_CLIENT_SECRET = process.env.EMAIL_CLIENT_SECRET as string;
const EMAIL_REFRESH_TOKEN = process.env.EMAIL_REFRESH_TOKEN as string;

export const emailTransport = createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    type: "OAuth2",
    user: REGISTRATION_EMAIL,
    clientId: EMAIL_CLIENT_ID,
    clientSecret: EMAIL_CLIENT_SECRET,
    refreshToken: EMAIL_REFRESH_TOKEN,
  },
});
