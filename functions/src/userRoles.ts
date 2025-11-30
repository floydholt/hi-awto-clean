// functions/src/userRoles.ts
import * as admin from "firebase-admin";

export async function onUserRoleWriteHandler(event: any) {
  const uid = event.params.uid;

  const after = event.data?.after;
  if (!after || !after.exists) {
    await admin.auth().setCustomUserClaims(uid, { admin: false });
    return;
  }

  const data = after.data();
  const isAdmin = data.role === "admin";

  await admin.auth().setCustomUserClaims(uid, { admin: isAdmin });
}
