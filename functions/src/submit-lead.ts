import * as admin from "firebase-admin";

export const submitLead = async (lead: any) => {
  await admin.firestore().collection("leads").add({
    ...lead,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
};
