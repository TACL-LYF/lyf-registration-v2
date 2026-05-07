import { RegistrationType } from "../utils";
import { CollectionReference } from "firebase-admin/firestore";
import { CampTrack } from "lyf-registration-schemas";
export declare enum MailchimpList {
    GENERAL = "2bd94e4a2c",
    REGISTERED = "7e35c51f18",
    PRE_REG = "7e35c51f18"
}
export declare const getMailchimpList: (regType: RegistrationType) => MailchimpList;
export declare const getMailchimpTag: (campYear: string, regType: RegistrationType) => string;
export declare const getMailchimpTagForCampTrack: (campYear: string, campTrack: string) => string;
/**
 * Subscribe an email to our Mailchimp TACL-LYF General Mailing List.
 * @param email
 * @param firstName
 * @param lastName
 */
export declare function subscribeEmailToGeneralMailingList(email: string, firstName: string | null, lastName: string | null): void;
/**
 * Add registration tags to a user in our registered mailing list.
 * @param email
 * @param tagsToAdd
 */
export declare function addMailchimpTags(email: string, tagsToAdd: string[], regType: RegistrationType): Promise<void>;
/**
 * A wrapper around the above function which just generates the tag given the camp year.
 * @param email
 * @param campYear
 * @param regType
 */
export declare function addMailchimpTagForCampYear(email: string, campYear: number, regType: RegistrationType): Promise<void>;
/**
 * Remove registration tags from a user in our registered mailing list.
 * @param email
 * @param tagsToRemove
 */
export declare function removeMailchimpTags(email: string, tagsToRemove: string[], regType: RegistrationType): Promise<void>;
/**
 * A wrapper around the above function which just remove the tag given the camp year.
 * @param email
 * @param campYear
 * @param regType
 */
export declare function removeMailchimpTagForCampYear(email: string, campYear: number, regType: RegistrationType): Promise<void>;
/**
 * Add a user to our registered mailing list.
 * @param email
 * @param firstName
 * @param lastName
 */
export declare function addMailchimpUserToMailingList(email: string, firstName: string | null, lastName: string | null, regType: RegistrationType): Promise<void>;
/**
 * Add all parents from the parents collection to a mailing list.
 * @param regType
 * @param parentCollectionRef
 * @param campYear
 */
export declare function addParentsToMailchimpList(regType: RegistrationType, parentCollectionRef: CollectionReference, campYear: string, campTracks?: CampTrack[]): Promise<void>;
//# sourceMappingURL=mailchimp.d.ts.map