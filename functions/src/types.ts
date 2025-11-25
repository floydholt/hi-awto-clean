// Shared Types for all AI modules

export interface AIVisionResult {
  tags: string[];
  caption: string;
}

export interface AIDescriptionInput {
  title: string;
  address: string;
  description: string;
  tags: string[];
}

export interface AIPricingInput {
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

export interface ListingFraudAssessment {
  score: number;
  flags: string[];
  verdict: "legitimate" | "suspicious" | "fraudulent";
}
