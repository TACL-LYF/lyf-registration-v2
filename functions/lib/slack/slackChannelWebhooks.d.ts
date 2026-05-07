import { IncomingWebhook } from "@slack/client";
export declare const registrationForCampSlackWebhook: IncomingWebhook;
/**
 * Send a message to the #registrations-for-camp Slack Channel
 * @param message
 * @param isTestData
 * @returns
 */
export declare function sendMessageToRegistrationForCampChannel(message: string, isTestData?: boolean): Promise<void>;
export declare const registrationErrorMessagesWebhook: IncomingWebhook;
/**
 * Send a message to the #registration-error-messages Slack Channel
 * @param message
 * @param isTestData
 */
export declare function sendMessageToRegistrationErrorMessages(message: string, isTestData?: boolean): Promise<void>;
//# sourceMappingURL=slackChannelWebhooks.d.ts.map