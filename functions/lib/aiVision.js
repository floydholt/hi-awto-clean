"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAITags = generateAITags;
const generative_ai_1 = require("@google/generative-ai");
const MODEL_VISION = "gemini-1.5-flash";
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: MODEL_VISION });
async function generateAITags(imageUrl) {
    var _a, _b, _c, _d, _e, _f;
    try {
        const result = await model.generateContent([
            {
                role: "user",
                parts: [
                    { text: "Analyze this property image and extract:" },
                    { text: "- 15 descriptive tags" },
                    { text: "- a one-sentence caption" },
                    { image_url: imageUrl } // Gemini Vision REST style
                ],
            },
        ]);
        const text = result.response.text().trim();
        const tags = (_c = (_b = (_a = text
            .match(/tags:(.*)/i)) === null || _a === void 0 ? void 0 : _a[1]) === null || _b === void 0 ? void 0 : _b.split(/[,;]+/g).map((t) => t.trim().toLowerCase()).filter(Boolean).slice(0, 15)) !== null && _c !== void 0 ? _c : [];
        const caption = (_f = (_e = (_d = text.match(/caption:(.*)/i)) === null || _d === void 0 ? void 0 : _d[1]) === null || _e === void 0 ? void 0 : _e.trim()) !== null && _f !== void 0 ? _f : "A home listed on HI-AWTO.";
        return { tags, caption };
    }
    catch (err) {
        console.error("Vision AI Error:", err);
        return { tags: [], caption: "" };
    }
}
//# sourceMappingURL=aiVision.js.map