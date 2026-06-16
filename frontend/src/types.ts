export type ContextQuality = "sufficient" | "limited" | "insufficient";

export interface LinkItem {
  label: string;
  url: string;
}

export interface SolutionSummary {
  id: string;
  slug: string;
  name: string;
  organizationName?: string;
  category: string;
  summary: string;
  priceText?: string;
  priceMonthly?: number | null;
  goals: string[];
  outputTypes: string[];
  keywords: string[];
  contextQuality: ContextQuality;
  decisionWarnings: string[];
  links: LinkItem[];
  officialUrl?: string;
  modooUrl: string;
}

export interface SolutionIndex {
  generatedAt: string;
  source: string;
  count: number;
  solutions: SolutionSummary[];
}

export interface SolutionDetail extends SolutionSummary {
  description?: string;
  usageType?: string;
  freeOffer?: string;
  sourceUrl?: string;
  sourceCapturedAt?: string;
  evidenceText?: string;
  markdownSnippet?: string;
}

export type PackMode = "goal" | "category" | "all";

export interface PackDefinition {
  id: string;
  title: string;
  eyebrow: string;
  description: string;
  fileName: string;
  mode: PackMode;
  accent: "blue" | "green" | "amber" | "teal" | "purple" | "gray";
  categoryName?: string;
  goalId?: string;
}

export interface ActivePack extends PackDefinition {
  solutionCount: number;
}
