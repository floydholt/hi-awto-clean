// src/email.ts
import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function sendAdminEmail(to: string, subject: string, message: string) {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn("SendGrid API key missing");
    return;
  }

  await sgMail.send({
    to,
    from: process.env.SENDGRID_FROM_EMAIL!,
    subject,
    text: message,
    html: `<p>${message}</p>`,
  });
}
