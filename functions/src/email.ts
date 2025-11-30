import sendgrid from "@sendgrid/mail";
sendgrid.setApiKey(process.env.SENDGRID_API_KEY!);

/**
 * Email all admins
 */
export async function emailAdmins(subject: string, text: string) {
  const adminsSnap = await admin.firestore().collection("admins").get();
  const adminEmails = adminsSnap.docs.map((d) => d.data()?.email).filter(Boolean);

  await sendgrid.sendMultiple({
    to: adminEmails,
    from: "alerts@hi-awto.com",
    subject,
    text,
  });
}
