/**
 * functions/index.js
 */

const functions = require("firebase-functions");
const nodemailer = require("nodemailer");
const admin = require("firebase-admin");
admin.initializeApp();

// Optional test function
exports.helloWorld = functions.https.onRequest((req, res) => {
  res.send("Hello from Firebase!");
});

// Example email notification function
exports.notifyNewLead = functions.https.onRequest(async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Load secrets from environment or Secret Manager
    const EMAIL_USER = process.env.EMAIL_USER;
    const EMAIL_PASS = process.env.EMAIL_PASS;
    const EMAIL_TO = process.env.EMAIL_TO;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: EMAIL_USER,
      to: EMAIL_TO,
      subject: `New Lead from ${name}`,
      text: `Email: ${email}\nMessage: ${message}`,
    });

    res.status(200).send("Email sent successfully!");
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).send("Error sending email");
  }
});
