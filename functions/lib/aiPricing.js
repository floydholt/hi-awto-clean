// src/aiPricing.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
const apiKey = process.env.GEMINI_API_KEY;
const client = apiKey ? new GoogleGenerativeAI(apiKey) : null;
const model = client ? client.getGenerativeModel({ model: "gemini-1.5-flash" }) : null;
export async function generateAIPricing(input) {
    const fallback = {
        estimate: input.price || 0,
        low: Math.round((input.price || 0) * 0.9),
        high: Math.round((input.price || 0) * 1.1),
        downPayment: Math.round((input.price || 0) * 0.05),
        confidence: "medium",
        reasoning: "AI pricing fallback based on list price."
    };
    if (!model)
        return fallback;
    const prompt = "You are an assistant estimating a fair list price for a residential property in the US. " +
        "Use the provided price as a starting point, but feel free to adjust. " +
        "Return JSON with: { estimate, low, high, downPayment, confidence, reasoning }.\n\n" +
        JSON.stringify(input, null, 2);
    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        let parsed;
        try {
            parsed = JSON.parse(text);
        }
        catch (err) {
            console.error("AI Pricing JSON parse error:", text);
            return fallback;
        }
        return {
            estimate: Number(parsed.estimate ?? fallback.estimate),
            low: Number(parsed.low ?? fallback.low),
            high: Number(parsed.high ?? fallback.high),
            downPayment: Number(parsed.downPayment ?? fallback.downPayment),
            confidence: String(parsed.confidence ?? fallback.confidence),
            reasoning: String(parsed.reasoning ?? fallback.reasoning)
        };
    }
    catch (err) {
        console.error("AI Pricing Error:", err);
        return fallback;
    }
}
