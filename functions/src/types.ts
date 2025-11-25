// All shared AI interfaces

export interface AIVisionResult {
  tags: string[];
  caption: string;
}

export interface AIDescriptionInput {
  title: string;
  address: string;
  description: string;
  price: number;
  downPayment: number;
  tags: string[];
}

export interface AIPricingInput {
  price: number;
  address: string;
  description: string;
  tags: string[];
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
  riskScore: number;
  flags: string[];
  explanation: string;
}
