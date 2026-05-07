import * as Sentry from "@sentry/node";
import {config} from "dotenv";

config();

Sentry.init({
  dsn: "https://3414e48dc3888601e6615b647e04b037@o4510758163251200.ingest.us.sentry.io/4510758330499072",
  environment: process.env.FUNCTIONS_EMULATOR === "true"
    ? "development"
    : "production",
  tracesSampleRate: 1.0,
  sendDefaultPii: true,
});
