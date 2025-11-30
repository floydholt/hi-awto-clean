// src/aiVision.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
const apiKey = process.env.GEMINI_API_KEY;
const client = apiKey ? new GoogleGenerativeAI(apiKey) : null;
const model = client ? client.getGenerativeModel({ model: "gemini-1.5-flash" }) : null;
async function imageUrlToPart(url) {
    const res = await fetch(url);
    const arrayBuffer = await res.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const contentType = res.headers.get("content-type") || "image/jpeg";
    return {
        inlineData: {
            data: base64,
            mimeType: contentType
        }
    };
}
export async function generateAITags(imageUrls) {
    try {
        if (!model || imageUrls.length === 0) {
            return { tags: [], caption: "" };
        }
        const imageParts = await Promise.all(imageUrls.map(imageUrlToPart));
        const prompt = "You are analyzing real estate listing photos. " +
            "Return JSON with: { tags: string[], caption: string }. " +
            "tags: 10-18 short keywords (hyphenated, no spaces). " +
            "caption: 1 short sentence about the property (max 20 words).";
        const result = await model.generateContent({
            contents: [
                {
                    role: "user",
                    parts: [{ text: prompt }, ...imageParts]
                }
            ]
        });
        const text = result.response.text().trim();
        let parsed;
        try {
            parsed = JSON.parse(text);
        }
        catch (err) {
            console.error("AI Vision JSON parse error:", text);
            return { tags: [], caption: "" };
        }
        const tags = Array.isArray(parsed.tags) ? parsed.tags : [];
        const caption = typeof parsed.caption === "string" ? parsed.caption : "";
        return { tags, caption };
    }
    catch (err) {
        console.error("AI Vision Error:", err);
        return { tags: [], caption: "" };
    }
}
