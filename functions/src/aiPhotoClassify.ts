// src/aiPhotoClassify.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { PhotoClassificationResult } from "./types.js";

const apiKey = process.env.GEMINI_API_KEY;
const client = apiKey ? new GoogleGenerativeAI(apiKey) : null;
const model = client ? client.getGenerativeModel({ model: "gemini-1.5-flash" }) : null;

async function imageUrlToPart(url: string): Promise<any> {
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

export async function classifyPhoto(imageUrl: string): Promise<PhotoClassificationResult> {
  const fallback: PhotoClassificationResult = {
    type: "unknown",
    confidence: 0
  };

  if (!model || !imageUrl) return fallback;

  try {
    const part = await imageUrlToPart(imageUrl);

    const prompt =
      "Classify the type of room shown in this real estate photo. " +
      "Return JSON { type: string, confidence: number between 0 and 1 }. " +
      "type should be one of: 'kitchen','bathroom','bedroom','living_room','exterior','other'.";

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }, part] as any[]
        }
      ]
    });

    const text = result.response.text().trim();
    let parsed: any;

    try {
      parsed = JSON.parse(text);
    } catch (err) {
      console.error("AI Photo classify JSON parse error:", text);
      return fallback;
    }

    const type =
      typeof parsed.type === "string" && parsed.type.length
        ? parsed.type
        : fallback.type;

    let confidence = Number(parsed.confidence ?? fallback.confidence);
    if (!Number.isFinite(confidence) || confidence < 0 || confidence > 1) {
      confidence = fallback.confidence;
    }

    return { type, confidence };
  } catch (err) {
    console.error("AI Photo classify error:", err);
    return fallback;
  }
}
