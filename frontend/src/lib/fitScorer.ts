import type { CompanyProfile } from '../models';

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export type RoleLevel = 'intern' | 'junior' | 'mid' | 'senior' | 'staff' | 'principal';

export type WorkPreference = 'remote' | 'hybrid' | 'onsite' | 'any';

export type CompanySizePreference = 'startup' | 'mid' | 'large' | 'enterprise' | 'any';

export interface JobSeekerProfile {
  skills: string[];
  yearsOfExperience: number;
  targetRoleLevel: RoleLevel;
  desiredSalaryMin: number;
  desiredSalaryMax: number;
  workPreference: WorkPreference;
  companySizePreference: CompanySizePreference;
  preferredLocations: string[];
  industryInterests: string[];
  prioritizeWlb: boolean;
  prioritizeGrowth: boolean;
  prioritizeComp: boolean;
}

export type FitCategory = 'Dream' | 'Target' | 'Safe';

export interface CompanyEvaluation {
  company: CompanyProfile;
  fitScore: number;
  category: FitCategory;
  scoreBreakdown: {
    skillOverlap: number;
    salaryAlignment: number;
    workModelMatch: number;
    cultureFit: number;
    growthPotential: number;
    locationMatch: number;
  };
  matchInsights: string[];
  interviewTips: string;
}

export interface FitOptimizationResult {
  profile: JobSeekerProfile;
  selectedCompanies: CompanyEvaluation[];
  portfolioMetrics: {
    dreamCount: number;
    targetCount: number;
    safeCount: number;
    avgFitScore: number;
    avgSalary: number;
    avgInterviewDifficulty: number;
    atLeastOneOfferProbability: number;
  };
  strategyInsights: string[];
}

function calculateSkillOverlap(candidateSkills: string[], companyStack: string[]): number {
  if (candidateSkills.length === 0 || companyStack.length === 0) return 0;

  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9+#]/g, '');

  const aliases: Record<string, string[]> = {
    javascript: ['js', 'javascript', 'ecmascript'],
    typescript: ['ts', 'typescript'],
    python: ['python', 'py'],
    react: ['react', 'reactjs', 'reactnative'],
    nodejs: ['node', 'nodejs', 'node.js'],
    golang: ['go', 'golang'],
    cplusplus: ['c++', 'cpp', 'cplusplus'],
    csharp: ['c#', 'csharp'],
    kubernetes: ['k8s', 'kubernetes'],
    postgresql: ['postgres', 'postgresql', 'psql'],
    machinelearning: ['ml', 'machinelearning', 'ai', 'deeplearning'],
    aws: ['aws', 'amazonwebservices'],
    gcp: ['gcp', 'googlecloud', 'googlecloudplatform'],
    azure: ['azure', 'microsoftazure'],
    docker: ['docker', 'containers'],
    graphql: ['graphql', 'gql'],
    ruby: ['ruby', 'rubyonrails', 'rails'],
    rust: ['rust'],
    java: ['java'],
    scala: ['scala'],
    swift: ['swift'],
    kotlin: ['kotlin'],
  };

  const expandToAliases = (skill: string): string[] => {
    const norm = normalize(skill);
    for (const [, alts] of Object.entries(aliases)) {
      if (alts.includes(norm)) return alts;
    }
    return [norm];
  };

  const candidateExpanded = new Set(candidateSkills.flatMap(expandToAliases));

  const companyNormalized = companyStack.map(normalize);

  let matches = 0;
  for (const skill of companyNormalized) {
    const skillAliases = expandToAliases(skill);
    if (skillAliases.some((a) => candidateExpanded.has(a))) {
      matches++;
    }
  }

  return Math.min(1, matches / Math.max(companyNormalized.length * 0.6, 1));
}

export function evaluateCompanyFit(profile: JobSeekerProfile, company: CompanyProfile): CompanyEvaluation {
  const rawSkillMatch = calculateSkillOverlap(profile.skills, company.techStack);
  const skillOverlap = Math.round(rawSkillMatch * 30);

  let salaryAlignment = 0;
  if (profile.desiredSalaryMin > 0 && company.avgTotalComp > 0) {
    const salaryMid = (profile.desiredSalaryMin + profile.desiredSalaryMax) / 2;
    const ratio = company.avgTotalComp / salaryMid;
    if (ratio >= 1.2) salaryAlignment = 20;
    else if (ratio >= 1.0) salaryAlignment = 18;
    else if (ratio >= 0.85) salaryAlignment = 12;
    else if (ratio >= 0.7) salaryAlignment = 6;
    else salaryAlignment = 2;
  } else {
    salaryAlignment = 10;
  }

  let workModelMatch = 8;
  if (profile.workPreference !== 'any') {
    if (profile.workPreference === company.workModel) {
      workModelMatch = 15;
    } else if (
      (profile.workPreference === 'remote' && company.workModel === 'hybrid') ||
      (profile.workPreference === 'hybrid' && company.workModel === 'remote')
    ) {
      workModelMatch = 10;
    } else {
      workModelMatch = 3;
    }
  }

  let cultureFit = 8;
  const wlbScore = company.workLifeBalance / 5.0;
  const glassdoorScore = company.glassdoorRating / 5.0;

  if (profile.prioritizeWlb) {
    cultureFit = Math.round(wlbScore * 15);
  } else {
    cultureFit = Math.round(((wlbScore + glassdoorScore) / 2) * 15);
  }

  if (profile.companySizePreference !== 'any' && profile.companySizePreference === company.companySize) {
    cultureFit = Math.min(15, cultureFit + 3);
  }

  let growthPotential = Math.round((company.careerGrowth / 10) * 10);
  if (profile.prioritizeGrowth) {
    growthPotential = Math.min(10, growthPotential + 2);
  }

  const expYears = profile.yearsOfExperience;
  const roleLevelMap: Record<RoleLevel, number> = {
    intern: 0,
    junior: 1,
    mid: 3,
    senior: 5,
    staff: 8,
    principal: 12,
  };
  const expectedYears = roleLevelMap[profile.targetRoleLevel] || 3;

  if (company.interviewDifficulty >= 9 && (expYears < 3 || expYears < expectedYears)) {
    growthPotential = Math.max(0, growthPotential - 3);
  }

  let locationMatch = 7;
  if (profile.preferredLocations.length > 0) {
    const companyLoc = company.hqLocation.toLowerCase();
    const hasMatch = profile.preferredLocations.some((loc) => companyLoc.includes(loc.toLowerCase()));
    locationMatch = hasMatch ? 10 : company.workModel === 'remote' ? 8 : 3;
  }

  const rawScore = skillOverlap + salaryAlignment + workModelMatch + cultureFit + growthPotential + locationMatch;
  const fitScore = Math.min(100, Math.max(0, rawScore));

  let category: FitCategory = 'Target';
  if (fitScore >= 72) category = 'Safe';
  else if (fitScore < 45) category = 'Dream';

  const matchInsights: string[] = [];

  if (rawSkillMatch >= 0.6) {
    matchInsights.push(
      `🎯 Strong tech stack alignment — ${Math.round(rawSkillMatch * 100)}% overlap with ${company.shortName}'s stack`,
    );
  } else if (rawSkillMatch >= 0.3) {
    matchInsights.push(
      `📊 Partial stack match (${Math.round(rawSkillMatch * 100)}%). Consider upskilling: ${company.techStack
        .filter((t) => !profile.skills.some((s) => s.toLowerCase().includes(t.toLowerCase())))
        .slice(0, 3)
        .join(', ')}`,
    );
  } else {
    matchInsights.push(
      `⚠️ Low tech stack overlap (${Math.round(rawSkillMatch * 100)}%). Key gaps: ${company.techStack.slice(0, 3).join(', ')}`,
    );
  }

  if (salaryAlignment >= 18) {
    matchInsights.push(
      `💰 ${company.shortName} avg TC ($${company.avgTotalComp.toLocaleString()}) meets or exceeds your target range`,
    );
  } else if (salaryAlignment <= 6) {
    matchInsights.push(
      `💸 Salary gap: ${company.shortName} avg TC ($${company.avgTotalComp.toLocaleString()}) is below your range ($${profile.desiredSalaryMin.toLocaleString()}–$${profile.desiredSalaryMax.toLocaleString()})`,
    );
  }

  if (company.workModel === 'remote') {
    matchInsights.push(`🌍 ${company.shortName} offers remote work flexibility`);
  }

  if (company.workLifeBalance >= 4.2) {
    matchInsights.push(`⚖️ Excellent WLB rating (${company.workLifeBalance}/5.0)`);
  }

  if (company.interviewDifficulty >= 9) {
    matchInsights.push(
      `🔥 High interview bar (${company.interviewDifficulty}/10). Focus on: ${company.interviewFocus.join(', ')}`,
    );
  }

  const interviewTips = `Prep focus for ${company.shortName}: ${company.interviewFocus.join(', ')}. Typical ${company.interviewRounds} rounds. ${company.engineeringCulture}`;

  return {
    company,
    fitScore,
    category,
    scoreBreakdown: {
      skillOverlap,
      salaryAlignment,
      workModelMatch,
      cultureFit,
      growthPotential,
      locationMatch,
    },
    matchInsights,
    interviewTips,
  };
}

export function optimizeApplicationStrategy(
  profile: JobSeekerProfile,
  targetCount: number,
  candidatePool: CompanyProfile[],
): FitOptimizationResult {
  const evaluated = candidatePool.map((c) => evaluateCompanyFit(profile, c));

  const dreams = evaluated.filter((e) => e.category === 'Dream').sort((a, b) => b.fitScore - a.fitScore);
  const targets = evaluated.filter((e) => e.category === 'Target').sort((a, b) => b.fitScore - a.fitScore);
  const safes = evaluated.filter((e) => e.category === 'Safe').sort((a, b) => b.fitScore - a.fitScore);

  const desiredDreams = Math.max(1, Math.min(3, Math.floor(targetCount * 0.25)));
  const desiredSafes = Math.max(1, Math.min(3, Math.floor(targetCount * 0.3)));
  const desiredTargets = Math.max(2, targetCount - desiredDreams - desiredSafes);

  const selected: CompanyEvaluation[] = [];

  for (const s of safes) {
    if (selected.filter((x) => x.category === 'Safe').length >= desiredSafes) break;
    if (!selected.some((x) => x.company.id === s.company.id)) selected.push(s);
  }

  for (const t of targets) {
    if (selected.filter((x) => x.category === 'Target').length >= desiredTargets) break;
    if (!selected.some((x) => x.company.id === t.company.id)) selected.push(t);
  }

  for (const d of dreams) {
    if (selected.filter((x) => x.category === 'Dream').length >= desiredDreams) break;
    if (!selected.some((x) => x.company.id === d.company.id)) selected.push(d);
  }

  const remaining = [...targets, ...safes, ...dreams]
    .filter((c) => !selected.some((s) => s.company.id === c.company.id))
    .sort((a, b) => b.fitScore - a.fitScore);

  for (const r of remaining) {
    if (selected.length >= targetCount) break;
    selected.push(r);
  }

  selected.sort((a, b) => b.fitScore - a.fitScore);

  const dreamCount = selected.filter((s) => s.category === 'Dream').length;
  const targetCount2 = selected.filter((s) => s.category === 'Target').length;
  const safeCount = selected.filter((s) => s.category === 'Safe').length;

  const avgFitScore =
    selected.length > 0 ? Math.round(selected.reduce((sum, s) => sum + s.fitScore, 0) / selected.length) : 0;

  const avgSalary =
    selected.length > 0
      ? Math.round(selected.reduce((sum, s) => sum + s.company.avgTotalComp, 0) / selected.length)
      : 0;

  const avgInterviewDifficulty =
    selected.length > 0
      ? Math.round((selected.reduce((sum, s) => sum + s.company.interviewDifficulty, 0) / selected.length) * 10) /
        10
      : 0;

  const atLeastOneOfferProb =
    1 -
    selected.reduce((acc, s) => {
      const baseProbability = Math.max(
        0.05,
        Math.min(0.6, (s.fitScore / 100) * (1 - s.company.interviewDifficulty / 15)),
      );
      return acc * (1 - baseProbability);
    }, 1.0);

  const strategyInsights: string[] = [];

  if (safeCount >= 2) {
    strategyInsights.push(
      `🛡️ Solid safety net: ${safeCount} Safe companies with strong fit scores ensure baseline security.`,
    );
  } else {
    strategyInsights.push(`⚠️ Consider adding more Safe-tier companies to guarantee at least one strong offer.`);
  }

  if (avgFitScore >= 65) {
    strategyInsights.push(
      `⭐ Portfolio strength: Average fit score of ${avgFitScore}/100 indicates strong alignment with your profile.`,
    );
  }

  if (profile.skills.length >= 5) {
    strategyInsights.push(
      `🎯 Diverse skill set (${profile.skills.length} skills) gives you strong cross-company applicability.`,
    );
  } else {
    strategyInsights.push(
      `📚 Consider expanding your skill set. Companies value breadth in: TypeScript, Python, System Design, Cloud (AWS/GCP).`,
    );
  }

  const remoteCount = selected.filter((s) => s.company.workModel === 'remote').length;
  if (remoteCount >= 3) {
    strategyInsights.push(
      `🌍 ${remoteCount} of ${selected.length} companies offer remote work — great for location flexibility.`,
    );
  }

  if (profile.prioritizeComp) {
    strategyInsights.push(
      `💰 Compensation-optimized: Your portfolio's average total comp is $${avgSalary.toLocaleString()}.`,
    );
  }

  strategyInsights.push(
    `📊 Interview prep priority: Focus on ${[...new Set(selected.flatMap((s) => s.company.interviewFocus))].slice(0, 4).join(', ')}.`,
  );

  return {
    profile,
    selectedCompanies: selected,
    portfolioMetrics: {
      dreamCount,
      targetCount: targetCount2,
      safeCount,
      avgFitScore,
      avgSalary,
      avgInterviewDifficulty,
      atLeastOneOfferProbability: Math.round(atLeastOneOfferProb * 1000) / 10,
    },
    strategyInsights,
  };
}
