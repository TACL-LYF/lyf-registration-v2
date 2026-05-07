"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWaitlistEmail = sendWaitlistEmail;
const tslib_1 = require("tslib");
const Mustache = tslib_1.__importStar(require("mustache"));
const fs_1 = require("fs");
const mjml_1 = tslib_1.__importDefault(require("mjml"));
const path_1 = require("path");
const utils_1 = require("../utils");
const mjmlTemplate = (0, fs_1.readFileSync)((0, path_1.resolve)(__dirname, "../emailTemplates/waitlistTemplate.mjml"), "utf-8");
const htmlTemplate = (0, mjml_1.default)(mjmlTemplate, {
    minify: true, // Making it smaller to save on email file size
}).html;
/**
 * Send the waitlist confirmation email.
 * @param emailToSendTo
 * @param campYear
 * @param camperNames
 */
async function sendWaitlistEmail(emailToSendTo, campYear, campTrack, camperName) {
    const htmlBody = Mustache.render(htmlTemplate, {
        campYear: campYear,
        campTrack: campTrack,
        camperName: camperName,
    });
    await utils_1.emailTransport.sendMail({
        from: `TACL-LYF <${utils_1.REGISTRATION_EMAIL}>`,
        to: emailToSendTo,
        subject: `TACL-LYF Camp ${campYear} Waitlist Confirmation for ${camperName}`,
        html: htmlBody,
    });
}
//# sourceMappingURL=sendWaitlistEmail.js.map