import * as Sentry from "@sentry/node";
import type { Response } from "express";
import type { CloudEvent } from "firebase-functions/v2";
import {
  HttpsError,
  type CallableRequest,
  type Request,
} from "firebase-functions/v2/https";

// Cloud Functions freeze the instance as soon as the handler settles, so any
// event still buffered in the SDK would be lost without an explicit flush.
const FLUSH_TIMEOUT_MS = 2000;

// HttpsError codes that mean the *client* did something wrong (bad input,
// not signed in, no permission, ...). They're part of normal operation and
// would only be noise in Sentry, so they're recorded as breadcrumbs instead.
const CLIENT_ERROR_CODES: ReadonlySet<string> = new Set([
  "invalid-argument",
  "unauthenticated",
  "permission-denied",
  "not-found",
  "already-exists",
  "failed-precondition",
  "out-of-range",
]);

function isClientError(error: unknown): error is HttpsError {
  return error instanceof HttpsError && CLIENT_ERROR_CODES.has(error.code);
}

/**
 * Runs `fn` inside its own Sentry isolation scope tagged with the function
 * name, reports anything it throws (minus expected client errors), and
 * flushes before returning so nothing is lost when the instance freezes.
 * Errors are always re-thrown — the wrappers below never change what the
 * caller observes.
 */
async function runInstrumented<T>(
  name: string,
  op: string,
  configureScope: (scope: Sentry.Scope) => void,
  fn: () => Promise<T>
): Promise<T> {
  return Sentry.withIsolationScope(async (scope) => {
    scope.setTag("function", name);
    scope.setTransactionName(name);
    configureScope(scope);
    try {
      return await Sentry.startSpan({ name, op }, fn);
    } catch (error) {
      if (isClientError(error)) {
        Sentry.addBreadcrumb({
          category: "https-error",
          level: "warning",
          message: `${error.code}: ${error.message}`,
        });
      } else {
        Sentry.captureException(error);
      }
      throw error;
    } finally {
      await Sentry.flush(FLUSH_TIMEOUT_MS);
    }
  });
}

/**
 * Wraps an `onCall` handler. The signed-in caller (if any) is attached as the
 * Sentry user, and `isTestData` from the payload becomes a tag so prod and
 * test traffic can be told apart.
 */
export function withSentryCallable<T, R>(
  name: string,
  handler: (request: CallableRequest<T>) => R | Promise<R>
): (request: CallableRequest<T>) => Promise<R> {
  return (request) =>
    runInstrumented<R>(
      name,
      "function.callable",
      (scope) => {
        if (request.auth) {
          scope.setUser({
            id: request.auth.uid,
            email: request.auth.token.email ?? undefined,
          });
        }
        const data = request.data as
          | { isTestData?: unknown }
          | null
          | undefined;
        if (typeof data?.isTestData === "boolean") {
          scope.setTag("test_data", data.isTestData);
        }
      },
      async () => handler(request)
    );
}

/**
 * Wraps an `onRequest` handler. If the handler throws, the error is reported
 * and a 500 is sent (when nothing has been sent yet) instead of leaving the
 * request hanging until the function times out.
 */
export function withSentryRequest(
  name: string,
  handler: (request: Request, response: Response) => void | Promise<void>
): (request: Request, response: Response) => Promise<void> {
  return async (request, response) => {
    try {
      await runInstrumented(
        name,
        "function.http",
        (scope) => {
          scope.setSDKProcessingMetadata({
            normalizedRequest: {
              method: request.method,
              url: request.originalUrl ?? request.url,
            },
          });
        },
        async () => handler(request, response)
      );
    } catch (error) {
      if (!response.headersSent) {
        response.status(500).send();
      }
      throw error;
    }
  };
}

/**
 * Wraps a background (Firestore, Pub/Sub, scheduler, ...) event handler. The
 * event's id/type/source and any path params are attached as context.
 */
export function withSentryEvent<E extends CloudEvent<unknown>, R>(
  name: string,
  handler: (event: E) => R | Promise<R>
): (event: E) => Promise<R> {
  return (event) =>
    runInstrumented<R>(
      name,
      "function.event",
      (scope) => {
        const { id, type, source, time } = event;
        const { params, database, document } = event as E & {
          params?: Record<string, string>;
          database?: string;
          document?: string;
        };
        scope.setContext("cloud_event", {
          id,
          type,
          source,
          time,
          ...(params ? { params } : {}),
          ...(database ? { database } : {}),
          ...(document ? { document } : {}),
        });
        if (database) scope.setTag("database", database);
      },
      async () => handler(event)
    );
}
