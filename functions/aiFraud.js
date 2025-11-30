// functions/src/aiFraud.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });
export async function runFraudCheck(listing) {
    const prompt = `
Analyze fraud risk for this real estate listing.
Return JSON ONLY.
Consider:
- Price too low or unrealistic
- Description mismatches
- Scam phrases
- Missing photos
- Low-quality AI images
- Suspicious patterns

Listing data:
${JSON.stringify(listing)}
`;
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    try {
        const parsed = JSON.parse(text);
        return {
            score: parsed.score ?? 0,
            riskLevel: parsed.riskLevel ?? "low",
            flags: parsed.flags ?? [],
            explanation: parsed.explanation ?? "No explanation",
        };
    }
    catch (e) {
        console.error("Fraud JSON parse failed:", text);
        return {
            score: 20,
            riskLevel: "low",
            flags: ["json_parse_failed"],
            explanation: "AI fallback fraud estimate.",
        };
    }
}
//# sourceMappingURL=aiFraud.js.map