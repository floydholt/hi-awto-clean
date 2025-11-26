// Centralized AI pipeline types

export interface VisionResult {
  tags: string[];
  caption: string; // always a string, fallback ""
}

export interface PricingEstimate {
  estimate: number;
  low: number;
  high: number;
  downPayment: number;
  reasoning: string;
}

export interface FraudAssessment {
  score: number;
  reason: string;
  flags: string[];
}
