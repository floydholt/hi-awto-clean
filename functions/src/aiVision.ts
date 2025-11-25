import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AIVisionResult } from "./types.js";

const MODEL_VISION = "gemini-1.5-flash";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: MODEL_VISION });

export async function generateAITags(imageUrl: string): Promise<AIVisionResult> {
  try {
    const result = await model.generateContent([
      {
        role: "user",
        parts: [
          { text: "Analyze this property image and extract:" },
          { text: "- 15 descriptive tags" },
          { text: "- a one-sentence caption" },
          { image_url: imageUrl } as any // Gemini Vision REST style
        ],
      },
    ]);

    const text = result.response.text().trim();

    const tags = text
      .match(/tags:(.*)/i)?.[1]
      ?.split(/[,;]+/g)
      .map((t: string) => t.trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 15) ?? [];

    const caption =
      text.match(/caption:(.*)/i)?.[1]?.trim() ??
      "A home listed on HI-AWTO.";

    return { tags, caption };
  } catch (err) {
    console.error("Vision AI Error:", err);
    return { tags: [], caption: "" };
  }
}
