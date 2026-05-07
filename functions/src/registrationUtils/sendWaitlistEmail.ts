import * as Mustache from "mustache";
import {readFileSync} from "fs";
import mjml2html from "mjml";
import {resolve} from "path";

import {REGISTRATION_EMAIL, emailTransport} from "../utils";

const mjmlTemplate = readFileSync(
  resolve(__dirname, "../emailTemplates/waitlistTemplate.mjml"),
  "utf-8"
);

const htmlTemplate = mjml2html(mjmlTemplate, {
  minify: true, // Making it smaller to save on email file size
}).html;

/**
 * Send the waitlist confirmation email.
 * @param emailToSendTo
 * @param campYear
 * @param camperNames
 */
export async function sendWaitlistEmail(
  emailToSendTo: string,
  campYear: number,
  campTrack: string,
  camperName: string
) {
  const htmlBody = Mustache.render(htmlTemplate, {
    campYear: campYear,
    campTrack: campTrack,
    camperName: camperName,
  });

  await emailTransport.sendMail({
    from: `TACL-LYF <${REGISTRATION_EMAIL}>`,
    to: emailToSendTo,
    subject: `TACL-LYF Camp ${campYear} Waitlist Confirmation for ${camperName}`,
    html: htmlBody,
  });
}
