"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMailchimpTagForCampTrack = exports.getMailchimpTag = exports.getMailchimpList = exports.MailchimpList = void 0;
exports.subscribeEmailToGeneralMailingList = subscribeEmailToGeneralMailingList;
exports.addMailchimpTags = addMailchimpTags;
exports.addMailchimpTagForCampYear = addMailchimpTagForCampYear;
exports.removeMailchimpTags = removeMailchimpTags;
exports.removeMailchimpTagForCampYear = removeMailchimpTagForCampYear;
exports.addMailchimpUserToMailingList = addMailchimpUserToMailingList;
exports.addParentsToMailchimpList = addParentsToMailchimpList;
const tslib_1 = require("tslib");
const firebase_functions_1 = require("firebase-functions");
const mailchimp_marketing_1 = tslib_1.__importDefault(require("@mailchimp/mailchimp_marketing"));
const md5_1 = tslib_1.__importDefault(require("md5"));
const utils_1 = require("../utils");
const slackChannelWebhooks_1 = require("../slack/slackChannelWebhooks");
// Mailchimp
mailchimp_marketing_1.default.setConfig({
    apiKey: process.env.MAILCHIMP_API_KEY,
    server: process.env.MAILCHIMP_SERVER,
});
var MailchimpList;
(function (MailchimpList) {
    MailchimpList["GENERAL"] = "2bd94e4a2c";
    MailchimpList["REGISTERED"] = "7e35c51f18";
    // This one seems to be deleted as of July 2025, so we'll use the same as Reg
    // PRE_REG = "0fc22524d1",
    MailchimpList["PRE_REG"] = "7e35c51f18";
})(MailchimpList || (exports.MailchimpList = MailchimpList = {}));
const getMailchimpList = (regType) => {
    switch (regType) {
        case utils_1.RegistrationType.PreRegistration:
            return MailchimpList.PRE_REG;
        case utils_1.RegistrationType.Registration:
            return MailchimpList.REGISTERED;
        default:
            return MailchimpList.GENERAL;
    }
};
exports.getMailchimpList = getMailchimpList;
const getMailchimpTag = (campYear, regType) => `${campYear}${regType}`;
exports.getMailchimpTag = getMailchimpTag;
const getMailchimpTagForCampTrack = (campYear, campTrack) => `${campYear}${campTrack}CampTrack`;
exports.getMailchimpTagForCampTrack = getMailchimpTagForCampTrack;
/**
 * Subscribe an email to our Mailchimp TACL-LYF General Mailing List.
 * @param email
 * @param firstName
 * @param lastName
 */
function subscribeEmailToGeneralMailingList(email, firstName, lastName) {
    mailchimp_marketing_1.default.lists
        .addListMember(MailchimpList.GENERAL, {
        merge_fields: {
            FNAME: firstName,
            LNAME: lastName,
        },
        email_address: email.toLowerCase(),
        status: "subscribed",
    })
        .then(() => firebase_functions_1.logger.debug(`Successfully subscribed ${email} to mailing list`))
        .catch(() => firebase_functions_1.logger.warn(`Failed to subscribe ${email} to mailing list because they are already subscribed.`));
}
/**
 * Add registration tags to a user in our registered mailing list.
 * @param email
 * @param tagsToAdd
 */
async function addMailchimpTags(email, tagsToAdd, regType) {
    const hashedEmail = (0, md5_1.default)(email.toLowerCase());
    const mailingList = (0, exports.getMailchimpList)(regType);
    await mailchimp_marketing_1.default.lists.updateListMemberTags(mailingList, hashedEmail, {
        tags: tagsToAdd.map((tag) => ({
            name: tag,
            status: "active",
        })),
    });
}
/**
 * A wrapper around the above function which just generates the tag given the camp year.
 * @param email
 * @param campYear
 * @param regType
 */
async function addMailchimpTagForCampYear(email, campYear, regType) {
    await addMailchimpTags(email, [(0, exports.getMailchimpTag)(campYear.toString(), regType)], regType);
}
/**
 * Remove registration tags from a user in our registered mailing list.
 * @param email
 * @param tagsToRemove
 */
async function removeMailchimpTags(email, tagsToRemove, regType) {
    const hashedEmail = (0, md5_1.default)(email.toLowerCase());
    const mailingList = (0, exports.getMailchimpList)(regType);
    await mailchimp_marketing_1.default.lists.updateListMemberTags(mailingList, hashedEmail, {
        tags: tagsToRemove.map((tag) => ({
            name: tag,
            status: "inactive",
        })),
    });
}
/**
 * A wrapper around the above function which just remove the tag given the camp year.
 * @param email
 * @param campYear
 * @param regType
 */
async function removeMailchimpTagForCampYear(email, campYear, regType) {
    await removeMailchimpTags(email, [(0, exports.getMailchimpTag)(campYear.toString(), regType)], regType);
}
/**
 * Add a user to our registered mailing list.
 * @param email
 * @param firstName
 * @param lastName
 */
async function addMailchimpUserToMailingList(email, firstName, lastName, regType) {
    const hashedEmail = (0, md5_1.default)(email.toLowerCase());
    const mailingList = (0, exports.getMailchimpList)(regType);
    try {
        const response = await mailchimp_marketing_1.default.lists.setListMember(mailingList, hashedEmail, {
            email_address: email,
            merge_fields: {
                FNAME: firstName,
                LNAME: lastName,
            },
            status_if_new: "subscribed",
            status: "subscribed",
        });
        if (response.status == "subscribed" || response.status == 200) {
            firebase_functions_1.logger.info(`Successfully added ${email} to mailing list`);
        }
        else {
            firebase_functions_1.logger.warn(`Failed to add ${email} to mailing list`, response);
        }
    }
    catch (e) {
        firebase_functions_1.logger.error(e);
    }
}
/**
 * Add all parents from the parents collection to a mailing list.
 * @param regType
 * @param parentCollectionRef
 * @param campYear
 */
async function addParentsToMailchimpList(regType, parentCollectionRef, campYear, campTracks = []) {
    const parentDocs = await parentCollectionRef.listDocuments();
    await Promise.all(parentDocs.map(async (parent) => {
        const parentData = (await parent.get()).data();
        const { email, firstName, lastName } = parentData;
        if (!email || !firstName || !lastName) {
            return;
        }
        const lowerCaseEmail = email.toLowerCase();
        // Create or set the mailchimp user to subscribed
        try {
            await addMailchimpUserToMailingList(lowerCaseEmail, firstName, lastName, regType);
        }
        catch (e) {
            firebase_functions_1.logger.error(`Failed to add user ${lowerCaseEmail} with first name: ${firstName}, last name: ${lastName} to mailing list.`, e);
            (0, slackChannelWebhooks_1.sendMessageToRegistrationErrorMessages)(`Failed to add user ${lowerCaseEmail} with first name: ${firstName}, last name: ${lastName} to mailing list.`);
        }
        const tags = [
            (0, exports.getMailchimpTag)(campYear, regType),
            ...campTracks.map((campTrack) => (0, exports.getMailchimpTagForCampTrack)(campYear, campTrack)),
        ];
        try {
            await addMailchimpTags(lowerCaseEmail, tags, regType);
        }
        catch (e) {
            (0, slackChannelWebhooks_1.sendMessageToRegistrationErrorMessages)(`Failed to add tags to user ${lowerCaseEmail}: ${tags.join(", ")}`);
        }
    }));
}
//# sourceMappingURL=mailchimp.js.map