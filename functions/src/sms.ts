// functions/src/sms.ts
import twilio from "twilio";
import { logger } from "firebase-functions";
import { db } from "./admin.js";

const accountSid = process.env.TWILIO_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const fromNumber = process.env.TWILIO_PHONE!;

const client = twilio(accountSid, authToken);

/**
 * Send SMS to a single phone number
 */
export async function sendAdminSms(phone: string, message: string): Promise<void> {
  if (!phone) {
    logger.error("sendAdminSms called without phone number.");
    return;
  }
  await client.messages.create({
    body: message,
    from: fromNumber,
    to: phone,
  });
}

/**
 * Broadcast SMS to *all* admin phone numbers
 */
export async function broadcastAdminSms(message: string): Promise<void> {
  const snap = await db.collection("admins").get();
  const admins = snap.docs.map((d) => d.data()).filter((x) => x?.phone);

  for (const adminUser of admins) {
    try {
      await sendAdminSms(adminUser.phone, message);
    } catch (e) {
      logger.error("Failed sending SMS to admin", adminUser.phone, e);
    }
  }
}
