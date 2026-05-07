"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moveCampersOffWaitlist = void 0;
const tslib_1 = require("tslib");
const date_fns_1 = require("date-fns");
const date_fns_tz_1 = require("date-fns-tz");
const firebase_functions_1 = require("firebase-functions");
const https_1 = require("firebase-functions/v2/https");
const Mustache = tslib_1.__importStar(require("mustache"));
const fs = tslib_1.__importStar(require("fs"));
const path = tslib_1.__importStar(require("path"));
const utils_1 = require("../utils");
const lyf_registration_schemas_1 = require("lyf-registration-schemas");
const slackChannelWebhooks_1 = require("../slack/slackChannelWebhooks");
const mjml_1 = tslib_1.__importDefault(require("mjml"));
const mjmlTemplate = fs.readFileSync(path.resolve(__dirname, "../emailTemplates/offWaitlistTemplate.mjml"), { encoding: "utf8" });
const htmlTemplate = (0, mjml_1.default)(mjmlTemplate, {
    minify: true, // Making it smalle rto save on email file size
}).html;
/**
 * Moves campers off of the waitlist by marking their registration as pending payment and sending
 * an email to the parent informing their campers are off the waitlist.
 */
exports.moveCampersOffWaitlist = (0, https_1.onCall)({ cors: true }, async (request) => {
    // If the user isn't signed in, then this isn't a valid request.
    if (!request.auth) {
        return {
            status: "error",
            code: 401,
            message: "Not signed in",
        };
    }
    const { parentNames, parentEmails, campYear, camperName, registrationId, campTrack, isTestData, } = request.data;
    const db = (0, utils_1.getFirestoreDb)(!isTestData);
    const parentFirstNames = (0, utils_1.combineNames)(parentNames.map((p) => (0, utils_1.getFirstName)(p)));
    // Mark registrations as pending payment so that they'll pass through our createRegistrationSession function.
    try {
        await db
            .doc(`camps/${campYear}/registrations/${registrationId}`)
            .update({ status: lyf_registration_schemas_1.RegistrationStatus.PENDING_PAYMENT });
    }
    catch (e) {
        firebase_functions_1.logger.error(e);
        (0, slackChannelWebhooks_1.sendMessageToRegistrationErrorMessages)(`Failed to move campers off waitlist: ${camperName}`);
        return {
            status: "error",
            code: 402,
            message: "Failed to move campers off waitlist",
        };
    }
    // Send moved off waitlist email
    const templateInput = {
        campYear: campYear,
        parentNames: parentFirstNames,
        registrationDate: (0, date_fns_tz_1.formatInTimeZone)((0, date_fns_1.addDays)(new Date(), 7), "America/Los_Angeles", "EEEE MMM do, Y"),
        camperName: camperName,
        campTrack: campTrack,
    };
    const htmlBody = Mustache.render(htmlTemplate, templateInput);
    return utils_1.emailTransport.sendMail({
        from: `TACL-LYF <${utils_1.REGISTRATION_EMAIL}>`,
        to: parentEmails,
        subject: `[TACL LYF] Congrats - ${camperName} is off the waitlist! Finish registration now to secure your spot!`,
        html: htmlBody,
    });
});
//# sourceMappingURL=moveCampersOffWaitlist.js.map