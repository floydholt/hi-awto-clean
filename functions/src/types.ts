// functions/src/types.ts

export interface VisionResult {
  tags: string[];
  caption: string;
}

export interface DescriptionInput {
  title: string;
  description: string;
  tags: string[];
}

export interface PricingInput {
  title: string;
  description: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  zip: string;
}

export interface AIPricing {
  estimate: number;
  low: number;
  high: number;
  downPayment: number;
  confidence: string;
  reasoning: string;
}

export interface FraudAssessment {
  score: number; // 1–10
  explanation: string;
}
