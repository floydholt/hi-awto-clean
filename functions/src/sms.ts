import * as admin from "firebase-admin";
import twilio from "twilio";

const TWILIO_SID = process.env.TWILIO_SID!;
const TWILIO_TOKEN = process.env.TWILIO_TOKEN!;
const TWILIO_PHONE = process.env.TWILIO_PHONE!;

const client = twilio(TWILIO_SID, TWILIO_TOKEN);

/**
 * Send SMS to all admins in /alerts_admins collection
 */
export async function sendAdminSms(body: string) {
  const adminsSnap = await admin.firestore().collection("admins").get();
  const adminPhones = adminsSnap.docs.map((d) => d.data()?.phone).filter(Boolean);

  await Promise.all(
    adminPhones.map((to) =>
      client.messages.create({
        body,
        to,
        from: TWILIO_PHONE,
      })
    )
  );
}
