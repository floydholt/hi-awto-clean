// src/aiFraud.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
const apiKey = process.env.GEMINI_API_KEY;
const client = apiKey ? new GoogleGenerativeAI(apiKey) : null;
const model = client ? client.getGenerativeModel({ model: "gemini-1.5-flash" }) : null;
export async function runFraudCheck(listing) {
    const fallback = {
        score: 20,
        riskLevel: "low",
        flags: [],
        explanation: "Baseline low-risk assessment."
    };
    if (!model)
        return fallback;
    const prompt = "You are detecting potential fraud in a real-estate marketplace. " +
        "Analyze the JSON listing and return JSON: { score: 0-100, riskLevel: 'low'|'medium'|'high', flags: string[], explanation: string }.\n\n" +
        JSON.stringify(listing, null, 2);
    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        let parsed;
        try {
            parsed = JSON.parse(text);
        }
        catch (err) {
            console.error("AI Fraud JSON parse error:", text);
            return fallback;
        }
        let score = Number(parsed.score ?? fallback.score);
        if (!Number.isFinite(score) || score < 0 || score > 100)
            score = fallback.score;
        const riskLevel = parsed.riskLevel === "high" || parsed.riskLevel === "medium" || parsed.riskLevel === "low"
            ? parsed.riskLevel
            : "low";
        const flags = Array.isArray(parsed.flags) ? parsed.flags.map(String) : [];
        const explanation = typeof parsed.explanation === "string" ? parsed.explanation : fallback.explanation;
        return { score, riskLevel, flags, explanation };
    }
    catch (err) {
        console.error("AI Fraud Error:", err);
        return fallback;
    }
}
