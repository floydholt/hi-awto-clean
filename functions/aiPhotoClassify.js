import { GoogleGenerativeAI } from "@google/generative-ai";
const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });
async function imageToPart(url) {
    const res = await fetch(url);
    const blob = await res.blob();
    const array = await blob.arrayBuffer();
    const base64 = Buffer.from(array).toString("base64");
    return {
        inlineData: {
            data: base64,
            mimeType: blob.type || "image/jpeg",
        },
    };
}
export async function classifyPhoto(imageUrl) {
    try {
        const part = await imageToPart(imageUrl);
        if (!part) {
            return { roomType: null, features: [], condition: null, qualityScore: null };
        }
        const prompt = `
Classify the photo. Output ONLY JSON:

{
  "roomType": "kitchen | bedroom | bathroom | living_room | exterior | yard | floorplan | other",
  "features": ["short", "keywords"],
  "condition": "poor | fair | good | excellent",
  "qualityScore": number
}`;
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }, part] }],
        });
        const raw = result.response.text().trim();
        let parsed;
        try {
            parsed = JSON.parse(raw);
        }
        catch {
            return { roomType: null, features: [], condition: null, qualityScore: null };
        }
        return {
            roomType: parsed.roomType ?? null,
            features: Array.isArray(parsed.features) ? parsed.features : [],
            condition: parsed.condition ?? null,
            qualityScore: typeof parsed.qualityScore === "number" ? parsed.qualityScore : null,
        };
    }
    catch (err) {
        console.error("AI classify error:", err);
        return { roomType: null, features: [], condition: null, qualityScore: null };
    }
}
//# sourceMappingURL=aiPhotoClassify.js.map