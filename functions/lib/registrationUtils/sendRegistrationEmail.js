"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendRegistrationEmail = sendRegistrationEmail;
const tslib_1 = require("tslib");
const Mustache = tslib_1.__importStar(require("mustache"));
const fs_1 = require("fs");
const mjml_1 = tslib_1.__importDefault(require("mjml"));
const path_1 = require("path");
const utils_1 = require("../utils");
const mjmlTemplate = (0, fs_1.readFileSync)((0, path_1.resolve)(__dirname, "../emailTemplates/registrationTemplate.mjml"), "utf-8");
const htmlTemplate = (0, mjml_1.default)(mjmlTemplate, {
    minify: true, // Making it smaller to save on email file size
}).html;
/**
 * Send the waitlist confirmation email.
 * @param emailToSendTo
 * @param campYear
 * @param camperAndRegInfo
 * @param demographics
 */
async function sendRegistrationEmail(emailToSendTo, campYear, camperInfo, registrationInfo, camperHealth) {
    const camperName = registrationInfo.camperName;
    const htmlBody = Mustache.render(htmlTemplate, {
        campYear: campYear,
        campTrack: registrationInfo.campTrack,
        camperName: camperName,
        camperPreferredName: camperInfo.preferredName,
        camperBirthday: camperInfo.birthDate,
        camperGrade: registrationInfo.grade,
        camperGender: camperInfo.gender?.join(", "),
        camperPronouns: camperInfo.pronouns,
        camperTShirtSize: registrationInfo.shirtSize,
        camperCabinPreference: registrationInfo.cabinPreference,
        camperDietFood: camperHealth?.dietAndFoodAllergies,
        camperMedical: camperHealth?.medicalConditions,
        camperAdditionalNotes: registrationInfo.additionalNotes,
    });
    await utils_1.emailTransport.sendMail({
        from: `TACL-LYF <${utils_1.REGISTRATION_EMAIL}>`,
        to: emailToSendTo,
        subject: `TACL-LYF Camp ${campYear} Registration Confirmation for ${camperName}`,
        html: htmlBody,
    });
}
//# sourceMappingURL=sendRegistrationEmail.js.map