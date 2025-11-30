import sendgrid from "@sendgrid/mail";

sendgrid.setApiKey(process.env.SENDGRID_API_KEY!);

/**
 * Send an email to a specific admin
 */
export async function sendAdminEmail(
  to: string,
  subject: string,
  message: string
): Promise<void> {
  if (!to) throw new Error("Recipient email is required");

  await sendgrid.send({
    to,
    from: process.env.SENDGRID_FROM_EMAIL || "noreply@hiawto.com",
    subject,
    text: message,
  });
}
