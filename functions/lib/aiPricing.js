"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAIPricing = generateAIPricing;
const generative_ai_1 = require("@google/generative-ai");
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
async function generateAIPricing(input) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    try {
        const prompt = `
Act as a real estate pricing analyst.

Using the following listing details:

Title: ${input.title}
Description: ${input.description}
Beds: ${input.beds}
Baths: ${input.baths}
Sqft: ${input.sqft}
Zip code: ${input.zip}
Listed price: $${input.price.toLocaleString()}

Return ONLY a JSON object:
{
  "estimate": number,
  "low": number,
  "high": number,
  "confidence": "LOW" | "MEDIUM" | "HIGH",
  "reasoning": string,
  "downPayment": number
}
    `;
        const result = await model.generateContent(prompt);
        const parsed = JSON.parse((_b = (_a = result.response) === null || _a === void 0 ? void 0 : _a.text()) !== null && _b !== void 0 ? _b : "{}");
        return {
            estimate: (_c = parsed.estimate) !== null && _c !== void 0 ? _c : input.price,
            low: (_d = parsed.low) !== null && _d !== void 0 ? _d : input.price * 0.9,
            high: (_e = parsed.high) !== null && _e !== void 0 ? _e : input.price * 1.1,
            confidence: (_f = parsed.confidence) !== null && _f !== void 0 ? _f : "MEDIUM",
            reasoning: (_g = parsed.reasoning) !== null && _g !== void 0 ? _g : "No reasoning provided.",
            downPayment: (_h = parsed.downPayment) !== null && _h !== void 0 ? _h : Math.round(input.price * 0.03)
        };
    }
    catch (err) {
        console.error("AI Pricing failed:", err);
        return {
            estimate: input.price,
            low: input.price * 0.9,
            high: input.price * 1.1,
            confidence: "LOW",
            reasoning: "AI model unavailable.",
            downPayment: Math.round(input.price * 0.03)
        };
    }
}
//# sourceMappingURL=aiPricing.js.map