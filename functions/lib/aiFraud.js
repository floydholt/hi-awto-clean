"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runFraudCheck = runFraudCheck;
const generative_ai_1 = require("@google/generative-ai");
const MODEL = "gemini-1.5-flash";
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: MODEL });
async function runFraudCheck(text) {
    try {
        const prompt = `
Analyze this listing for fraud or suspicious behavior.
Return ONLY JSON structured like:

{
  "score": number,
  "flags": string[],
  "verdict": "legitimate" | "suspicious" | "fraudulent"
}

Text:
${text}
`;
        const res = await model.generateContent(prompt);
        return JSON.parse(res.response.text());
    }
    catch (err) {
        console.error("Fraud check error:", err);
        return {
            score: 0,
            flags: [],
            verdict: "legitimate",
        };
    }
}
//# sourceMappingURL=aiFraud.js.map