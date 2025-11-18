import * as admin from "firebase-admin";
import { onCall, HttpsError } from "firebase-functions/v2/https";

export const writeLead = onCall(
  { region: "us-central1" },
  async (request) => {
    const { name, phone, email, message, listingId } = request.data;

    if (!listingId) {
      throw new HttpsError("invalid-argument", "Missing listingId");
    }

    const payload = {
      name: name || "",
      phone: phone || "",
      email: email || "",
      message: message || "",
      listingId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await admin.firestore().collection("leads").add(payload);

    return { status: "ok" };
  }
);
