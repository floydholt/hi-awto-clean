// client/src/api/ai.js
import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase"; // <-- your firebase.js exports this

export async function generateDraft(threadMessages) {
  const fn = httpsCallable(functions, "generateDraft");
  const resp = await fn({ threadMessages });
  return resp.data?.draft || "";
}
