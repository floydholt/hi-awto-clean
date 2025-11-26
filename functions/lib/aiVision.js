/**
 * aiVision.ts
 * Gemini 1.5 Flash Vision Tagging + Captioning
 */
import { GoogleGenerativeAI } from "@google/generative-ai";
const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });
/**
 * Converts an image URL → Base64 inlineData part
 */
async function imageUrlToPart(url) {
    const res = await fetch(url);
    const blob = await res.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    return {
        inlineData: {
            data: base64,
            mimeType: blob.type || "image/jpeg"
        }
    };
}
/**
 * Main AI Vision function
 */
export async function generateAITags(imageUrls) {
    try {
        if (!imageUrls.length) {
            return { tags: [], caption: null };
        }
        // Convert all images → inline parts
        const imageParts = await Promise.all(imageUrls.map((url) => imageUrlToPart(url)));
        const prompt = "Extract 12–18 short keywords describing this property (no spaces, hyphens only). " +
            "Then generate a 1-sentence natural-language caption (max 18 words). " +
            "Return JSON with { tags: string[], caption: string }.";
        const result = await model.generateContent({
            contents: [
                {
                    role: "user",
                    parts: [{ text: prompt }, ...imageParts]
                }
            ]
        });
        const text = result.response.text();
        let parsed;
        try {
            parsed = JSON.parse(text);
        }
        catch (err) {
            console.error("AI Vision: Could not parse JSON:", text);
            return { tags: [], caption: null };
        }
        return {
            tags: Array.isArray(parsed.tags) ? parsed.tags : [],
            caption: parsed.caption ?? null
        };
    }
    catch (err) {
        console.error("AI Vision Error:", err);
        return { tags: [], caption: null };
    }
}
//# sourceMappingURL=aiVision.js.map