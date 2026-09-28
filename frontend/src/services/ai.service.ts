import { httpClient } from '../core/utils/http-client.util';
import type { CustomCompanyFitRequest, CustomCompanyFitResult } from '../models';

export interface SitePreview {
  url: string;
  extractedSnippet: string;
  length: number;
}

export async function assessCompanyFit(
  payload: CustomCompanyFitRequest,
  userId?: string,
): Promise<CustomCompanyFitResult> {
  return httpClient.post<CustomCompanyFitResult>('/ai/company-fit', { userId, body: payload });
}

export async function previewSite(url: string, userId?: string): Promise<SitePreview> {
  return httpClient.post<SitePreview>('/ai/preview-site', { userId, body: { url } });
}

export interface TailorRequest {
  companyName: string;
  targetRole: string;
  jobDescription: string;
  currentResume?: string;
  applicantName?: string;
  tone?: 'impactful_tech' | 'executive' | 'conversational' | 'startup';
  focus?: 'all' | 'resume_bullets' | 'cover_letter';
}

export interface TailoredBullet {
  category: string;
  bulletPoint: string;
  keywordsHighlighted: string[];
  impactScore: number;
}

export interface TailoredCoverLetter {
  subject: string;
  salutation: string;
  openingParagraph: string;
  bodyParagraphs: string[];
  closingParagraph: string;
  fullLetterText: string;
}

export interface TailorResult {
  matchScore: number;
  matchGrade: 'A+' | 'A' | 'B+' | 'B' | 'Needs Work';
  matchAnalysis: string;
  matchedKeywords: string[];
  missingKeywords: string[];
  executiveSummary: string;
  tailoredBullets: TailoredBullet[];
  coverLetter: TailoredCoverLetter;
  interviewTalkingPoints: string[];
  companyName: string;
  targetRole: string;
  providerUsed: 'gemini' | 'openai' | 'expert_heuristic';
  modelUsed?: string;
}

export async function tailorResumeAndCoverLetter(
  payload: TailorRequest,
  userId?: string,
): Promise<TailorResult> {
  return httpClient.post<TailorResult>('/ai/tailor', { userId, body: payload });
}

export interface ImproveResumeRequest {
  resumeText?: string;
  singleBullet?: string;
  targetRole?: string;
  seniority?: 'junior' | 'mid' | 'senior' | 'staff';
}

export interface BulletImprovementOption {
  style: 'Metric & Scale' | 'Architecture & System Design' | 'Leadership & Ownership';
  bullet: string;
  impactScore: number;
  metricsHighlighted: string[];
}

export interface BulletImprovementResult {
  original: string;
  critique: string;
  improvedOptions: BulletImprovementOption[];
}

export interface PassivePhraseAlert {
  weakPhrase: string;
  suggestedPowerVerbs: string[];
  reason: string;
}

export interface ResumeImprovementResult {
  overallScore: number;
  grade: 'A+' | 'A' | 'B+' | 'B' | 'Needs Work';
  quantificationScore: number;
  actionVerbScore: number;
  brevityScore: number;
  summaryEvaluation: string;
  passiveAlerts: PassivePhraseAlert[];
  bulletImprovements: BulletImprovementResult[];
  strengths: string[];
  criticalImprovements: string[];
  polishedResumePreview?: string;
  providerUsed: 'gemini' | 'openai' | 'expert_heuristic';
  modelUsed?: string;
}

export async function improveResume(
  payload: ImproveResumeRequest,
  userId?: string,
): Promise<ResumeImprovementResult> {
  return httpClient.post<ResumeImprovementResult>('/ai/improve-resume', { userId, body: payload });
}
