import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Globe,
  Briefcase,
  Layers,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Plus,
  Award,
} from 'lucide-react';
import { assessCompanyFit } from '../../services/ai.service';
import type { CandidateProfileContext, CustomCompanyFitResult } from '../../models';
import confetti from 'canvas-confetti';

interface CustomCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProfile: CandidateProfileContext;
  initialCompanyName?: string;
  onAddToPipeline: (job: {
    company: string;
    role: string;
    location: string;
    work_model: string;
    salary_min?: number;
    salary_max?: number;
    application_deadline: string;
    job_url: string;
    notes: string;
  }) => Promise<void>;
  onPinToExplore?: (result: CustomCompanyFitResult) => void;
}

export const CustomCompanyModal: React.FC<CustomCompanyModalProps> = ({
  isOpen,
  onClose,
  defaultProfile,
  initialCompanyName = '',
  onAddToPipeline,
  onPinToExplore,
}) => {
  const [companyName, setCompanyName] = useState(initialCompanyName);
  const [careerUrl, setCareerUrl] = useState('');
  const [targetRole, setTargetRole] = useState('Full-Stack Software Engineer');
  const [jobDescription, setJobDescription] = useState('');
  const [industry, setIndustry] = useState('Technology & Software');
  const [companyStage, setCompanyStage] = useState('Growth Stage (Series B/C)');
  const [workModel, setWorkModel] = useState<'remote' | 'hybrid' | 'onsite'>('hybrid');

  const [profileSkills, setProfileSkills] = useState<string[]>(defaultProfile.skills || []);
  const [skillInput, setSkillInput] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState(defaultProfile.yearsOfExperience || 3);
  const [targetRoleLevel, setTargetRoleLevel] = useState(defaultProfile.targetRoleLevel || 'mid');
  const [desiredSalaryMin, setDesiredSalaryMin] = useState(defaultProfile.desiredSalaryMin || 140000);
  const [desiredSalaryMax, setDesiredSalaryMax] = useState(defaultProfile.desiredSalaryMax || 200000);
  const [educationBackground, setEducationBackground] = useState(
    defaultProfile.educationOrBackground || 'BS/MS in Computer Science or Equivalent',
  );
  const [keyAchievements, setKeyAchievements] = useState(
    defaultProfile.keyProjectsOrAchievements ||
      'Built scalable APIs, distributed systems, and modern web applications.',
  );
  const [isProfileExpanded, setIsProfileExpanded] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [result, setResult] = useState<CustomCompanyFitResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [isAddingJob, setIsAddingJob] = useState(false);
  const [addJobSuccess, setAddJobSuccess] = useState(false);

  if (!isOpen) return null;

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = skillInput.trim();
    if (trimmed && !profileSkills.includes(trimmed)) {
      setProfileSkills([...profileSkills, trimmed]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setProfileSkills(profileSkills.filter((s) => s !== skillToRemove));
  };

  const handleCopyText = (text: string, sectionKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionKey);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      setError('Please provide a company name.');
      return;
    }

    setError(null);
    setIsLoading(true);
    setResult(null);

    setLoadingStep('Connecting to company career portal & scraping context...');
    const stepTimer1 = setTimeout(() => {
      setLoadingStep('Extracting core engineering stack & qualification requirements...');
    }, 1200);

    const stepTimer2 = setTimeout(() => {
      setLoadingStep('AI synthesizing technical match & interview playbook...');
    }, 2800);

    try {
      const response = await assessCompanyFit({
        companyName: companyName.trim(),
        companyWebsite: careerUrl.trim(),
        careerUrl: careerUrl.trim(),
        targetRole: targetRole.trim(),
        jobDescription: jobDescription.trim(),
        industry,
        companyStage,
        workModel,
        profile: {
          skills: profileSkills,
          yearsOfExperience,
          targetRoleLevel,
          desiredSalaryMin,
          desiredSalaryMax,
          workPreference: workModel,
          educationOrBackground: educationBackground,
          keyProjectsOrAchievements: keyAchievements,
        },
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setResult(response);

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#6366F1', '#10B981', '#06B6D4'],
      });
    } catch (err: any) {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      console.error('Fit assessment error:', err);
      setError(err.message || 'Failed to complete AI fit assessment. Please verify your connection.');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const handleAddToPipelineClick = async () => {
    if (!result) return;
    setIsAddingJob(true);
    try {
      const d = new Date();
      d.setDate(d.getDate() + 21);

      const formattedNotes = `[AI Fit Score: ${result.fitScore}% · ${result.category} Tier]
Verdict: ${result.verdict}
Matched Skills: ${result.matchedSkills.join(', ')}
Missing Skills: ${result.missingSkills.join(', ')}
Interview Rounds: ${result.interviewInsights.expectedRounds.join(' | ')}`;

      await onAddToPipeline({
        company: result.companyName,
        role: result.targetRole,
        location: result.workModel === 'remote' ? 'Remote' : 'Headquarters / Hybrid',
        work_model: result.workModel,
        salary_min: result.estimatedCompRange.min,
        salary_max: result.estimatedCompRange.max,
        application_deadline: d.toISOString(),
        job_url:
          careerUrl ||
          `https://www.google.com/search?q=${encodeURIComponent(result.companyName + ' ' + result.targetRole + ' careers')}`,
        notes: formattedNotes,
      });

      if (onPinToExplore) {
        onPinToExplore(result);
      }

      setAddJobSuccess(true);
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.7 } });
      setTimeout(() => {
        setAddJobSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Failed to add job to pipeline:', err);
    } finally {
      setIsAddingJob(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return '#10B981';
    if (score >= 70) return '#06B6D4';
    return '#F59E0B';
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(5, 7, 15, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          background: 'var(--bg-card-solid, #131722)',
          border: '1px solid var(--border-medium, rgba(255, 255, 255, 0.12))',
          borderRadius: '20px',
          width: '100%',
          maxWidth: result ? '920px' : '720px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px rgba(99, 102, 241, 0.15)',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(90deg, rgba(99, 102, 241, 0.1) 0%, rgba(6, 182, 212, 0.05) 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #6366F1 0%, #06B6D4 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
              }}
            >
              <Sparkles size={20} color="#fff" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>
                Deep AI Company Fit & Career Site Evaluator
              </h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Live career website inspection · Gemini 3.6 Flash deep calibration
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn btn--icon"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {error && (
            <div
              style={{
                padding: '12px 16px',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '10px',
                color: '#F87171',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '20px',
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {!result ? (
            /* Input Form View */
            <form onSubmit={handleEvaluate}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label
                    style={{
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Briefcase size={14} color="#818CF8" />
                    Target Company Name *
                  </label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. Ramp, OpenAI, Vercel, Datadog..."
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                    style={{ fontSize: '0.88rem', marginTop: '6px' }}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label
                    style={{
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Globe size={14} color="#06B6D4" />
                    Company Website / Careers URL
                  </label>
                  <input
                    type="text"
                    className="input"
                    placeholder="https://ramp.com/careers or company website"
                    value={careerUrl}
                    onChange={(e) => setCareerUrl(e.target.value)}
                    style={{ fontSize: '0.88rem', marginTop: '6px' }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.5fr 1fr 1fr 1fr',
                  gap: '12px',
                  marginBottom: '16px',
                }}
              >
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Target Role Title *</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. Senior Full-Stack Engineer"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    required
                    style={{ fontSize: '0.88rem', marginTop: '6px' }}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Industry</label>
                  <select
                    className="select"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    style={{ fontSize: '0.82rem', marginTop: '6px' }}
                  >
                    <option value="Technology & Software">Tech & Software</option>
                    <option value="Fintech & Payments">Fintech & Payments</option>
                    <option value="Artificial Intelligence / ML">AI / Foundation Models</option>
                    <option value="Cloud Infrastructure & DevOps">Cloud & Infra</option>
                    <option value="E-Commerce & Marketplaces">E-Commerce</option>
                    <option value="Healthcare & Biotech">HealthTech</option>
                    <option value="Cybersecurity">Cybersecurity</option>
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Company Stage</label>
                  <select
                    className="select"
                    value={companyStage}
                    onChange={(e) => setCompanyStage(e.target.value)}
                    style={{ fontSize: '0.82rem', marginTop: '6px' }}
                  >
                    <option value="Early Startup (Seed-A)">Early Startup (Seed-A)</option>
                    <option value="Growth Stage (Series B/C)">Growth (Series B/C)</option>
                    <option value="Late Stage / Pre-IPO">Pre-IPO / Late</option>
                    <option value="Public Tech / Enterprise">Public / Big Tech</option>
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Work Model</label>
                  <select
                    className="select"
                    value={workModel}
                    onChange={(e) => setWorkModel(e.target.value as any)}
                    style={{ fontSize: '0.82rem', marginTop: '6px' }}
                  >
                    <option value="hybrid">Hybrid</option>
                    <option value="remote">Remote</option>
                    <option value="onsite">Onsite</option>
                  </select>
                </div>
              </div>

              {/* Job Description Textarea */}
              <div className="form-group" style={{ marginBottom: '18px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '6px',
                  }}
                >
                  <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                    Paste Job Description / Requirements (Optional, Highly Recommended)
                  </label>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Paste from LinkedIn, Greenhouse, Lever, or career site
                  </span>
                </div>
                <textarea
                  className="input"
                  rows={4}
                  placeholder="Paste responsibilities, qualifications, and tech stack requirements here. Our AI will contrast every bullet against your background..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  style={{
                    fontSize: '0.82rem',
                    fontFamily: 'inherit',
                    lineHeight: '1.5',
                    resize: 'vertical',
                  }}
                />
              </div>

              {/* Candidate Profile Context Accordion */}
              <div
                style={{
                  border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  overflow: 'hidden',
                  marginBottom: '20px',
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsProfileExpanded(!isProfileExpanded)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Layers size={16} color="#818CF8" />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                      Candidate Profile Benchmarking Context ({profileSkills.length} skills · {yearsOfExperience}y
                      exp)
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.78rem',
                      color: '#818CF8',
                    }}
                  >
                    <span>{isProfileExpanded ? 'Hide Details' : 'Review & Customize'}</span>
                    {isProfileExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>

                {isProfileExpanded && (
                  <div
                    style={{
                      padding: '16px',
                      borderTop: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.06))',
                    }}
                  >
                    {/* Skills Chips */}
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        Active Technical Skills:
                      </label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                        {profileSkills.map((skill) => (
                          <span
                            key={skill}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '3px 8px',
                              borderRadius: '12px',
                              fontSize: '0.72rem',
                              background: 'rgba(99, 102, 241, 0.15)',
                              color: '#A5B4FC',
                              border: '1px solid rgba(99, 102, 241, 0.3)',
                            }}
                          >
                            {skill}
                            <button
                              type="button"
                              onClick={() => handleRemoveSkill(skill)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-muted)',
                                cursor: 'pointer',
                                padding: 0,
                                fontSize: '0.72rem',
                              }}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>

                      <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                        <input
                          type="text"
                          className="input"
                          style={{ fontSize: '0.76rem', padding: '4px 8px' }}
                          placeholder="+ Add another skill..."
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddSkill(e);
                            }
                          }}
                        />
                        <button type="button" onClick={handleAddSkill} className="btn btn--secondary btn--sm">
                          Add
                        </button>
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr',
                        gap: '12px',
                        marginBottom: '12px',
                      }}
                    >
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                          Years Exp: {yearsOfExperience}y
                        </label>
                        <input
                          type="range"
                          min={0}
                          max={15}
                          value={yearsOfExperience}
                          onChange={(e) => setYearsOfExperience(Number(e.target.value))}
                          style={{ width: '100%', marginTop: '6px', accentColor: '#6366F1' }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Candidate Level</label>
                        <select
                          className="select"
                          style={{ fontSize: '0.78rem', padding: '4px 8px', marginTop: '4px' }}
                          value={targetRoleLevel}
                          onChange={(e) => setTargetRoleLevel(e.target.value as any)}
                        >
                          <option value="junior">Junior (0-2y)</option>
                          <option value="mid">Mid-Level (2-5y)</option>
                          <option value="senior">Senior (5-8y)</option>
                          <option value="staff">Staff (8y+)</option>
                          <option value="principal">Principal (12y+)</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Target Base ($k)</label>
                        <input
                          type="number"
                          className="input"
                          style={{ fontSize: '0.78rem', padding: '4px 8px', marginTop: '4px' }}
                          value={desiredSalaryMin / 1000}
                          onChange={(e) => setDesiredSalaryMin(Number(e.target.value) * 1000)}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Target Total Comp ($k)</label>
                        <input
                          type="number"
                          className="input"
                          style={{ fontSize: '0.78rem', padding: '4px 8px', marginTop: '4px' }}
                          value={desiredSalaryMax / 1000}
                          onChange={(e) => setDesiredSalaryMax(Number(e.target.value) * 1000)}
                        />
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '12px',
                        marginBottom: '12px',
                      }}
                    >
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                          Education / Academic Credentials:
                        </label>
                        <input
                          type="text"
                          className="input"
                          style={{ fontSize: '0.78rem', marginTop: '4px' }}
                          value={educationBackground}
                          onChange={(e) => setEducationBackground(e.target.value)}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                          Key Achievements / Past Projects to Benchmark:
                        </label>
                        <input
                          type="text"
                          className="input"
                          style={{ fontSize: '0.78rem', marginTop: '4px' }}
                          value={keyAchievements}
                          onChange={(e) => setKeyAchievements(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit CTA */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={onClose} className="btn btn--secondary" disabled={isLoading}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn--primary"
                  disabled={isLoading || !companyName.trim()}
                  style={{
                    background: 'linear-gradient(135deg, #6366F1 0%, #06B6D4 100%)',
                    padding: '10px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: 600,
                  }}
                >
                  {isLoading ? (
                    <>
                      <div
                        style={{
                          width: '16px',
                          height: '16px',
                          border: '2px solid rgba(255, 255, 255, 0.3)',
                          borderTopColor: '#fff',
                          borderRadius: '50%',
                          animation: 'spin 0.8s linear infinite',
                        }}
                      />
                      <span>{loadingStep || 'Analyzing Fit...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      <span>Assess Company Fit with AI</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Results View */
            <div>
              {/* Score & Verdict Hero Banner */}
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(6, 182, 212, 0.08) 100%)',
                  border: '1px solid var(--border-medium, rgba(255, 255, 255, 0.12))',
                  borderRadius: '16px',
                  padding: '24px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '24px',
                  flexWrap: 'wrap',
                }}
              >
                {/* Score Dial */}
                <div style={{ textAlign: 'center', minWidth: '110px' }}>
                  <div
                    style={{
                      width: '90px',
                      height: '90px',
                      borderRadius: '50%',
                      border: `4px solid ${getScoreColor(result.fitScore)}`,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto',
                      background: 'rgba(0, 0, 0, 0.3)',
                      boxShadow: `0 0 20px ${getScoreColor(result.fitScore)}33`,
                    }}
                  >
                    <span style={{ fontSize: '1.75rem', fontWeight: 800, color: getScoreColor(result.fitScore) }}>
                      {result.fitScore}%
                    </span>
                    <span
                      style={{
                        fontSize: '0.65rem',
                        textTransform: 'uppercase',
                        color: 'var(--text-muted)',
                        letterSpacing: '0.5px',
                      }}
                    >
                      Fit Score
                    </span>
                  </div>
                  <div
                    style={{
                      marginTop: '8px',
                      padding: '3px 10px',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      display: 'inline-block',
                      background:
                        result.category === 'Safe'
                          ? 'rgba(16, 185, 129, 0.2)'
                          : result.category === 'Target'
                            ? 'rgba(6, 182, 212, 0.2)'
                            : 'rgba(245, 158, 11, 0.2)',
                      color:
                        result.category === 'Safe'
                          ? '#34D399'
                          : result.category === 'Target'
                            ? '#38BDF8'
                            : '#FBBF24',
                      border: `1px solid ${getScoreColor(result.fitScore)}55`,
                    }}
                  >
                    {result.category} Tier
                  </div>
                </div>

                {/* Verdict text */}
                <div style={{ flex: 1, minWidth: '280px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700 }}>
                      {result.targetRole} @ {result.companyName}
                    </h3>
                    {result.websiteSnippetUsed && (
                      <span
                        style={{
                          fontSize: '0.7rem',
                          background: 'rgba(16, 185, 129, 0.15)',
                          color: '#34D399',
                          padding: '2px 8px',
                          borderRadius: '8px',
                        }}
                      >
                        ✓ Live Site Verified
                      </span>
                    )}
                  </div>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    {result.verdict}
                  </p>
                  <div
                    style={{
                      display: 'flex',
                      gap: '14px',
                      marginTop: '12px',
                      fontSize: '0.78rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <span>
                      📍 Model: <strong style={{ color: 'var(--text-primary)' }}>{result.workModel}</strong>
                    </span>
                    <span>
                      💰 Est. Comp:{' '}
                      <strong style={{ color: '#10B981' }}>
                        ${(result.estimatedCompRange.min / 1000).toFixed(0)}k - $
                        {(result.estimatedCompRange.max / 1000).toFixed(0)}k
                      </strong>
                    </span>
                    <span>
                      🏢 Bar:{' '}
                      <strong style={{ color: '#818CF8' }}>{result.interviewInsights.estimatedDifficulty}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* 4-Score Calibration Breakdown */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '10px',
                  marginBottom: '20px',
                }}
              >
                {[
                  { label: 'Tech Stack Alignment', val: result.scoreBreakdown.techStackMatch, color: '#6366F1' },
                  {
                    label: 'Experience & Seniority',
                    val: result.scoreBreakdown.experienceMatch,
                    color: '#06B6D4',
                  },
                  { label: 'Role Scope Match', val: result.scoreBreakdown.roleScopeMatch, color: '#818CF8' },
                  { label: 'Stage & Culture Fit', val: result.scoreBreakdown.cultureStageFit, color: '#10B981' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.06))',
                      borderRadius: '10px',
                      padding: '12px',
                    }}
                  >
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      {item.label}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'baseline',
                        marginBottom: '6px',
                      }}
                    >
                      <span style={{ fontSize: '1.1rem', fontWeight: 700, color: item.color }}>{item.val}%</span>
                    </div>
                    <div
                      style={{
                        height: '4px',
                        background: 'rgba(255, 255, 255, 0.08)',
                        borderRadius: '2px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${item.val}%`,
                          height: '100%',
                          background: item.color,
                          borderRadius: '2px',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Matched Skills vs Missing Skills */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div
                  style={{
                    background: 'rgba(16, 185, 129, 0.05)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    borderRadius: '12px',
                    padding: '16px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginBottom: '10px',
                      color: '#34D399',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                    }}
                  >
                    <CheckCircle2 size={16} />
                    <span>Your Matched Tech Strengths</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {result.matchedSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        style={{
                          padding: '3px 8px',
                          borderRadius: '8px',
                          background: 'rgba(16, 185, 129, 0.15)',
                          color: '#A7F3D0',
                          fontSize: '0.76rem',
                          fontWeight: 600,
                        }}
                      >
                        ✓ {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div
                  style={{
                    background: 'rgba(245, 158, 11, 0.05)',
                    border: '1px solid rgba(245, 158, 11, 0.2)',
                    borderRadius: '12px',
                    padding: '16px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginBottom: '10px',
                      color: '#FBBF24',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                    }}
                  >
                    <AlertCircle size={16} />
                    <span>Key Skill Gaps to Bridge</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {result.missingSkills.length > 0 ? (
                      result.missingSkills.map((skill, idx) => (
                        <span
                          key={idx}
                          style={{
                            padding: '3px 8px',
                            borderRadius: '8px',
                            background: 'rgba(245, 158, 11, 0.15)',
                            color: '#FDE68A',
                            fontSize: '0.76rem',
                            fontWeight: 600,
                          }}
                        >
                          ⚡ {skill}
                        </span>
                      ))
                    ) : (
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        No major skill bottlenecks detected!
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Interview Loop Playbook */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '20px',
                }}
              >
                <div
                  style={{
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Award size={16} color="#818CF8" />
                  <span>Anticipated Interview Loop & Bar Expectations</span>
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '8px',
                  }}
                >
                  {result.interviewInsights.expectedRounds.map((round, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '8px 10px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '6px',
                        fontSize: '0.76rem',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      <strong style={{ color: '#818CF8' }}>#{idx + 1}</strong> {round}
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: '10px', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  <strong>Behavioral Focus:</strong> {result.interviewInsights.behavioralFocus}
                </div>
              </div>

              {/* Tailored Application Playbook: Resume Bullets & Outreach Pitch */}
              <div
                style={{
                  background: 'rgba(99, 102, 241, 0.04)',
                  border: '1px solid rgba(99, 102, 241, 0.15)',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '24px',
                }}
              >
                {/* Resume Bullets */}
                <div style={{ marginBottom: '16px' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px',
                    }}
                  >
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#A5B4FC' }}>
                      📝 Recommended Resume Bullets for {result.companyName}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopyText(result.tailoredApplicationKit.resumeHighlights.join('\n\n'), 'resume')
                      }
                      className="btn btn--sm"
                      style={{
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: 'none',
                        fontSize: '0.72rem',
                        padding: '3px 8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: copiedSection === 'resume' ? '#10B981' : 'var(--text-secondary)',
                      }}
                    >
                      {copiedSection === 'resume' ? <Check size={12} /> : <Copy size={12} />}
                      <span>{copiedSection === 'resume' ? 'Copied Bullets!' : 'Copy All Bullets'}</span>
                    </button>
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
                    {result.tailoredApplicationKit.resumeHighlights.map((bullet, idx) => (
                      <li key={idx} style={{ marginBottom: '4px' }}>
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recruiter Outreach */}
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '6px',
                    }}
                  >
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#06B6D4' }}>
                      ✉️ Tailored Cold Outreach / Referral Pitch
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopyText(result.tailoredApplicationKit.recruiterOutreachPitch, 'outreach')
                      }
                      className="btn btn--sm"
                      style={{
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: 'none',
                        fontSize: '0.72rem',
                        padding: '3px 8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: copiedSection === 'outreach' ? '#10B981' : 'var(--text-secondary)',
                      }}
                    >
                      {copiedSection === 'outreach' ? <Check size={12} /> : <Copy size={12} />}
                      <span>{copiedSection === 'outreach' ? 'Copied Pitch!' : 'Copy Message'}</span>
                    </button>
                  </div>
                  <div
                    style={{
                      background: 'rgba(0, 0, 0, 0.25)',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      fontSize: '0.76rem',
                      color: 'var(--text-secondary)',
                      lineHeight: '1.5',
                      fontStyle: 'italic',
                    }}
                  >
                    "{result.tailoredApplicationKit.recruiterOutreachPitch}"
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <button
                  type="button"
                  onClick={() => setResult(null)}
                  className="btn btn--secondary"
                  style={{ fontSize: '0.82rem' }}
                >
                  ← Evaluate Another Company
                </button>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn btn--secondary"
                    style={{ fontSize: '0.82rem' }}
                  >
                    Done
                  </button>

                  <button
                    type="button"
                    onClick={handleAddToPipelineClick}
                    disabled={isAddingJob}
                    className="btn btn--primary"
                    style={{
                      background: 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    {addJobSuccess ? (
                      <>
                        <Check size={16} />
                        <span>Added to Pipeline!</span>
                      </>
                    ) : (
                      <>
                        <Plus size={16} />
                        <span>{isAddingJob ? 'Adding...' : 'Add to My Job Pipeline'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
