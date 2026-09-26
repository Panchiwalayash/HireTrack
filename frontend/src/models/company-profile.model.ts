import type { WorkModel } from './job.model';

export type CompanySize = 'startup' | 'mid' | 'large' | 'enterprise';
export type GrowthStage = 'early' | 'growth' | 'mature' | 'public';

export interface CompanyProfile {
  id: string;
  name: string;
  shortName: string;
  hqLocation: string;
  industry: string;
  companySize: CompanySize;
  growthStage: GrowthStage;
  employeeCount: string;
  avgBaseSalary: number;
  avgTotalComp: number;
  interviewDifficulty: number;
  interviewRounds: number;
  workModel: WorkModel;
  glassdoorRating: number;
  workLifeBalance: number;
  techStack: string[];
  engineeringCulture: string;
  interviewFocus: string[];
  careerGrowth: number;
  applicationUrl: string;
  notableBenefits: string;
}
