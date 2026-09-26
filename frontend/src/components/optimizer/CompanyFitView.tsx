import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Briefcase,
  Sliders,
  ChevronDown,
  ChevronUp,
  Search,
  Plus,
  Check,
  MapPin,
  Star,
} from 'lucide-react';
import {
  optimizeApplicationStrategy,
  type JobSeekerProfile,
  type RoleLevel,
  type WorkPreference,
  type CompanySizePreference,
  type CompanyEvaluation,
  type FitCategory,
} from '../../lib/fitScorer';
import type { Job, CompanyProfile, CustomCompanyFitResult } from '../../models';
import { loadCustomCompanies, saveCustomCompany } from '../../services/custom-company.service';
import { CustomCompanyModal } from './CustomCompanyModal';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';

const POPULAR_SKILLS = [
  'TypeScript',
  'React',
  'Python',
  'Go',
  'Java',
  'C++',
  'Kubernetes',
  'Docker',
  'AWS',
  'GCP',
  'PostgreSQL',
  'System Design',
  'Distributed Systems',
  'Machine Learning',
  'GraphQL',
  'Rust',
];

interface CompanyFitViewProps {
  jobs: Job[];
  onImportJobs: (
    jobs: Array<{
      company: string;
      role: string;
      location: string;
      work_model: string;
      salary_min?: number;
      salary_max?: number;
      application_deadline: string;
      job_url: string;
      notes: string;
    }>,
  ) => Promise<void>;
  onNavigateToJobs?: () => void;
}

const ELITE_DIFFICULTY_SCORE = 9;
const STANDARD_DIFFICULTY_SCORE = 7;

function toCompanyProfile(result: CustomCompanyFitResult): CompanyProfile {
  return {
    id: `custom-${result.companyName.toLowerCase().replace(/\s+/g, '-')}`,
    name: result.companyName,
    shortName: result.companyName,
    hqLocation: result.workModel === 'remote' ? 'Remote' : 'US / Hybrid',
    industry: result.industry || 'Technology',
    companySize: 'mid',
    growthStage: 'growth',
    employeeCount: '500+',
    avgBaseSalary: result.estimatedCompRange.min,
    avgTotalComp: result.estimatedCompRange.max,
    interviewDifficulty:
      result.interviewInsights.estimatedDifficulty === 'High-Bar Elite'
        ? ELITE_DIFFICULTY_SCORE
        : STANDARD_DIFFICULTY_SCORE,
    interviewRounds: result.interviewInsights.expectedRounds.length,
    workModel: result.workModel,
    glassdoorRating: 4.4,
    workLifeBalance: 4.0,
    techStack: [...result.matchedSkills, ...result.missingSkills.slice(0, 2)],
    engineeringCulture: 'High ownership, fast-paced technical environment',
    interviewFocus: result.interviewInsights.keyTechnicalTopics,
    careerGrowth: 8,
    applicationUrl: `https://www.google.com/search?q=${encodeURIComponent(result.companyName + ' careers')}`,
    notableBenefits: 'Competitive equity, health coverage & learning stipend',
  };
}

function toEvaluation(result: CustomCompanyFitResult): CompanyEvaluation {
  return {
    company: toCompanyProfile(result),
    fitScore: result.fitScore,
    category: result.category,
    scoreBreakdown: {
      skillOverlap: Math.round((result.scoreBreakdown.techStackMatch / 100) * 30),
      salaryAlignment: Math.round((result.scoreBreakdown.experienceMatch / 100) * 20),
      workModelMatch: Math.round((result.scoreBreakdown.roleScopeMatch / 100) * 15),
      cultureFit: Math.round((result.scoreBreakdown.cultureStageFit / 100) * 15),
      growthPotential: 9,
      locationMatch: 10,
    },
    matchInsights: [
      `AI Fit: ${result.fitScore}% · ${result.verdict}`,
      `Matched Skills: ${result.matchedSkills.join(', ')}`,
    ],
    interviewTips: `${result.verdict} Typical rounds: ${result.interviewInsights.expectedRounds.join(', ')}`,
  };
}

export const CompanyFitView: React.FC<CompanyFitViewProps> = ({ jobs, onImportJobs, onNavigateToJobs }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedSkills, setSelectedSkills] = useState<string[]>([
    'TypeScript',
    'React',
    'Python',
    'Go',
    'System Design',
  ]);
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState(3);
  const [targetRoleLevel, setTargetRoleLevel] = useState<RoleLevel>('mid');
  const [salaryMin, setSalaryMin] = useState<number>(140000);
  const [salaryMax, setSalaryMax] = useState<number>(200000);
  const [workPreference, setWorkPreference] = useState<WorkPreference>('hybrid');
  const [companySizePreference, setCompanySizePreference] = useState<CompanySizePreference>('any');
  const [prioritizeWlb, setPrioritizeWlb] = useState(false);
  const [prioritizeGrowth, setPrioritizeGrowth] = useState(true);
  const [prioritizeComp, setPrioritizeComp] = useState(true);

  const [targetCount, setTargetCount] = useState(8);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<'all' | FitCategory>('all');
  const [expandedCompanyId, setExpandedCompanyId] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);

  const profile: JobSeekerProfile = useMemo(
    () => ({
      skills: selectedSkills,
      yearsOfExperience,
      targetRoleLevel,
      desiredSalaryMin: salaryMin,
      desiredSalaryMax: salaryMax,
      workPreference,
      companySizePreference,
      preferredLocations: [],
      industryInterests: [],
      prioritizeWlb,
      prioritizeGrowth,
      prioritizeComp,
    }),
    [
      selectedSkills,
      yearsOfExperience,
      targetRoleLevel,
      salaryMin,
      salaryMax,
      workPreference,
      companySizePreference,
      prioritizeWlb,
      prioritizeGrowth,
      prioritizeComp,
    ],
  );

  const [pinnedCustomCompanies, setPinnedCustomCompanies] =
    useState<CustomCompanyFitResult[]>(loadCustomCompanies);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customCompanyQuery, setCustomCompanyQuery] = useState('');

  const candidatePool = useMemo(() => pinnedCustomCompanies.map(toCompanyProfile), [pinnedCustomCompanies]);

  const strategyResult = useMemo(() => {
    return optimizeApplicationStrategy(profile, targetCount, candidatePool);
  }, [profile, targetCount, candidatePool]);

  const allEvaluated = useMemo(() => {
    return pinnedCustomCompanies.map(toEvaluation).sort((a, b) => b.fitScore - a.fitScore);
  }, [pinnedCustomCompanies]);

  const filteredExploreList = useMemo(() => {
    return allEvaluated.filter((item) => {
      const matchesSearch =
        item.company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.company.techStack.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.company.industry.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat = selectedCategoryFilter === 'all' || item.category === selectedCategoryFilter;

      return matchesSearch && matchesCat;
    });
  }, [allEvaluated, searchQuery, selectedCategoryFilter]);

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleAddCustomSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customSkillInput.trim();
    if (trimmed && !selectedSkills.includes(trimmed)) {
      setSelectedSkills([...selectedSkills, trimmed]);
      setCustomSkillInput('');
    }
  };

  const handleImportRecommended = async () => {
    setIsImporting(true);
    try {
      const itemsToImport = strategyResult.selectedCompanies.map((item) => {
        const d = new Date();
        d.setDate(d.getDate() + 30);
        return {
          company: item.company.name,
          role: `${targetRoleLevel.charAt(0).toUpperCase() + targetRoleLevel.slice(1)} Software Engineer`,
          location: item.company.hqLocation,
          work_model: item.company.workModel,
          salary_min: item.company.avgBaseSalary,
          salary_max: item.company.avgTotalComp,
          application_deadline: d.toISOString(),
          job_url: item.company.applicationUrl,
          notes: `[Fit Score: ${item.fitScore}% · ${item.category}] Tech Stack: ${item.company.techStack.join(', ')}. Interview Tips: ${item.interviewTips}`,
        };
      });

      if (!user) {
        sessionStorage.setItem('pending_portfolio_import', JSON.stringify(itemsToImport));
        navigate('/login?redirect=/jobs');
        return;
      }

      await onImportJobs(itemsToImport);

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366F1', '#10B981', '#06B6D4'],
      });

      setImportSuccess(true);
      setTimeout(() => setImportSuccess(false), 3500);
    } catch (err) {
      console.error('Import failed:', err);
    } finally {
      setIsImporting(false);
    }
  };

  const handleImportSingle = async (item: CompanyEvaluation) => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    const singleItem = {
      company: item.company.name,
      role: `${targetRoleLevel.charAt(0).toUpperCase() + targetRoleLevel.slice(1)} Software Engineer`,
      location: item.company.hqLocation,
      work_model: item.company.workModel,
      salary_min: item.company.avgBaseSalary,
      salary_max: item.company.avgTotalComp,
      application_deadline: d.toISOString(),
      job_url: item.company.applicationUrl,
      notes: `[Fit Score: ${item.fitScore}% · ${item.category}] Tech Stack: ${item.company.techStack.join(', ')}. ${item.interviewTips}`,
    };

    if (!user) {
      sessionStorage.setItem('pending_portfolio_import', JSON.stringify([singleItem]));
      navigate('/login?redirect=/jobs');
      return;
    }

    await onImportJobs([singleItem]);
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
  };

  const getCategoryBadgeClass = (category: FitCategory) => {
    switch (category) {
      case 'Dream':
        return 'badge--warning';
      case 'Target':
        return 'badge--info';
      case 'Safe':
        return 'badge--success';
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '80px' }}>
      {/* Free Public Access Callout for Unauthenticated Guests */}
      {!user && (
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(6, 182, 212, 0.12) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: '16px',
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #6366F1, #06B6D4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                flexShrink: 0,
              }}
            >
              <Sparkles size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                Free AI Career Scorer Active — No Sign In Required!
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                You can freely inspect career sites, calibrate candidate fit, and explore 50+ tech leaders. Sign up whenever you're ready to track live rounds!
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn--secondary btn--sm" onClick={() => navigate('/login')}>
              Sign In
            </button>
            <button className="btn btn--primary btn--sm" onClick={() => navigate('/register')}>
              Create Free Account
            </button>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="section-title-bar" style={{ marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span
              className="badge"
              style={{
                background: 'rgba(99, 102, 241, 0.15)',
                color: '#818CF8',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              AI Scoring Engine
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              AI-Evaluated · Your Company List
            </span>
          </div>
          <h2>AI Company Fit & Application Strategy Scorer</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Algorithmic portfolio optimizer: add any company, then match your engineering skills, comp targets, and
            work style against it to maximize your offer probability.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            className="btn btn--primary btn--sm"
            onClick={() => {
              setCustomCompanyQuery('');
              setIsCustomModalOpen(true);
            }}
            style={{
              background: 'linear-gradient(135deg, #6366F1 0%, #06B6D4 100%)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 600,
              boxShadow: '0 2px 10px rgba(99, 102, 241, 0.25)',
            }}
          >
            <Sparkles size={14} />
            <span>+ Evaluate Any Company with AI</span>
          </button>

          {jobs.length > 0 && onNavigateToJobs && (
            <button className="btn btn--secondary btn--sm" onClick={onNavigateToJobs}>
              <Briefcase size={14} />
              <span>Tracked Apps ({jobs.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Left Column Profile Controls, Right Column Portfolio & Results */}
      <div className="company-fit-grid">
        {/* Left Column: Candidate Profile Form */}
        <div className="company-fit-sidebar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <Sliders size={18} color="#06B6D4" />
            <h3 style={{ margin: 0, fontSize: '1.05rem' }}>Your Candidate Profile</h3>
          </div>

          {/* Skill Selector Chips */}
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>
              Technical Skills ({selectedSkills.length} selected)
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
              {POPULAR_SKILLS.map((skill) => {
                const isSelected = selectedSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '16px',
                      fontSize: '0.74rem',
                      fontWeight: isSelected ? 600 : 500,
                      border: isSelected ? '1px solid #6366F1' : '1px solid var(--border-subtle)',
                      background: isSelected ? 'rgba(99, 102, 241, 0.2)' : 'var(--bg-input)',
                      color: isSelected ? '#A5B4FC' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {isSelected && '✓ '}
                    {skill}
                  </button>
                );
              })}
            </div>

            {/* Custom Skill Input */}
            <form onSubmit={handleAddCustomSkill} style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
              <input
                type="text"
                className="input"
                style={{ fontSize: '0.78rem', padding: '6px 10px' }}
                placeholder="+ Add other skill..."
                value={customSkillInput}
                onChange={(e) => setCustomSkillInput(e.target.value)}
              />
              <button type="submit" className="btn btn--secondary btn--sm" style={{ padding: '0 10px' }}>
                Add
              </button>
            </form>
          </div>

          {/* Experience & Level */}
          <div className="form-grid-2col">
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 600 }}>Target Level</label>
              <select
                className="select"
                style={{ fontSize: '0.82rem', padding: '6px 10px' }}
                value={targetRoleLevel}
                onChange={(e) => setTargetRoleLevel(e.target.value as RoleLevel)}
              >
                <option value="intern">Intern</option>
                <option value="junior">Junior (0-2y)</option>
                <option value="mid">Mid-Level (2-5y)</option>
                <option value="senior">Senior (5-8y)</option>
                <option value="staff">Staff (8y+)</option>
                <option value="principal">Principal (12y+)</option>
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 600 }}>Years Exp: {yearsOfExperience}y</label>
              <input
                type="range"
                min={0}
                max={15}
                value={yearsOfExperience}
                onChange={(e) => setYearsOfExperience(Number(e.target.value))}
                style={{ width: '100%', marginTop: '8px', accentColor: '#6366F1' }}
              />
            </div>
          </div>

          {/* Salary Expectations */}
          <div className="form-grid-2col">
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 600 }}>Target Base ($k)</label>
              <input
                type="number"
                className="input"
                style={{ fontSize: '0.82rem', padding: '6px 10px' }}
                value={salaryMin / 1000}
                onChange={(e) => setSalaryMin(Number(e.target.value) * 1000)}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 600 }}>Target TC ($k)</label>
              <input
                type="number"
                className="input"
                style={{ fontSize: '0.82rem', padding: '6px 10px' }}
                value={salaryMax / 1000}
                onChange={(e) => setSalaryMax(Number(e.target.value) * 1000)}
              />
            </div>
          </div>

          {/* Work Model & Company Size */}
          <div className="form-grid-2col">
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 600 }}>Work Model</label>
              <select
                className="select"
                style={{ fontSize: '0.82rem', padding: '6px 10px' }}
                value={workPreference}
                onChange={(e) => setWorkPreference(e.target.value as WorkPreference)}
              >
                <option value="any">Any Model</option>
                <option value="remote">Remote Preferred</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">Onsite</option>
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 600 }}>Org Size</label>
              <select
                className="select"
                style={{ fontSize: '0.82rem', padding: '6px 10px' }}
                value={companySizePreference}
                onChange={(e) => setCompanySizePreference(e.target.value as CompanySizePreference)}
              >
                <option value="any">Any Size</option>
                <option value="startup">Startup (&lt;100)</option>
                <option value="mid">Mid-Size (100-1k)</option>
                <option value="large">Large (1k-10k)</option>
                <option value="enterprise">Enterprise (10k+)</option>
              </select>
            </div>
          </div>

          {/* Priority Weights */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px', marginBottom: '16px' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
              Strategy Focus Priorities
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.78rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={prioritizeComp}
                  onChange={(e) => setPrioritizeComp(e.target.checked)}
                  style={{ accentColor: '#10B981' }}
                />
                <span>💰 Prioritize Top Compensation (Base + Equity)</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={prioritizeWlb}
                  onChange={(e) => setPrioritizeWlb(e.target.checked)}
                  style={{ accentColor: '#06B6D4' }}
                />
                <span>🧘 Prioritize Work-Life Balance (Glassdoor 4.0+)</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={prioritizeGrowth}
                  onChange={(e) => setPrioritizeGrowth(e.target.checked)}
                  style={{ accentColor: '#818CF8' }}
                />
                <span>🚀 Prioritize Fast Career Growth</span>
              </label>
            </div>
          </div>

          {/* Portfolio Target Count */}
          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 600 }}>
              Optimized Portfolio Size: {targetCount} Companies
            </label>
            <input
              type="range"
              min={4}
              max={15}
              value={targetCount}
              onChange={(e) => setTargetCount(Number(e.target.value))}
              style={{ width: '100%', marginTop: '6px', accentColor: '#06B6D4' }}
            />
          </div>
        </div>

        {/* Right Column: Strategy Dashboard & Company Breakdown */}
        <div>
          {/* Portfolio Analytics Card */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(6, 182, 212, 0.08) 100%)',
              border: '1px solid var(--border-medium)',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '24px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '16px',
                marginBottom: '20px',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <Sparkles size={18} color="#818CF8" />
                  <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Recommended Application Portfolio</h3>
                </div>
                <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                  Mathematically balanced portfolio with calibrated safety margin and target distribution
                </p>
              </div>

              <button
                className="btn btn--primary"
                onClick={handleImportRecommended}
                disabled={isImporting}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                {importSuccess ? (
                  <>
                    <Check size={16} />
                    <span>Imported to Applications!</span>
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    <span>
                      {isImporting
                        ? 'Importing...'
                        : `Import All ${strategyResult.selectedCompanies.length} to Pipeline`}
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* Metrics Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '14px',
                marginBottom: '20px',
              }}
            >
              <div
                style={{
                  background: 'var(--bg-card-solid)',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Avg Total Comp</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#10B981', marginTop: '2px' }}>
                  ${(strategyResult.portfolioMetrics.avgSalary / 1000).toFixed(0)}k
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>USD / Year</div>
              </div>

              <div
                style={{
                  background: 'var(--bg-card-solid)',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Avg Match Score</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#06B6D4', marginTop: '2px' }}>
                  {strategyResult.portfolioMetrics.avgFitScore}%
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Algorithm Fit</div>
              </div>

              <div
                style={{
                  background: 'var(--bg-card-solid)',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Offer Likelihood</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#818CF8', marginTop: '2px' }}>
                  {strategyResult.portfolioMetrics.atLeastOneOfferProbability}%
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>&ge;1 Offer Prob</div>
              </div>

              <div
                style={{
                  background: 'var(--bg-card-solid)',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Distribution</div>
                <div
                  style={{
                    display: 'flex',
                    gap: '6px',
                    alignItems: 'center',
                    marginTop: '4px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                  }}
                >
                  <span style={{ color: '#F59E0B' }}>{strategyResult.portfolioMetrics.dreamCount}D</span>
                  <span>·</span>
                  <span style={{ color: '#06B6D4' }}>{strategyResult.portfolioMetrics.targetCount}T</span>
                  <span>·</span>
                  <span style={{ color: '#10B981' }}>{strategyResult.portfolioMetrics.safeCount}S</span>
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Dream/Target/Safe</div>
              </div>
            </div>

            {/* Strategic Insights */}
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', borderRadius: '10px', padding: '12px 16px' }}>
              <div
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  marginBottom: '8px',
                }}
              >
                Strategic Portfolio Insights:
              </div>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: '18px',
                  fontSize: '0.78rem',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.6',
                }}
              >
                {strategyResult.strategyInsights.map((insight, idx) => (
                  <li key={idx}>{insight}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Curated List & Explore Section */}
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Ranked Company Fits</h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Showing {filteredExploreList.length} companies matched against your tech profile
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {/* Category filter tabs */}
                <div
                  style={{ display: 'flex', background: 'var(--bg-input)', borderRadius: '8px', padding: '3px' }}
                >
                  {(['all', 'Dream', 'Target', 'Safe'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategoryFilter(cat)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.74rem',
                        fontWeight: selectedCategoryFilter === cat ? 600 : 400,
                        background: selectedCategoryFilter === cat ? 'var(--bg-card-solid)' : 'transparent',
                        color: selectedCategoryFilter === cat ? 'var(--text-primary)' : 'var(--text-muted)',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {cat === 'all' ? 'All' : cat}
                    </button>
                  ))}
                </div>

                <div style={{ position: 'relative', width: '180px' }}>
                  <input
                    type="text"
                    className="input"
                    style={{ fontSize: '0.78rem', padding: '6px 8px 6px 28px' }}
                    placeholder="Search company..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search
                    size={12}
                    style={{
                      position: 'absolute',
                      left: '9px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Company Cards Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {filteredExploreList.length === 0 && (
                <div
                  style={{
                    padding: '36px 24px',
                    background:
                      'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(6, 182, 212, 0.06) 100%)',
                    border: '1px dashed rgba(99, 102, 241, 0.4)',
                    borderRadius: '16px',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '14px',
                      background: 'rgba(99, 102, 241, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 12px',
                    }}
                  >
                    <Sparkles size={24} color="#818CF8" />
                  </div>
                  <h4 style={{ margin: '0 0 6px', fontSize: '1.15rem', fontWeight: 700 }}>
                    {searchQuery
                      ? `You haven't added "${searchQuery}" yet`
                      : allEvaluated.length === 0
                        ? 'Add your first company to get started'
                        : 'No companies match the selected filter'}
                  </h4>
                  <p
                    style={{
                      margin: '0 0 18px',
                      fontSize: '0.86rem',
                      color: 'var(--text-secondary)',
                      maxWidth: '540px',
                      marginInline: 'auto',
                    }}
                  >
                    Use our Deep AI Evaluator to inspect their live career website, extract engineering
                    requirements, and run a full candidate fit analysis.
                  </p>
                  <button
                    type="button"
                    className="btn btn--primary"
                    onClick={() => {
                      setCustomCompanyQuery(searchQuery);
                      setIsCustomModalOpen(true);
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #6366F1 0%, #06B6D4 100%)',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 20px',
                    }}
                  >
                    <Sparkles size={16} />
                    <span>Evaluate {searchQuery ? `"${searchQuery}"` : 'New Company'} with AI</span>
                  </button>
                </div>
              )}

              {filteredExploreList.map((item) => {
                const isExpanded = expandedCompanyId === item.company.id;
                const isAlreadyTracked = jobs.some(
                  (j) => j.company.toLowerCase() === item.company.name.toLowerCase(),
                );
                const isCustom = item.company.id.startsWith('custom-');

                return (
                  <div
                    key={item.company.id}
                    style={{
                      background: 'var(--bg-card-solid)',
                      border: isCustom ? '1px solid rgba(99, 102, 241, 0.5)' : '1px solid var(--border-medium)',
                      borderRadius: '12px',
                      padding: '16px 20px',
                      transition: 'all 0.2s ease',
                      boxShadow: isCustom ? '0 4px 20px rgba(99, 102, 241, 0.15)' : 'none',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        flexWrap: 'wrap',
                        gap: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                        {/* Score Circle */}
                        <div
                          style={{
                            width: '52px',
                            height: '52px',
                            borderRadius: '12px',
                            background:
                              item.fitScore >= 80
                                ? 'rgba(16, 185, 129, 0.15)'
                                : item.fitScore >= 65
                                  ? 'rgba(6, 182, 212, 0.15)'
                                  : 'rgba(99, 102, 241, 0.15)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: `1px solid ${
                              item.fitScore >= 80 ? '#10B981' : item.fitScore >= 65 ? '#06B6D4' : '#6366F1'
                            }`,
                          }}
                        >
                          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                            {item.fitScore}%
                          </span>
                          <span
                            style={{ fontSize: '0.58rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}
                          >
                            Match
                          </span>
                        </div>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                              {item.company.name}
                            </h4>
                            {isCustom && (
                              <span
                                className="badge"
                                style={{
                                  background: 'rgba(99, 102, 241, 0.25)',
                                  color: '#A5B4FC',
                                  border: '1px solid rgba(99, 102, 241, 0.45)',
                                  fontSize: '0.68rem',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontWeight: 700,
                                }}
                              >
                                <Sparkles size={11} color="#818CF8" />
                                AI Custom
                              </span>
                            )}
                            <span className={`badge ${getCategoryBadgeClass(item.category)}`}>
                              {item.category}
                            </span>
                            <span
                              className="badge"
                              style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-muted)' }}
                            >
                              {item.company.workModel}
                            </span>
                          </div>

                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              fontSize: '0.78rem',
                              color: 'var(--text-muted)',
                              marginTop: '4px',
                              flexWrap: 'wrap',
                            }}
                          >
                            <span>{item.company.industry}</span>
                            <span>·</span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                              <MapPin size={11} /> {item.company.hqLocation}
                            </span>
                            <span>·</span>
                            <span style={{ color: '#10B981', fontWeight: 600 }}>
                              ~${(item.company.avgTotalComp / 1000).toFixed(0)}k TC
                            </span>
                            <span>·</span>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                color: '#F59E0B',
                              }}
                            >
                              <Star size={11} fill="#F59E0B" /> {item.company.glassdoorRating}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          className="btn btn--ghost btn--sm"
                          onClick={() => setExpandedCompanyId(isExpanded ? null : item.company.id)}
                          style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}
                        >
                          <span>{isExpanded ? 'Less' : 'Details'}</span>
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>

                        <button
                          className={`btn btn--sm ${isAlreadyTracked ? 'btn--secondary' : 'btn--primary'}`}
                          onClick={() => handleImportSingle(item)}
                          disabled={isAlreadyTracked}
                          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          {isAlreadyTracked ? (
                            <>
                              <Check size={13} color="#10B981" />
                              <span>Tracked</span>
                            </>
                          ) : (
                            <>
                              <Plus size={13} />
                              <span>Track App</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Matched Tech Stack Tags */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}>
                      {item.company.techStack.map((tech) => {
                        const isMatched = selectedSkills.some((s) => s.toLowerCase() === tech.toLowerCase());
                        return (
                          <span
                            key={tech}
                            style={{
                              fontSize: '0.7rem',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontWeight: isMatched ? 600 : 400,
                              background: isMatched ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-input)',
                              color: isMatched ? '#6EE7B7' : 'var(--text-muted)',
                              border: isMatched
                                ? '1px solid rgba(16, 185, 129, 0.25)'
                                : '1px solid var(--border-subtle)',
                            }}
                          >
                            {isMatched && '✓ '}
                            {tech}
                          </span>
                        );
                      })}
                    </div>

                    {/* Expandable Deep Dive Details */}
                    {isExpanded && (
                      <div
                        style={{
                          marginTop: '14px',
                          paddingTop: '14px',
                          borderTop: '1px solid var(--border-subtle)',
                          fontSize: '0.8rem',
                        }}
                      >
                        {/* Score breakdown bars */}
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                            gap: '10px',
                            marginBottom: '14px',
                          }}
                        >
                          <div>
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: '0.72rem',
                                color: 'var(--text-muted)',
                              }}
                            >
                              <span>Skills Overlap</span>
                              <span>{item.scoreBreakdown.skillOverlap}/30 pts</span>
                            </div>
                            <div className="progress-bar-container" style={{ height: '4px', marginTop: '3px' }}>
                              <div
                                className="progress-bar-fill"
                                style={{
                                  width: `${(item.scoreBreakdown.skillOverlap / 30) * 100}%`,
                                  background: '#6366F1',
                                }}
                              />
                            </div>
                          </div>

                          <div>
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: '0.72rem',
                                color: 'var(--text-muted)',
                              }}
                            >
                              <span>Salary Alignment</span>
                              <span>{item.scoreBreakdown.salaryAlignment}/20 pts</span>
                            </div>
                            <div className="progress-bar-container" style={{ height: '4px', marginTop: '3px' }}>
                              <div
                                className="progress-bar-fill"
                                style={{
                                  width: `${(item.scoreBreakdown.salaryAlignment / 20) * 100}%`,
                                  background: '#10B981',
                                }}
                              />
                            </div>
                          </div>

                          <div>
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: '0.72rem',
                                color: 'var(--text-muted)',
                              }}
                            >
                              <span>Culture & WLB</span>
                              <span>{item.scoreBreakdown.cultureFit}/15 pts</span>
                            </div>
                            <div className="progress-bar-container" style={{ height: '4px', marginTop: '3px' }}>
                              <div
                                className="progress-bar-fill"
                                style={{
                                  width: `${(item.scoreBreakdown.cultureFit / 15) * 100}%`,
                                  background: '#06B6D4',
                                }}
                              />
                            </div>
                          </div>

                          <div>
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: '0.72rem',
                                color: 'var(--text-muted)',
                              }}
                            >
                              <span>Growth Potential</span>
                              <span>{item.scoreBreakdown.growthPotential}/10 pts</span>
                            </div>
                            <div className="progress-bar-container" style={{ height: '4px', marginTop: '3px' }}>
                              <div
                                className="progress-bar-fill"
                                style={{
                                  width: `${(item.scoreBreakdown.growthPotential / 10) * 100}%`,
                                  background: '#818CF8',
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Interview insights & Culture */}
                        <div style={{ background: 'var(--bg-input)', padding: '12px 14px', borderRadius: '8px' }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                            🎯 Interview & Culture Breakdown:
                          </div>
                          <div style={{ color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                            {item.interviewTips}
                          </div>
                          <div style={{ color: 'var(--text-muted)', marginTop: '6px', fontSize: '0.75rem' }}>
                            <strong>Interview Focus:</strong> {item.company.interviewFocus.join(', ')} ·{' '}
                            <strong>Difficulty:</strong> {item.company.interviewDifficulty}/10 ·{' '}
                            <strong>Typical Rounds:</strong> {item.company.interviewRounds} ·{' '}
                            <strong>Benefits:</strong> {item.company.notableBenefits}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Company AI Evaluator Modal */}
      <CustomCompanyModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        initialCompanyName={customCompanyQuery}
        defaultProfile={{
          skills: selectedSkills,
          yearsOfExperience,
          targetRoleLevel,
          desiredSalaryMin: salaryMin,
          desiredSalaryMax: salaryMax,
          workPreference,
          educationOrBackground: 'BS/MS in Computer Science or Equivalent',
          keyProjectsOrAchievements:
            'Engineered production APIs, cloud infrastructure, and scalable distributed applications.',
        }}
        onAddToPipeline={async (jobData) => {
          await onImportJobs([jobData]);
        }}
        onPinToExplore={(customRes) => {
          setPinnedCustomCompanies((prev) => saveCustomCompany(prev, customRes));
        }}
      />
    </div>
  );
};
