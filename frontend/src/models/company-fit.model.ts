export interface CandidateProfileContext {
  skills: string[];
  yearsOfExperience: number;
  targetRoleLevel: 'intern' | 'junior' | 'mid' | 'senior' | 'staff' | 'principal';
  desiredSalaryMin?: number;
  desiredSalaryMax?: number;
  workPreference?: 'remote' | 'hybrid' | 'onsite' | 'any';
  educationOrBackground?: string;
  keyProjectsOrAchievements?: string;
}

export interface CustomCompanyFitRequest {
  companyName: string;
  companyWebsite?: string;
  careerUrl?: string;
  targetRole: string;
  jobDescription?: string;
  industry?: string;
  companyStage?: string;
  workModel?: 'remote' | 'hybrid' | 'onsite' | 'any';
  profile: CandidateProfileContext;
  modelConfig?: {
    provider?: 'gemini' | 'openai';
    model?: string;
    apiKey?: string;
  };
}

export interface CustomCompanyFitResult {
  companyName: string;
  targetRole: string;
  fitScore: number;
  category: 'Dream' | 'Target' | 'Safe';
  verdict: string;
  scoreBreakdown: {
    techStackMatch: number;
    experienceMatch: number;
    roleScopeMatch: number;
    cultureStageFit: number;
  };
  matchedSkills: string[];
  missingSkills: string[];
  transferableStrengths: string[];
  interviewInsights: {
    estimatedDifficulty: 'Moderate' | 'Challenging' | 'High-Bar Elite';
    expectedRounds: string[];
    keyTechnicalTopics: string[];
    behavioralFocus: string;
  };
  tailoredApplicationKit: {
    resumeHighlights: string[];
    recruiterOutreachPitch: string;
    strategicInterviewQuestions: string[];
  };
  estimatedCompRange: {
    min: number;
    max: number;
    currency: string;
  };
  workModel: 'remote' | 'hybrid' | 'onsite';
  industry: string;
  websiteSnippetUsed?: string;
  providerUsed: 'gemini' | 'openai' | 'expert_heuristic';
  modelUsed?: string;
}
