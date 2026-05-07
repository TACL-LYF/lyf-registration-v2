"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registrationErrorMessagesWebhook = exports.registrationForCampSlackWebhook = void 0;
exports.sendMessageToRegistrationForCampChannel = sendMessageToRegistrationForCampChannel;
exports.sendMessageToRegistrationErrorMessages = sendMessageToRegistrationErrorMessages;
const client_1 = require("@slack/client");
exports.registrationForCampSlackWebhook = new client_1.IncomingWebhook(process.env.SLACK_REGISTRATION_WEBHOOK);
/**
 * Send a message to the #registrations-for-camp Slack Channel
 * @param message
 * @param isTestData
 * @returns
 */
async function sendMessageToRegistrationForCampChannel(message, isTestData) {
    if (isTestData) {
        return;
    }
    await exports.registrationForCampSlackWebhook.send(message);
}
exports.registrationErrorMessagesWebhook = new client_1.IncomingWebhook(process.env.SLACK_ERROR_WEBHOOK);
/**
 * Send a message to the #registration-error-messages Slack Channel
 * @param message
 * @param isTestData
 */
async function sendMessageToRegistrationErrorMessages(message, isTestData) {
    await exports.registrationErrorMessagesWebhook.send(message);
}
//# sourceMappingURL=slackChannelWebhooks.js.map