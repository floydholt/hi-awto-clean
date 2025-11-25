"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAIDescription = generateAIDescription;
const generative_ai_1 = require("@google/generative-ai");
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
async function generateAIDescription(input) {
    var _a, _b;
    try {
        const prompt = `
Write a full real estate property description using this data:

Title: ${input.title}
Features: ${input.tags.join(", ")}
Price: $${input.price.toLocaleString()}
Beds: ${input.beds}
Baths: ${input.baths}
Sqft: ${input.sqft}
Zip: ${input.zip}

Tone: friendly, professional, inspiring.
Length: 2–4 paragraphs.
    `;
        const result = await model.generateContent(prompt);
        return (_b = (_a = result.response) === null || _a === void 0 ? void 0 : _a.text()) !== null && _b !== void 0 ? _b : "";
    }
    catch (err) {
        console.error("AI Description failed:", err);
        return "";
    }
}
//# sourceMappingURL=aiDescription.js.map