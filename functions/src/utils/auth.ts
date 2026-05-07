import {getFirestore} from "firebase-admin/firestore";
import {HttpsError, type CallableRequest} from "firebase-functions/v2/https";
import {AdminRole} from "lyf-registration-schemas";

const ALLOWED_REDIRECT_ORIGINS = [
  "https://lyf-registration.tacl.org",
  "http://localhost:8000",
  "http://localhost:9000",
];

/**
 * Verifies that the caller is authenticated and has one of the required admin roles.
 * Looks up the caller's email in the `admins` Firestore collection.
 *
 * @throws HttpsError with "unauthenticated" if not signed in
 * @throws HttpsError with "permission-denied" if not an admin or lacks the required role
 */
export async function assertAdmin(
  request: CallableRequest,
  allowedRoles: AdminRole[] = ["full_admin"]
): Promise<{email: string; role: AdminRole}> {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Not signed in");
  }

  const email = request.auth.token.email;
  if (!email) {
    throw new HttpsError("unauthenticated", "No email on auth token");
  }

  const adminDoc = await getFirestore()
    .collection("admins")
    .doc(email)
    .get();

  if (!adminDoc.exists) {
    throw new HttpsError(
      "permission-denied",
      "You do not have permission to perform this action"
    );
  }

  const role = (adminDoc.data()?.role ?? "full_admin") as AdminRole;
  if (!allowedRoles.includes(role)) {
    throw new HttpsError(
      "permission-denied",
      "Your role does not have permission to perform this action"
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
  const normalizedAuth = authEmail.toLowerCase();
  const normalizedEmails = emails.map((e) => e.toLowerCase());
  if (!normalizedEmails.includes(normalizedAuth)) {
    throw new HttpsError(
      "permission-denied",
      "Your authenticated email does not match the provided parent emails"
    );
  }
}

/**
 * Resolves whether the caller is allowed to use test data.
 * Only admins may set isTestData=true; non-admins are silently
 * forced to production mode.
 */
export async function resolveTestDataFlag(
  request: CallableRequest,
  requestedIsTestData: boolean
): Promise<boolean> {
  if (!requestedIsTestData) return false;

  const email = request.auth?.token?.email;
  if (!email) return false;

  const adminDoc = await getFirestore()
    .collection("admins")
    .doc(email)
    .get();

  return adminDoc.exists;
}
