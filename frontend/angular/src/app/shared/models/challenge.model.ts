// src/app/shared/models/challenge.models.ts (create this file)
// Re-using your existing types and adding new ones for AI models.

export type PricingTier = 'free' | 'budget' | 'balanced' | 'premium' | 'custom';
export type ChallengeType = 'job' | 'prize';
export type SubmissionType = 'link' | 'file' | 'text';
export type IdealSolutionType = 'link' | 'file' | 'text'; // New type for idealSolution

export interface IAiModel {
  id: string;
  name: string;
  provider: string;
  costPer1kTokens: number;
  accuracyRating: number;
  speed: string;
  bestFor: string[];
  description: string;
  isFree: boolean;
  freeTierLimit?: string;
  estimatedCostPerEval: number;
}

export interface IPricingTierDetails {
  tier: PricingTier;
  defaultModel: string;
  estimatedCostPerEval: number;
  description: string;
  modelDetails: IAiModel;
}

export interface IAiModelsResponse {
  success: boolean;
  data: {
    models: IAiModel[];
    pricingTiers: IPricingTierDetails[];
    recommendation: string;
  };
}

// Your existing IChallenge interface (if needed for reference, not directly used here)
export interface IChallenge {
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  deadline: Date;
  creatorId: string;
  status: 'draft' | 'published' | 'closed';
  type: 'job' | 'prize';
  submissionType: 'link' | 'file' | 'text';
  prizeAmount?: number;
  salary?: number;
  additionalInfo?: string;
  tags?: string[];
  requirements: string;
  evaluationCriteria: string;
  deliverables: string;
  idealSolution?: string; // This needs to be a sub-object for type/value
  aiConfig: {
    pricingTier: PricingTier;
    selectedModel?: IAiModel; // If custom tier
    autoEvaluate: boolean; // Auto-evaluate on submission
    requireVideoTranscript: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}
