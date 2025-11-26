import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Convert image URL to base64
async function fetchImageAsBase64(url: string): Promise<string> {
  const res = await fetch(url);
  const arrayBuffer = await res.arrayBuffer();
  const bytes = Buffer.from(arrayBuffer);
  return bytes.toString("base64");
}

export interface VisionResult {
  tags: string[];
  caption: string;
}

export async function generateAITags(imageUrl: string): Promise<VisionResult> {
  try {
    const base64 = await fetchImageAsBase64(imageUrl);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-vision-preview"
    });

    const prompt = `
You are an AI that extracts tags describing a real estate listing photo.
Output 8–15 short tags only (no sentences). Also output one short natural caption.
Return JSON:
{
  "tags": ["tag1","tag2",...],
  "caption": "a short caption"
}
    `;

    const result = await model.generateContent([
      { text: prompt },
      { inlineData: { mimeType: "image/jpeg", data: base64 } }
    ]);

    const text = result.response.text().trim();

    const parsed = JSON.parse(text);

    return {
      tags: parsed.tags ?? [],
      caption: parsed.caption ?? ""
    };
  } catch (err) {
    console.error("Vision AI error:", err);
    return { tags: [], caption: "" };
  }
}
