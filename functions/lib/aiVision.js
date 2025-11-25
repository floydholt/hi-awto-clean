import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
export async function generateAITags(imageUrls) {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    let tags = [];
    let caption = "";
    for (const url of imageUrls.slice(0, 3)) {
        const img = await fetch(url).then(r => r.arrayBuffer());
        const inlineData = {
            inlineData: {
                data: Buffer.from(img).toString("base64"),
                mimeType: "image/jpeg"
            }
        };
        const result = await model.generateContent([
            "Extract 5–10 descriptive tags and a 1-sentence caption.",
            inlineData
        ]);
        const text = result.response.text();
        const extractedTags = text.match(/#[a-zA-Z0-9]+/g) || [];
        tags.push(...extractedTags);
        if (!caption) {
            caption = text.split("\n")[0];
        }
    }
    return {
        tags: [...new Set(tags.map(t => t.replace("#", "").toLowerCase()))].slice(0, 15),
        caption
    };
}
//# sourceMappingURL=aiVision.js.map