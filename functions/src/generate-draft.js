// functions/src/generate-draft.js
const admin = require("firebase-admin");
const functions = require("firebase-functions");
const { GoogleGenerativeAI } = require("@google/generative-ai");

admin.initializeApp();

const AI_API_KEY = process.env.AI_API_KEY || (functions.config && functions.config().ai && functions.config().ai.key);

function buildPrompt(threadMessages) {
  const last = threadMessages.slice(-8);
  const messagesText = last
    .map(m => `${m.senderDisplayName || m.sender || "User"} (${m.senderRole || "user"}): ${m.text}`)
    .join("\n");
  return `You are an assistant that writes short, polite replies for a real-estate marketplace chat between buyer and seller. Given the recent conversation, write a concise draft reply suitable for the current user to send. Keep it friendly, clear, and action-oriented. Output only the reply text (no JSON).

Conversation:
${messagesText}

Instructions:
- Keep reply length to about 1-3 sentences.
- Mention a next step if relevant.
- Use polite, helpful tone.
- Do not invent facts.

Now produce the draft reply below:
`;
}

exports.generateDraft = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "You must be signed in.");
  }
  const threadMessages = data.threadMessages;
  if (!threadMessages || !Array.isArray(threadMessages)) {
    throw new functions.https.HttpsError("invalid-argument", "threadMessages (array) is required");
  }
  const apiKey = AI_API_KEY;
  if (!apiKey) {
    throw new functions.https.HttpsError("failed-precondition", "AI API key not configured.");
  }
  try {
    const client = new GoogleGenerativeAI(apiKey);
    const model = client.getGenerativeModel({ model: "gemini-pro" });
    const prompt = buildPrompt(threadMessages);
    const result = await model.generateContent({ input: prompt });
    const text = result.response?.text?.() || "";
    const draft = text.trim();
    await admin.firestore().collection("logs").add({
      type: "ai_generate_draft",
      message: draft.slice(0, 300),
      meta: { user: context.auth.uid, threadSize: threadMessages.length },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { draft };
  } catch (err) {
    console.error("generateDraft error:", err);
    throw new functions.https.HttpsError("internal", "AI generation failed.");
  }
});
