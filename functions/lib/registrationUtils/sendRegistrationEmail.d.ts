import { Camper, CamperHealth, Registration } from "lyf-registration-schemas";
/**
 * Send the waitlist confirmation email.
 * @param emailToSendTo
 * @param campYear
 * @param camperAndRegInfo
 * @param demographics
 */
export declare function sendRegistrationEmail(emailToSendTo: string, campYear: number, camperInfo: Camper, registrationInfo: Registration, camperHealth: CamperHealth | null): Promise<void>;
//# sourceMappingURL=sendRegistrationEmail.d.ts.map