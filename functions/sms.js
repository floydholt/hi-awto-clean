import twilio from "twilio";
import { db } from "./admin.js"; // optional if you want to fetch admin phones
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_FROM_NUMBER;
const client = twilio(accountSid, authToken);
/**
 * Broadcast an SMS message to all admin phone numbers
 */
export async function sendAdminSms(message) {
    const snap = await db.collection("admins").get();
    const recipients = snap.docs.map(d => d.data()?.phone).filter(Boolean);
    for (const phone of recipients) {
        await client.messages.create({
            body: message,
            from: fromNumber,
            to: phone,
        });
    }
}
//# sourceMappingURL=sms.js.map