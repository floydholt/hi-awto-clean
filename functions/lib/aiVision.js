"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeImageWithGemini = analyzeImageWithGemini;
const generative_ai_1 = require("@google/generative-ai");
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
async function analyzeImageWithGemini(imageUrl) {
    var _a, _b;
    try {
        const result = await model.generateContent({
            contents: [
                {
                    role: "user",
                    parts: [
                        {
                            text: "Analyze this real estate photo. " +
                                "Return ONLY a JSON object with { tags: string[], caption: string }. " +
                                "Tags should be short keywords (e.g., 'modern kitchen'). " +
                                "Caption should be 1–2 sentences."
                        },
                        {
                            fileData: {
                                mimeType: "image/jpeg", // adjust if PNG
                                fileUri: imageUrl
                            }
                        }
                    ]
                }
            ]
        });
        const text = (_b = (_a = result.response) === null || _a === void 0 ? void 0 : _a.text()) !== null && _b !== void 0 ? _b : "";
        const parsed = JSON.parse(text);
        return {
            tags: parsed.tags || [],
            caption: parsed.caption || ""
        };
    }
    catch (err) {
        console.error("Gemini Vision error:", err);
        return { tags: [], caption: "" };
    }
}
//# sourceMappingURL=aiVision.js.map