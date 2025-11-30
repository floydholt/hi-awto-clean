import "dotenv/config";
import * as Twilio from "twilio";
import sendgrid from "@sendgrid/mail";

// Load env vars
const {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_FROM_NUMBER,
  TEST_PHONE_NUMBER,
  SENDGRID_API_KEY,
  SENDGRID_FROM_EMAIL,
  TEST_EMAIL_TO,
} = process.env;

// Debug logs to confirm env vars are loaded
console.log("Twilio SID:", TWILIO_ACCOUNT_SID);
console.log("Twilio Token:", TWILIO_AUTH_TOKEN ? "set" : "missing");
console.log("Twilio From:", TWILIO_FROM_NUMBER);
console.log("Test Phone:", TEST_PHONE_NUMBER);
console.log("SendGrid Key:", SENDGRID_API_KEY ? "set" : "missing");
console.log("SendGrid From:", SENDGRID_FROM_EMAIL);
console.log("Test Email:", TEST_EMAIL_TO);

// --- Twilio SMS Test ---
async function testTwilio() {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM_NUMBER || !TEST_PHONE_NUMBER) {
    console.error("❌ Missing Twilio env vars");
    return;
  }

  const client = Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  try {
    const msg = await client.messages.create({
      body: "✅ Twilio smoke test successful!",
      from: TWILIO_FROM_NUMBER,
      to: TEST_PHONE_NUMBER,
    });
    console.log("Twilio SMS sent:", msg.sid);
  } catch (err) {
    console.error("Twilio error:", err);
  }
}

// --- SendGrid Email Test ---
async function testSendGrid() {
  if (!SENDGRID_API_KEY || !SENDGRID_FROM_EMAIL || !TEST_EMAIL_TO) {
    console.error("❌ Missing SendGrid env vars");
    return;
  }

  sendgrid.setApiKey(SENDGRID_API_KEY);
  try {
    const [resp] = await sendgrid.send({
      to: TEST_EMAIL_TO,
      from: SENDGRID_FROM_EMAIL,
      subject: "✅ SendGrid smoke test",
      text: "This is a test email from HI AWTO functions.",
    });
    console.log("SendGrid email response:", resp.statusCode);
  } catch (err) {
    console.error("SendGrid error:", err);
  }
}

// Run both tests
(async () => {
  await testTwilio();
  await testSendGrid();
})();
