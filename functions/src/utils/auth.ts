import {getFirestore} from "firebase-admin/firestore";
import {HttpsError, type CallableRequest} from "firebase-functions/v2/https";
import {
  AdminRole,
  Capability,
  normalizeEmail,
  resolveAdminRole,
  roleHasCapability,
  rolesWithCapability,
} from "lyf-registration-schemas";

// Localhost is only a legitimate redirect target when running in the
// emulator (FUNCTIONS_EMULATOR is set by the Firebase CLI).
const ALLOWED_REDIRECT_ORIGINS = [
  "https://lyf-registration.tacl.org",
  ...(process.env.FUNCTIONS_EMULATOR === "true" ?
    ["http://localhost:8000", "http://localhost:9000"] :
    []),
];

/** Shared options for every onCall function. */
export const callableOptions = {
  cors: true,
};

/**
 * Looks up the caller's admin role from the `admins` Firestore collection.
 * Fails closed: a missing doc, a disabled admin, or an unknown/missing role
 * value all resolve to null.
 */
async function getCallerAdminRole(
  request: CallableRequest
): Promise<{email: string; role: AdminRole | null}> {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Not signed in");
  }

  const email = request.auth.token.email;
  if (!email) {
    throw new HttpsError("unauthenticated", "No email on auth token");
  }

  const adminDoc = await getFirestore()
    .collection("admins")
    .doc(normalizeEmail(email))
    .get();

  if (!adminDoc.exists || adminDoc.data()?.disabled === true) {
    return {email, role: null};
  }

  return {email, role: resolveAdminRole(adminDoc.data()?.role)};
}

/**
 * Verifies that the caller is authenticated and has an admin role granting
 * the given capability (see ROLE_CAPABILITIES in the schemas package).
 *
 * @throws HttpsError with "unauthenticated" if not signed in
 * @throws HttpsError with "permission-denied" if not an admin or the caller's
 *   role lacks the capability
 */
export async function assertAdmin(
  request: CallableRequest,
  capability: Capability
): Promise<{email: string; role: AdminRole}> {
  const {email, role} = await getCallerAdminRole(request);

  if (!role) {
    throw new HttpsError(
      "permission-denied",
      "You do not have permission to perform this action"
    );
  }

  if (!roleHasCapability(role, capability)) {
    throw new HttpsError(
      "permission-denied",
      `Your role does not have permission to perform this action ` +
        `(requires one of: ${rolesWithCapability(capability).join(", ")})`
    );
  }

  return {email, role};
}

/**
 * Validates that a redirect URL belongs to an allowed origin.
 * Prevents open-redirect attacks via Stripe checkout URLs.
 */
export function validateRedirectUrl(url: string): void {
  try {
    const parsed = new URL(url);
    const origin = parsed.origin;
    if (!ALLOWED_REDIRECT_ORIGINS.includes(origin)) {
      throw new HttpsError(
        "invalid-argument",
        `Redirect URL origin "${origin}" is not allowed`
      );
    }
  } catch (e) {
    if (e instanceof HttpsError) throw e;
    throw new HttpsError("invalid-argument", "Invalid redirect URL");
  }
}

/**
 * Validates that the caller's authenticated email matches or is included
 * in a set of expected emails. Used to bind registration payloads to the
 * caller's identity.
 */
export function assertCallerEmailInList(
  authEmail: string,
  emails: string[]
): void {
  const normalizedAuth = normalizeEmail(authEmail);
  const normalizedEmails = emails.map(normalizeEmail);
  if (!normalizedEmails.includes(normalizedAuth)) {
    throw new HttpsError(
      "permission-denied",
      "Your authenticated email does not match the provided parent emails"
    );
  }
}

/**
 * Validates that a dollar amount is a positive finite integer.
 * Used for donation and refund amounts.
 */
export function validateDollarAmount(
  amount: number,
  fieldName: string,
  maxCents = 1_000_000
): void {
  if (
    typeof amount !== "number" ||
    !Number.isFinite(amount) ||
    !Number.isInteger(amount) ||
    amount <= 0 ||
    amount > maxCents
  ) {
    throw new HttpsError(
      "invalid-argument",
      `${fieldName} must be a positive integer up to ${maxCents}`
    );
  }
}

/**
 * Resolves whether the caller is allowed to use test data.
 * Only admins whose role grants the createTestData capability may set
 * isTestData=true; everyone else is silently forced to production mode.
 */
export async function resolveTestDataFlag(
  request: CallableRequest,
  requestedIsTestData: boolean
): Promise<boolean> {
  if (!requestedIsTestData) return false;
  if (!request.auth?.token?.email) return false;

  const {role} = await getCallerAdminRole(request);
  return roleHasCapability(role, "createTestData");
}
