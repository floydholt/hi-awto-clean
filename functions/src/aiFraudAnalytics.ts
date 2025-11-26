// functions/src/aiFraudAnalytics.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { FraudAssessment } from "./types.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/* -------------------------------------------------------
   Score a listing for fraud risk
------------------------------------------------------- */
export async function scoreListingFraud(
  data: {
    title: string;
    description: string;
    price: number;
    beds: number;
    baths: number;
    sqft: number;
    address?: string;
  }
): Promise<FraudAssessment> {
  const prompt = `
You are an AI system that scores real estate listings for fraud.

Identify:
- Suspicious patterns (e.g., price too low, vague description)
- Missing details
- Mismatches between price, square footage, or amenities
- Known scam patterns
Return:
- fraudScore from 1–10
- explanation (1–2 sentences)
`;

  const result = await model.generateContent([
    { text: prompt },
    {
      text: JSON.stringify({
        title: data.title,
        description: data.description,
        price: data.price,
        beds: data.beds,
        baths: data.baths,
        sqft: data.sqft,
        address: data.address ?? "",
      }),
    },
  ]);

  const text = result.response.text().trim();

  let score = 1;
  let explanation = "Unable to parse.";

  try {
    const parsed = JSON.parse(text);
    score = parsed.fraudScore ?? 1;
    explanation = parsed.explanation ?? "";
  } catch (err) {
    // fallback: try to parse manually
    const matchScore = text.match(/(\d+)/);
    score = matchScore ? Number(matchScore[1]) : 1;
    explanation = text.slice(0, 200);
  }

  return {
    score,
    explanation,
  };
}
