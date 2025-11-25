import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
export async function runFraudCheck(listing) {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const prompt = `
Evaluate potential fraud risk for this listing:

${JSON.stringify(listing, null, 2)}

Provide JSON only:
{
  "riskScore": number,
  "flags": string[],
  "explanation": string
}
`;
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
}
//# sourceMappingURL=aiFraud.js.map