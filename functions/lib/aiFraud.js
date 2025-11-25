"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runFraudCheck = runFraudCheck;
const generative_ai_1 = require("@google/generative-ai");
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
async function runFraudCheck(input) {
    var _a, _b, _c, _d, _e;
    try {
        const prompt = `
You are a fraud detection system for a real estate platform.

Analyze this listing and return ONLY a JSON object:
{
  "score": number,  
  "label": "LOW" | "MEDIUM" | "HIGH",
  "reasoning": string
}

Listing details:
Title: ${input.title}
Description: ${input.description}
Price: $${input.price}
Seller ID: ${input.sellerId}
Account age (days): ${input.accountAge}
Multiple accounts: ${input.hasMultipleAccounts}
Uses possible stock photos: ${input.usesStockPhotos}
    `;
        const result = await model.generateContent(prompt);
        const parsed = JSON.parse((_b = (_a = result.response) === null || _a === void 0 ? void 0 : _a.text()) !== null && _b !== void 0 ? _b : "{}");
        return {
            score: (_c = parsed.score) !== null && _c !== void 0 ? _c : 0,
            label: (_d = parsed.label) !== null && _d !== void 0 ? _d : "LOW",
            reasoning: (_e = parsed.reasoning) !== null && _e !== void 0 ? _e : "No reasoning provided."
        };
    }
    catch (err) {
        console.error("AI Fraud check failed:", err);
        return {
            score: 0,
            label: "LOW",
            reasoning: "Fallback response: AI unavailable."
        };
    }
}
//# sourceMappingURL=aiFraud.js.map