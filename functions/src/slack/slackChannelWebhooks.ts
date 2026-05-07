import {IncomingWebhook} from "@slack/client";

export const registrationForCampSlackWebhook = new IncomingWebhook(
  process.env.SLACK_REGISTRATION_WEBHOOK as string
);

/**
 * Send a message to the #registrations-for-camp Slack Channel
 * @param message
 * @param isTestData
 * @returns
 */
export async function sendMessageToRegistrationForCampChannel(
  message: string,
  isTestData?: boolean
) {
  if (isTestData) {
    return;
  }

  await registrationForCampSlackWebhook.send(message);
}

export const registrationErrorMessagesWebhook = new IncomingWebhook(
  process.env.SLACK_ERROR_WEBHOOK as string
);

/**
 * Send a message to the #registration-error-messages Slack Channel
 * @param message
 * @param isTestData
 */
export async function sendMessageToRegistrationErrorMessages(
  message: string,
  isTestData?: boolean
) {
  await registrationErrorMessagesWebhook.send(message);
}
