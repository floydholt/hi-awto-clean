// src/alerts.ts
import { db } from "./admin.js";
import { sendAdminSms } from "./sms.js";
import { sendAdminEmail } from "./email.js";

export async function sendAdminAlert(subject: string, message: string) {
  const snap = await db.collection("admins").get();

  for (const doc of snap.docs) {
    const admin = doc.data();

    if (admin.email) {
      await sendAdminEmail(admin.email, subject, message);
    }

    if (admin.phone) {
      await sendAdminSms(admin.phone, `[HI-AWTO] ${subject}: ${message}`);
    }
  }
}
