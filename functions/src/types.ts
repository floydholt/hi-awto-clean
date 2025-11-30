// src/types.ts

/* --------------------------------------------------
   AI VISION (TAGS + CAPTION)
-------------------------------------------------- */
export interface VisionResult {
  tags: string[];
  caption: string;
}

/* --------------------------------------------------
   AI FULL PROPERTY DESCRIPTION
-------------------------------------------------- */
export interface DescriptionInput {
  title: string;
  address: string;
  beds?: number;
  baths?: number;
  sqft?: number;
  description: string;
  aiTags: string[];
}

export interface AIDescription {
  fullDescription: string;
}

/* --------------------------------------------------
   AI PRICING SUGGESTION
-------------------------------------------------- */
export interface PricingInput {
  title: string;
  description: string;
  beds: number;
  baths: number;
  sqft: number;
  zip: string;
  price: number;
}

export interface AIPricing {
  estimate: number;
  low: number;
  high: number;
  downPayment: number;
  confidence: string;
  reasoning: string;
}

/* --------------------------------------------------
   AI FRAUD ANALYSIS (LISTING)
-------------------------------------------------- */
export interface FraudAssessment {
  score: number; // 0–100
  riskLevel: "low" | "medium" | "high";
  flags: string[];
  explanation: string;
}

/* --------------------------------------------------
   FRAUD ANALYTICS (TREND CHART)
-------------------------------------------------- */
export interface FraudAnalyticsPoint {
  timestamp: number;
  score: number;
  riskLevel: "low" | "medium" | "high";
}

/* --------------------------------------------------
   AI PHOTO CLASSIFICATION
-------------------------------------------------- */
export interface PhotoClassificationResult {
  type: string;       // e.g., "kitchen", "bathroom", "living_room"
  confidence: number; // 0–1
}
