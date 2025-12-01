// functions/src/email.ts
import * as sg from "@sendgrid/mail";
import { db } from "./admin.js";

sg.setApiKey(process.env.SENDGRID_API_KEY!);

/**
 * Send an email to a single admin
 */
export async function sendAdminEmail(to: string, subject: string, message: string) {
  await sg.send({
    to,
    from: process.env.SENDGRID_FROM_EMAIL!,
    subject,
    text: message,
  });
}

/**
 * Broadcast admin email
 */
export async function broadcastAdminEmail(subject: string, message: string) {
  const snap = await db.collection("admins").get();
  const emails = snap.docs.map((d) => d.data()?.email).filter(Boolean);

  for (const email of emails) {
    await sendAdminEmail(email, subject, message);
  }
}
