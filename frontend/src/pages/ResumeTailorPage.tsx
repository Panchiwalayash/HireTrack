import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  Copy,
  Check,
  Download,
  Printer,
  Briefcase,
  Target,
  TrendingUp,
  Award,
  Zap,
  RefreshCw,
  AlertCircle,
  Building,
  CheckCircle2,
  Wand2,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import {
  tailorResumeAndCoverLetter,
  improveResume,
  type TailorResult,
  type ResumeImprovementResult,
} from '../services/ai.service';
import confetti from 'canvas-confetti';

const SAMPLE_JOB_DESCRIPTION = `Stripe is looking for a Senior / Staff Full-Stack Software Engineer to build the next generation of financial infrastructure and payment processing pipelines.

What You Will Do:
- Architect and scale real-time transaction processing services handling millions of daily events.
- Collaborate with frontend engineers to build high-converting merchant checkout flows with React and TypeScript.
- Optimize database queries and caching layers across PostgreSQL and Redis to meet stringent sub-50ms latency SLAs.
- Design resilient distributed architectures, event-driven workflows with Kafka, and automated CI/CD release systems.
- Partner with product managers, security engineers, and compliance teams to ensure 99.999% platform reliability.

Requirements:
- 4+ years of professional software engineering experience.
- Deep proficiency in TypeScript, React, Node.js, and SQL databases (PostgreSQL preferred).
- Hands-on experience with distributed systems, microservices, and asynchronous event streaming (Kafka, RabbitMQ, or SQS).
- Demonstrated passion for developer velocity, automated testing, and quantifiable performance optimization.`;

const SAMPLE_CURRENT_RESUME = `Yash Panchiwala | Full-Stack Software Engineer
Contact: contact@hiretrack.ai | GitHub: github.com/yashpanchiwala

SUMMARY:
Software Engineer with 4+ years of experience designing scalable distributed web platforms, low-latency microservices, and modern frontend interfaces using TypeScript, React, Node.js, and PostgreSQL.

EXPERIENCE:
Software Engineer | CloudScale Systems (2022 - Present)
- Developed and maintained microservices supporting 8M+ daily API requests using Node.js and TypeScript.
- Implemented database indexing, connection pooling, and Redis caching, improving response latency by 32%.
- Built responsive client dashboards with React, Next.js, and Redux, streamlining customer onboarding workflows.
- Configured automated Docker build pipelines and GitHub Actions CI/CD workflows, shortening deployment windows.

Associate Engineer | TechVanguard Labs (2020 - 2022)
- Built internal tooling and REST APIs in Python and PostgreSQL.
- Collaborated in an Agile Scrum team to deliver modular UI components in React and CSS modules.`;

const SAMPLE_WEAK_BULLET =
  'Responsible for building backend APIs in Node.js and helped optimize database queries for the team.';

export const ResumeTailorPage: React.FC = () => {
  const { jobs } = useData();
  const { user } = useAuth();

  // Mode: 'tailor' (Job-Specific matching) | 'improver' (General Resume Health & Bullet Rewriter)
  const [suiteMode, setSuiteMode] = useState<'tailor' | 'improver'>('tailor');

  // Tailor Mode State
  const [companyName, setCompanyName] = useState('Stripe');
  const [targetRole, setTargetRole] = useState('Senior Full-Stack Engineer');
  const [applicantName, setApplicantName] = useState(user?.email?.split('@')[0] || 'Yash Panchiwala');
  const [jobDescription, setJobDescription] = useState(SAMPLE_JOB_DESCRIPTION);
  const [currentResume, setCurrentResume] = useState(SAMPLE_CURRENT_RESUME);
  const [tone, setTone] = useState<'impactful_tech' | 'executive' | 'conversational' | 'startup'>('impactful_tech');
  const [activeTab, setActiveTab] = useState<'audit' | 'bullets' | 'cover_letter'>('audit');
  const [isTailoring, setIsTailoring] = useState(false);
  const [tailorResult, setTailorResult] = useState<TailorResult | null>(null);

  // Improver Mode State
  const [improverSubMode, setImproverSubMode] = useState<'full_resume' | 'single_bullet'>('full_resume');
  const [rawResumeText, setRawResumeText] = useState(SAMPLE_CURRENT_RESUME);
  const [singleBulletInput, setSingleBulletInput] = useState(SAMPLE_WEAK_BULLET);
  const [seniorityLevel, setSeniorityLevel] = useState<'junior' | 'mid' | 'senior' | 'staff'>('mid');
  const [targetImproverRole, setTargetImproverRole] = useState('Full-Stack Software Engineer');
  const [isImproving, setIsImproving] = useState(false);
  const [improveResult, setImproveResult] = useState<ResumeImprovementResult | null>(null);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSelectPipelineJob = (jobId: string) => {
    const job = jobs.find((j) => j.id === jobId);
    if (job) {
      setCompanyName(job.company);
      setTargetRole(job.role);
      if (job.notes && job.notes.length > 30) {
        setJobDescription(job.notes);
      }
    }
  };

  const handleLoadSample = () => {
    setCompanyName('Stripe');
    setTargetRole('Senior Full-Stack Engineer');
    setJobDescription(SAMPLE_JOB_DESCRIPTION);
    setCurrentResume(SAMPLE_CURRENT_RESUME);
  };

  const handleLoadSampleWeakBullet = () => {
    setSingleBulletInput(SAMPLE_WEAK_BULLET);
  };

  // Handle Tailoring Submission
  const handleGenerateTailoring = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobDescription.trim() || jobDescription.trim().length < 15) {
      setError('Please provide a job description (at least 15 characters).');
      return;
    }

    setError(null);
    setIsTailoring(true);

    try {
      const res = await tailorResumeAndCoverLetter(
        {
          companyName,
          targetRole,
          jobDescription,
          currentResume,
          applicantName,
          tone,
        },
        user?.id,
      );

      setTailorResult(res);
      confetti({
        particleCount: 60,
        spread: 65,
        origin: { y: 0.65 },
      });
    } catch (err: any) {
      setError(err.message || 'Failed to generate tailored application package. Please try again.');
    } finally {
      setIsTailoring(false);
    }
  };

  // Handle Resume Improver Submission
  const handleGenerateImprovement = async (e: React.FormEvent) => {
    e.preventDefault();
    const textToAnalyze = improverSubMode === 'full_resume' ? rawResumeText : singleBulletInput;

    if (!textToAnalyze.trim() || textToAnalyze.trim().length < 10) {
      setError('Please enter at least one resume bullet point or your resume content.');
      return;
    }

    setError(null);
    setIsImproving(true);

    try {
      const res = await improveResume(
        {
          resumeText: improverSubMode === 'full_resume' ? rawResumeText : undefined,
          singleBullet: improverSubMode === 'single_bullet' ? singleBulletInput : undefined,
          targetRole: targetImproverRole,
          seniority: seniorityLevel,
        },
        user?.id,
      );

      setImproveResult(res);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.65 },
      });
    } catch (err: any) {
      setError(err.message || 'Failed to analyze and improve resume. Please try again.');
    } finally {
      setIsImproving(false);
    }
  };

  const handleDownloadCoverLetter = () => {
    if (!tailorResult?.coverLetter?.fullLetterText) return;
    const blob = new Blob([tailorResult.coverLetter.fullLetterText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Cover_Letter_${companyName.replace(/\s+/g, '_')}_${targetRole.replace(/\s+/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="resume-tailor-page" style={{ maxWidth: '1440px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Hero Header & Mode Switcher */}
      <div
        className="section-title-bar"
        style={{
          background: 'var(--bg-card)',
          padding: '24px 28px',
          borderRadius: '20px',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span
              style={{
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(6, 182, 212, 0.2))',
                border: '1px solid rgba(99, 102, 241, 0.4)',
                borderRadius: '8px',
                padding: '4px 8px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.74rem',
                fontWeight: 800,
                color: 'var(--primary)',
                letterSpacing: '0.04em',
              }}
            >
              <Sparkles size={13} />
              AI RESUME & APPLICATION SUITE
            </span>
          </div>

          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            {suiteMode === 'tailor'
              ? 'AI Resume & Cover Letter Tailoring Engine'
              : 'AI Resume Improver & Bullet Point Optimizer'}
          </h1>
          <p style={{ margin: '6px 0 0', color: 'var(--text-secondary)', fontSize: '0.88rem', maxWidth: '680px' }}>
            {suiteMode === 'tailor'
              ? 'Calibrate your resume directly against specific job descriptions. Uncover keyword gaps, generate high-impact quantified bullets, and craft tailored cover letters.'
              : 'Audit your existing resume, flag passive verbs, check quantification ratios, and rewrite weak bullets into high-converting engineering power statements.'}
          </p>
        </div>

        {/* Suite Mode Switcher Pills */}
        <div
          style={{
            display: 'flex',
            background: 'var(--bg-input)',
            padding: '4px',
            borderRadius: '12px',
            border: '1px solid var(--border-medium)',
            gap: '4px',
          }}
        >
          <button
            type="button"
            onClick={() => setSuiteMode('tailor')}
            style={{
              padding: '8px 16px',
              borderRadius: '9px',
              border: 'none',
              background: suiteMode === 'tailor' ? 'var(--bg-card-solid)' : 'transparent',
              color: suiteMode === 'tailor' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.84rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: suiteMode === 'tailor' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <Target size={15} color={suiteMode === 'tailor' ? 'var(--primary)' : 'currentColor'} />
            <span>Job-Specific Tailor</span>
          </button>

          <button
            type="button"
            onClick={() => setSuiteMode('improver')}
            style={{
              padding: '8px 16px',
              borderRadius: '9px',
              border: 'none',
              background: suiteMode === 'improver' ? 'var(--bg-card-solid)' : 'transparent',
              color: suiteMode === 'improver' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.84rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: suiteMode === 'improver' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <Wand2 size={15} color={suiteMode === 'improver' ? '#10B981' : 'currentColor'} />
            <span>Resume Improver</span>
            <span
              style={{
                fontSize: '0.66rem',
                padding: '1px 6px',
                borderRadius: '8px',
                background: 'var(--color-success-bg)',
                color: 'var(--color-success-text)',
                fontWeight: 800,
              }}
            >
              NEW
            </span>
          </button>
        </div>
      </div>

      {error && (
        <div
          style={{
            background: 'var(--color-danger-bg)',
            border: '1px solid var(--color-danger-border)',
            color: 'var(--color-danger-text)',
            padding: '12px 18px',
            borderRadius: '12px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.88rem',
            fontWeight: 600,
          }}
        >
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 1: JOB-SPECIFIC TAILORING & COVER LETTER ENGINE */}
      {/* ========================================================================= */}
      {suiteMode === 'tailor' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: tailorResult ? 'minmax(340px, 460px) 1fr' : '1fr',
            gap: '24px',
            alignItems: 'start',
          }}
        >
          {/* Left Form: Inputs */}
          <div
            style={{
              background: 'var(--bg-card-solid)',
              border: '1px solid var(--border-medium)',
              borderRadius: '18px',
              padding: '24px',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                Target Opportunity & Resume Details
              </span>
              <button
                type="button"
                className="btn btn--secondary btn--sm"
                onClick={handleLoadSample}
                style={{ gap: '5px', fontSize: '0.76rem' }}
              >
                <RefreshCw size={12} />
                <span>Load Sample SWE Role</span>
              </button>
            </div>

            <form onSubmit={handleGenerateTailoring}>
              {/* Quick Populate from Pipeline */}
              {jobs.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Quick Import from Tracked Applications
                  </label>
                  <div style={{ marginTop: '6px' }}>
                    <select
                      className="input"
                      onChange={(e) => handleSelectPipelineJob(e.target.value)}
                      defaultValue=""
                      style={{ fontSize: '0.85rem' }}
                    >
                      <option value="" disabled>
                        Select an existing application to auto-fill...
                      </option>
                      {jobs.map((j) => (
                        <option key={j.id} value={j.id}>
                          {j.company} — {j.role} ({j.status.replace('_', ' ')})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Target Role & Company Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Target Company
                  </label>
                  <div style={{ position: 'relative', marginTop: '6px' }}>
                    <Building
                      size={14}
                      style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                    />
                    <input
                      type="text"
                      className="input"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Stripe, Airbnb"
                      style={{ paddingLeft: '32px' }}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Target Role
                  </label>
                  <div style={{ position: 'relative', marginTop: '6px' }}>
                    <Briefcase
                      size={14}
                      style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                    />
                    <input
                      type="text"
                      className="input"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      placeholder="e.g. Staff Software Engineer"
                      style={{ paddingLeft: '32px' }}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Applicant Name & Tone Selector */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Applicant Name
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    placeholder="Your full name"
                    style={{ marginTop: '6px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Tailoring Tone
                  </label>
                  <select
                    className="input"
                    value={tone}
                    onChange={(e: any) => setTone(e.target.value)}
                    style={{ marginTop: '6px', fontSize: '0.85rem' }}
                  >
                    <option value="impactful_tech">Impactful Tech (Action + Metric + Result)</option>
                    <option value="executive">Executive & Leadership</option>
                    <option value="startup">Startup & Scrappy</option>
                    <option value="conversational">Conversational</option>
                  </select>
                </div>
              </div>

              {/* Job Description Textarea */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Job Description / Requirements *
                  </label>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {jobDescription.length} characters
                  </span>
                </div>
                <textarea
                  className="input"
                  rows={6}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job posting, technical requirements, and responsibilities here..."
                  style={{ marginTop: '6px', fontFamily: 'monospace', fontSize: '0.82rem', resize: 'vertical' }}
                  required
                />
              </div>

              {/* Candidate Resume Textarea */}
              <div style={{ marginBottom: '22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Your Current Resume / Work Experience
                  </label>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {currentResume.length} characters
                  </span>
                </div>
                <textarea
                  className="input"
                  rows={6}
                  value={currentResume}
                  onChange={(e) => setCurrentResume(e.target.value)}
                  placeholder="Paste your past bullet points, skills, and project summaries here..."
                  style={{ marginTop: '6px', fontFamily: 'monospace', fontSize: '0.82rem', resize: 'vertical' }}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isTailoring}
                className="btn btn--primary btn--block"
                style={{ padding: '14px', fontSize: '0.95rem', gap: '8px', fontWeight: 700 }}
              >
                {isTailoring ? (
                  <>
                    <RefreshCw size={18} className="spin" />
                    <span>Calibrating Bullets & Letter with AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    <span>Generate Tailored Application Package</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Output: Interactive Results */}
          {tailorResult && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Tab Navigation Header */}
              <div
                style={{
                  display: 'flex',
                  background: 'var(--bg-input)',
                  borderRadius: '12px',
                  padding: '4px',
                  gap: '4px',
                  border: '1px solid var(--border-medium)',
                }}
              >
                <button
                  type="button"
                  onClick={() => setActiveTab('audit')}
                  style={{
                    flex: 1,
                    padding: '9px 14px',
                    borderRadius: '9px',
                    border: 'none',
                    background: activeTab === 'audit' ? 'var(--bg-card-solid)' : 'transparent',
                    color: activeTab === 'audit' ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: 700,
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: activeTab === 'audit' ? 'var(--shadow-sm)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Target size={15} color={activeTab === 'audit' ? 'var(--primary)' : 'currentColor'} />
                  <span>ATS & Keyword Audit</span>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      padding: '2px 6px',
                      borderRadius: '10px',
                      background: 'var(--color-primary-bg)',
                      color: 'var(--color-primary-text)',
                    }}
                  >
                    {tailorResult.matchScore}%
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('bullets')}
                  style={{
                    flex: 1,
                    padding: '9px 14px',
                    borderRadius: '9px',
                    border: 'none',
                    background: activeTab === 'bullets' ? 'var(--bg-card-solid)' : 'transparent',
                    color: activeTab === 'bullets' ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: 700,
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: activeTab === 'bullets' ? 'var(--shadow-sm)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Zap size={15} color={activeTab === 'bullets' ? '#10B981' : 'currentColor'} />
                  <span>High-Impact Bullets</span>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      padding: '2px 6px',
                      borderRadius: '10px',
                      background: 'var(--color-success-bg)',
                      color: 'var(--color-success-text)',
                    }}
                  >
                    {tailorResult.tailoredBullets.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('cover_letter')}
                  style={{
                    flex: 1,
                    padding: '9px 14px',
                    borderRadius: '9px',
                    border: 'none',
                    background: activeTab === 'cover_letter' ? 'var(--bg-card-solid)' : 'transparent',
                    color: activeTab === 'cover_letter' ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: 700,
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: activeTab === 'cover_letter' ? 'var(--shadow-sm)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <FileText size={15} color={activeTab === 'cover_letter' ? '#06B6D4' : 'currentColor'} />
                  <span>Tailored Cover Letter</span>
                </button>
              </div>

              {/* TAB 1: ATS & Keyword Audit */}
              {activeTab === 'audit' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Score & Evaluation Bar */}
                  <div
                    style={{
                      background: 'var(--bg-card-solid)',
                      border: '1px solid var(--border-medium)',
                      borderRadius: '16px',
                      padding: '20px 24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '16px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                      <div
                        style={{
                          width: '68px',
                          height: '68px',
                          borderRadius: '50%',
                          border: '4px solid var(--primary)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'var(--bg-card)',
                          boxShadow: 'var(--shadow-sm)',
                          flexShrink: 0,
                        }}
                      >
                        <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                          {tailorResult.matchScore}%
                        </span>
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--primary)', marginTop: '2px' }}>
                          {tailorResult.matchGrade}
                        </span>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                          ATS Fit Analysis
                        </div>
                        <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                          {tailorResult.targetRole} @ {tailorResult.companyName}
                        </div>
                        <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                          {tailorResult.matchAnalysis}
                        </p>
                      </div>
                    </div>

                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: '8px',
                        background: 'var(--color-primary-bg)',
                        color: 'var(--color-primary-text)',
                        border: '1px solid var(--color-primary-border)',
                      }}
                    >
                      Engine: {tailorResult.providerUsed.toUpperCase()}
                    </span>
                  </div>

                  {/* Keyword Match / Gap Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    {/* Matched Keywords */}
                    <div
                      style={{
                        background: 'var(--bg-card-solid)',
                        border: '1px solid var(--border-medium)',
                        borderRadius: '16px',
                        padding: '18px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                        <Check size={16} color="#10B981" />
                        <span style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--text-primary)' }}>
                          Matched High-Priority Skills ({tailorResult.matchedKeywords.length})
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {tailorResult.matchedKeywords.map((kw) => (
                          <span
                            key={kw}
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              padding: '4px 10px',
                              borderRadius: '8px',
                              background: 'var(--color-success-bg)',
                              color: 'var(--color-success-text)',
                              border: '1px solid var(--color-success-border)',
                            }}
                          >
                            ✓ {kw}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Missing Keywords */}
                    <div
                      style={{
                        background: 'var(--bg-card-solid)',
                        border: '1px solid var(--border-medium)',
                        borderRadius: '16px',
                        padding: '18px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                        <TrendingUp size={16} color="#F59E0B" />
                        <span style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--text-primary)' }}>
                          Keywords to Inject / Mention ({tailorResult.missingKeywords.length})
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {tailorResult.missingKeywords.map((kw) => (
                          <span
                            key={kw}
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              padding: '4px 10px',
                              borderRadius: '8px',
                              background: 'var(--color-warning-bg)',
                              color: 'var(--color-warning-text)',
                              border: '1px solid var(--color-warning-border)',
                            }}
                          >
                            + {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Executive Summary Pitch */}
                  <div
                    style={{
                      background: 'var(--bg-card-solid)',
                      border: '1px solid var(--border-medium)',
                      borderRadius: '16px',
                      padding: '20px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Award size={16} color="var(--primary)" />
                        <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                          Tailored Resume Executive Summary (Elevator Pitch)
                        </span>
                      </div>
                      <button
                        type="button"
                        className="btn btn--ghost btn--sm"
                        onClick={() => handleCopy(tailorResult.executiveSummary, 'exec_summary')}
                        style={{ gap: '5px', fontSize: '0.78rem' }}
                      >
                        {copiedKey === 'exec_summary' ? <Check size={13} color="#10B981" /> : <Copy size={13} />}
                        <span>{copiedKey === 'exec_summary' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <p
                      style={{
                        margin: 0,
                        color: 'var(--text-secondary)',
                        fontSize: '0.86rem',
                        lineHeight: 1.6,
                        background: 'var(--bg-input)',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      {tailorResult.executiveSummary}
                    </p>
                  </div>

                  {/* Interview Talking Points */}
                  <div
                    style={{
                      background: 'var(--bg-card-solid)',
                      border: '1px solid var(--border-medium)',
                      borderRadius: '16px',
                      padding: '20px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                      <Zap size={16} color="#06B6D4" />
                      <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                        High-Leverage Interview Talking Points
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {tailorResult.interviewTalkingPoints.map((pt, i) => (
                        <div
                          key={i}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '10px',
                            background: 'var(--bg-secondary)',
                            padding: '10px 14px',
                            borderRadius: '10px',
                            fontSize: '0.84rem',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          <span
                            style={{
                              background: 'var(--color-primary-bg)',
                              color: 'var(--color-primary-text)',
                              borderRadius: '50%',
                              width: '20px',
                              height: '20px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              flexShrink: 0,
                            }}
                          >
                            {i + 1}
                          </span>
                          <span>{pt}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: XYZ Resume Bullets */}
              {activeTab === 'bullets' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'var(--bg-card-solid)',
                      padding: '14px 18px',
                      borderRadius: '12px',
                      border: '1px solid var(--border-medium)',
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                        High-Impact Achievement Bullets
                      </span>
                      <p style={{ margin: '2px 0 0', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                        Structured as &ldquo;Accomplished [Outcome], measured by [Metric], by doing [Action]&rdquo;. 1-click copy ready.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="btn btn--secondary btn--sm"
                      onClick={() => {
                        const all = tailorResult.tailoredBullets.map((b) => `• ${b.bulletPoint}`).join('\n');
                        handleCopy(all, 'all_bullets');
                      }}
                      style={{ gap: '6px' }}
                    >
                      {copiedKey === 'all_bullets' ? <Check size={13} color="#10B981" /> : <Copy size={13} />}
                      <span>{copiedKey === 'all_bullets' ? 'All Copied' : 'Copy All Bullets'}</span>
                    </button>
                  </div>

                  {tailorResult.tailoredBullets.map((bullet, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: 'var(--bg-card-solid)',
                        border: '1px solid var(--border-medium)',
                        borderRadius: '14px',
                        padding: '18px 20px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              padding: '3px 8px',
                              borderRadius: '6px',
                              background: 'var(--color-primary-bg)',
                              color: 'var(--color-primary-text)',
                              border: '1px solid var(--color-primary-border)',
                              textTransform: 'uppercase',
                            }}
                          >
                            {bullet.category}
                          </span>
                          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                            Impact: {bullet.impactScore}/100
                          </span>
                        </div>

                        <button
                          type="button"
                          className="btn btn--ghost btn--sm"
                          onClick={() => handleCopy(bullet.bulletPoint, `bullet_${idx}`)}
                          style={{ gap: '5px', fontSize: '0.76rem' }}
                        >
                          {copiedKey === `bullet_${idx}` ? <Check size={13} color="#10B981" /> : <Copy size={13} />}
                          <span>{copiedKey === `bullet_${idx}` ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>

                      <p
                        style={{
                          margin: '0 0 10px',
                          fontSize: '0.88rem',
                          lineHeight: 1.6,
                          color: 'var(--text-primary)',
                          fontWeight: 500,
                        }}
                      >
                        • {bullet.bulletPoint}
                      </p>

                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {bullet.keywordsHighlighted.map((kw) => (
                          <span
                            key={kw}
                            style={{
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              padding: '2px 7px',
                              borderRadius: '5px',
                              background: 'var(--bg-secondary)',
                              color: 'var(--text-secondary)',
                              border: '1px solid var(--border-subtle)',
                            }}
                          >
                            #{kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 3: Tailored Cover Letter */}
              {activeTab === 'cover_letter' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Actions Toolbar */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'var(--bg-card-solid)',
                      padding: '14px 18px',
                      borderRadius: '12px',
                      border: '1px solid var(--border-medium)',
                      flexWrap: 'wrap',
                      gap: '10px',
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                        Tailored Letter for {tailorResult.companyName}
                      </span>
                      <p style={{ margin: '2px 0 0', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                        {tailorResult.coverLetter.subject}
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        className="btn btn--secondary btn--sm"
                        onClick={() => handleCopy(tailorResult.coverLetter.fullLetterText, 'cover_letter')}
                        style={{ gap: '5px' }}
                      >
                        {copiedKey === 'cover_letter' ? <Check size={13} color="#10B981" /> : <Copy size={13} />}
                        <span>{copiedKey === 'cover_letter' ? 'Copied' : 'Copy Text'}</span>
                      </button>

                      <button
                        type="button"
                        className="btn btn--secondary btn--sm"
                        onClick={handleDownloadCoverLetter}
                        style={{ gap: '5px' }}
                      >
                        <Download size={13} />
                        <span>Download .txt</span>
                      </button>

                      <button
                        type="button"
                        className="btn btn--ghost btn--sm"
                        onClick={() => window.print()}
                        style={{ gap: '5px' }}
                      >
                        <Printer size={13} />
                        <span>Print / PDF</span>
                      </button>
                    </div>
                  </div>

                  {/* Formatted Letter Document Preview */}
                  <div
                    style={{
                      background: 'var(--bg-card-solid)',
                      border: '1px solid var(--border-medium)',
                      borderRadius: '16px',
                      padding: '36px 40px',
                      boxShadow: 'var(--shadow-sm)',
                      fontFamily: 'serif',
                      lineHeight: 1.8,
                      color: 'var(--text-primary)',
                      fontSize: '0.94rem',
                      position: 'relative',
                    }}
                  >
                    <div style={{ borderBottom: '2px solid var(--border-subtle)', paddingBottom: '16px', marginBottom: '24px' }}>
                      <div style={{ fontFamily: 'sans-serif', fontWeight: 800, fontSize: '1.25rem' }}>
                        {applicantName}
                      </div>
                      <div style={{ fontFamily: 'sans-serif', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Application for {tailorResult.targetRole} | {tailorResult.companyName}
                      </div>
                    </div>

                    <p style={{ fontWeight: 700, marginBottom: '20px' }}>{tailorResult.coverLetter.salutation}</p>
                    <p style={{ marginBottom: '18px' }}>{tailorResult.coverLetter.openingParagraph}</p>
                    {tailorResult.coverLetter.bodyParagraphs.map((para, i) => (
                      <p key={i} style={{ marginBottom: '18px' }}>
                        {para}
                      </p>
                    ))}
                    <p style={{ marginBottom: '28px' }}>{tailorResult.coverLetter.closingParagraph}</p>
                    <div style={{ marginTop: '28px' }}>
                      <p style={{ margin: 0 }}>Sincerely,</p>
                      <p style={{ fontWeight: 700, margin: '6px 0 0' }}>{applicantName}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: GENERAL RESUME IMPROVER & BULLET OPTIMIZER */}
      {/* ========================================================================= */}
      {suiteMode === 'improver' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: improveResult ? 'minmax(340px, 440px) 1fr' : '1fr',
            gap: '24px',
            alignItems: 'start',
          }}
        >
          {/* Left Form: Improver Inputs */}
          <div
            style={{
              background: 'var(--bg-card-solid)',
              border: '1px solid var(--border-medium)',
              borderRadius: '18px',
              padding: '24px',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            {/* Submode Switcher: Full Resume vs Single Bullet */}
            <div
              style={{
                display: 'flex',
                background: 'var(--bg-input)',
                padding: '3px',
                borderRadius: '10px',
                border: '1px solid var(--border-subtle)',
                marginBottom: '18px',
              }}
            >
              <button
                type="button"
                onClick={() => setImproverSubMode('full_resume')}
                style={{
                  flex: 1,
                  padding: '7px 12px',
                  borderRadius: '7px',
                  border: 'none',
                  background: improverSubMode === 'full_resume' ? 'var(--bg-card-solid)' : 'transparent',
                  color: improverSubMode === 'full_resume' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <FileText size={14} />
                <span>Full Resume Audit</span>
              </button>

              <button
                type="button"
                onClick={() => setImproverSubMode('single_bullet')}
                style={{
                  flex: 1,
                  padding: '7px 12px',
                  borderRadius: '7px',
                  border: 'none',
                  background: improverSubMode === 'single_bullet' ? 'var(--bg-card-solid)' : 'transparent',
                  color: improverSubMode === 'single_bullet' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <Wand2 size={14} />
                <span>Bullet Point Rewriter</span>
              </button>
            </div>

            <form onSubmit={handleGenerateImprovement}>
              {/* Role & Seniority Level */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Target Role
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={targetImproverRole}
                    onChange={(e) => setTargetImproverRole(e.target.value)}
                    placeholder="e.g. Senior Software Engineer"
                    style={{ marginTop: '6px' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Seniority Level
                  </label>
                  <select
                    className="input"
                    value={seniorityLevel}
                    onChange={(e: any) => setSeniorityLevel(e.target.value)}
                    style={{ marginTop: '6px', fontSize: '0.85rem' }}
                  >
                    <option value="junior">Junior (0-2 yrs)</option>
                    <option value="mid">Mid-Level (3-5 yrs)</option>
                    <option value="senior">Senior (5-8 yrs)</option>
                    <option value="staff">Staff / Principal (8+ yrs)</option>
                  </select>
                </div>
              </div>

              {/* Conditional Input based on submode */}
              {improverSubMode === 'full_resume' ? (
                <div style={{ marginBottom: '22px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Paste Your Resume / Experience
                    </label>
                    <button
                      type="button"
                      className="btn btn--ghost btn--sm"
                      onClick={() => setRawResumeText(SAMPLE_CURRENT_RESUME)}
                      style={{ fontSize: '0.74rem', padding: '2px 6px' }}
                    >
                      Reset Demo
                    </button>
                  </div>
                  <textarea
                    className="input"
                    rows={12}
                    value={rawResumeText}
                    onChange={(e) => setRawResumeText(e.target.value)}
                    placeholder="Paste your resume experience, bullet points, and skills here..."
                    style={{ marginTop: '6px', fontFamily: 'monospace', fontSize: '0.82rem', resize: 'vertical' }}
                    required
                  />
                </div>
              ) : (
                <div style={{ marginBottom: '22px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Paste Single Bullet Point to Optimize
                    </label>
                    <button
                      type="button"
                      className="btn btn--ghost btn--sm"
                      onClick={handleLoadSampleWeakBullet}
                      style={{ fontSize: '0.74rem', padding: '2px 6px' }}
                    >
                      Sample Weak Bullet
                    </button>
                  </div>
                  <textarea
                    className="input"
                    rows={4}
                    value={singleBulletInput}
                    onChange={(e) => setSingleBulletInput(e.target.value)}
                    placeholder="e.g. Responsible for building APIs in Node and helped with SQL queries..."
                    style={{ marginTop: '6px', fontSize: '0.86rem', resize: 'vertical' }}
                    required
                  />
                  <p style={{ margin: '6px 0 0', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    Paste a weak, passive, or non-quantified bullet. AI will generate 3 quantified, high-impact variations with measurable results.
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isImproving}
                className="btn btn--primary btn--block"
                style={{ padding: '14px', fontSize: '0.95rem', gap: '8px', fontWeight: 700 }}
              >
                {isImproving ? (
                  <>
                    <RefreshCw size={18} className="spin" />
                    <span>Auditing & Elevating Resume with AI...</span>
                  </>
                ) : (
                  <>
                    <Wand2 size={18} />
                    <span>
                      {improverSubMode === 'full_resume'
                        ? 'Run Full Resume Audit & Bullet Upgrade'
                        : 'Rewrite into High-Impact Bullets'}
                    </span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Output: Improver Results */}
          {improveResult && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Scorecard Hero Banner */}
              <div
                style={{
                  background: 'var(--bg-card-solid)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '16px',
                  padding: '22px 24px',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                    <div
                      style={{
                        width: '72px',
                        height: '72px',
                        borderRadius: '50%',
                        border: '4px solid var(--color-success-text)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'var(--bg-card)',
                        boxShadow: 'var(--shadow-sm)',
                        flexShrink: 0,
                      }}
                    >
                      <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                        {improveResult.overallScore}%
                      </span>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--color-success-text)', marginTop: '2px' }}>
                        {improveResult.grade}
                      </span>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        Resume Impact Score
                      </div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                        {targetImproverRole} ({seniorityLevel.toUpperCase()})
                      </div>
                      <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                        {improveResult.summaryEvaluation}
                      </p>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: '8px',
                      background: 'var(--color-primary-bg)',
                      color: 'var(--color-primary-text)',
                      border: '1px solid var(--color-primary-border)',
                    }}
                  >
                    Engine: {improveResult.providerUsed.toUpperCase()}
                  </span>
                </div>

                {/* Micro Metric Scores Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                  <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Quantification & Metrics</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: improveResult.quantificationScore >= 70 ? 'var(--color-success-text)' : 'var(--color-warning-text)', marginTop: '2px' }}>
                      {improveResult.quantificationScore}%
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {improveResult.quantificationScore >= 70 ? 'Solid numbers & scale' : 'Needs more metrics'}
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Action Verb Strength</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: improveResult.actionVerbScore >= 70 ? 'var(--color-success-text)' : 'var(--color-warning-text)', marginTop: '2px' }}>
                      {improveResult.actionVerbScore}%
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {improveResult.actionVerbScore >= 70 ? 'Strong power verbs' : 'Passive words detected'}
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Brevity & Clarity</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-info-text)', marginTop: '2px' }}>
                      {improveResult.brevityScore}%
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Punchy & scannable
                    </div>
                  </div>
                </div>
              </div>

              {/* Passive Phrases & Weak Verbs Flagged */}
              {improveResult.passiveAlerts.length > 0 && (
                <div
                  style={{
                    background: 'var(--bg-card-solid)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '16px',
                    padding: '20px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <AlertCircle size={17} color="#F59E0B" />
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                      Weak Verbs & Passive Phrases Detected ({improveResult.passiveAlerts.length})
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {improveResult.passiveAlerts.map((alert, i) => (
                      <div
                        key={i}
                        style={{
                          background: 'var(--color-warning-bg)',
                          border: '1px solid var(--color-warning-border)',
                          borderRadius: '12px',
                          padding: '12px 16px',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--color-warning-text)' }}>
                            Avoid: "{alert.weakPhrase}"
                          </span>
                          <span style={{ fontSize: '0.76rem', color: 'var(--color-warning-text)' }}>
                            {alert.reason}
                          </span>
                        </div>
                        <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            Recommended Power Replacements:
                          </span>
                          {alert.suggestedPowerVerbs.map((v) => (
                            <span
                              key={v}
                              style={{
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                padding: '2px 8px',
                                borderRadius: '6px',
                                background: 'var(--bg-card-solid)',
                                color: 'var(--color-success-text)',
                                border: '1px solid var(--color-success-border)',
                              }}
                            >
                              ✓ {v}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Google XYZ Formula Rewritten Bullets */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={17} color="var(--primary)" />
                    <span style={{ fontWeight: 800, fontSize: '0.94rem', color: 'var(--text-primary)' }}>
                      AI High-Impact Bullet Rewrites (Before → After)
                    </span>
                  </div>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                    Action + Metric + Business Impact
                  </span>
                </div>

                {improveResult.bulletImprovements.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'var(--bg-card-solid)',
                      border: '1px solid var(--border-medium)',
                      borderRadius: '16px',
                      padding: '20px',
                    }}
                  >
                    {/* Original weak bullet */}
                    <div
                      style={{
                        background: 'var(--bg-secondary)',
                        padding: '12px 14px',
                        borderRadius: '10px',
                        borderLeft: '4px solid var(--color-warning-border)',
                        marginBottom: '14px',
                      }}
                    >
                      <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--color-warning-text)', textTransform: 'uppercase' }}>
                        Original Weak Bullet
                      </div>
                      <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                        "{item.original}"
                      </p>
                      <p style={{ margin: '6px 0 0', fontSize: '0.76rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        Critique: {item.critique}
                      </p>
                    </div>

                    {/* 3 XYZ Variations */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {item.improvedOptions.map((opt, oIdx) => (
                        <div
                          key={oIdx}
                          style={{
                            background: 'var(--bg-input)',
                            border: '1px solid var(--border-medium)',
                            borderRadius: '12px',
                            padding: '14px 16px',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span
                                style={{
                                  fontSize: '0.72rem',
                                  fontWeight: 800,
                                  padding: '2px 8px',
                                  borderRadius: '6px',
                                  background: 'var(--color-success-bg)',
                                  color: 'var(--color-success-text)',
                                  border: '1px solid var(--color-success-border)',
                                }}
                              >
                                {opt.style}
                              </span>
                              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                Impact Score: {opt.impactScore}/100
                              </span>
                            </div>

                            <button
                              type="button"
                              className="btn btn--secondary btn--sm"
                              onClick={() => handleCopy(opt.bullet, `imp_bullet_${idx}_${oIdx}`)}
                              style={{ gap: '5px', fontSize: '0.74rem', padding: '4px 8px' }}
                            >
                              {copiedKey === `imp_bullet_${idx}_${oIdx}` ? (
                                <Check size={12} color="#10B981" />
                              ) : (
                                <Copy size={12} />
                              )}
                              <span>{copiedKey === `imp_bullet_${idx}_${oIdx}` ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>

                          <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                            • {opt.bullet}
                          </p>

                          {opt.metricsHighlighted.length > 0 && (
                            <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                              {opt.metricsHighlighted.map((m) => (
                                <span
                                  key={m}
                                  style={{
                                    fontSize: '0.68rem',
                                    fontWeight: 700,
                                    padding: '1px 6px',
                                    borderRadius: '5px',
                                    background: 'var(--bg-secondary)',
                                    color: 'var(--primary)',
                                    border: '1px solid var(--border-subtle)',
                                  }}
                                >
                                  🎯 {m}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Polished Resume Preview (Full mode) */}
              {improveResult.polishedResumePreview && (
                <div
                  style={{
                    background: 'var(--bg-card-solid)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '16px',
                    padding: '24px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 size={17} color="#10B981" />
                      <span style={{ fontWeight: 800, fontSize: '0.94rem', color: 'var(--text-primary)' }}>
                        AI-Polished Resume Markdown Preview
                      </span>
                    </div>

                    <button
                      type="button"
                      className="btn btn--secondary btn--sm"
                      onClick={() => handleCopy(improveResult.polishedResumePreview || '', 'polished_resume')}
                      style={{ gap: '6px' }}
                    >
                      {copiedKey === 'polished_resume' ? <Check size={13} color="#10B981" /> : <Copy size={13} />}
                      <span>{copiedKey === 'polished_resume' ? 'Copied' : 'Copy Markdown'}</span>
                    </button>
                  </div>

                  <pre
                    style={{
                      background: 'var(--bg-input)',
                      padding: '16px',
                      borderRadius: '12px',
                      border: '1px solid var(--border-subtle)',
                      fontFamily: 'monospace',
                      fontSize: '0.82rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.6,
                      whiteSpace: 'pre-wrap',
                      maxHeight: '400px',
                      overflowY: 'auto',
                    }}
                  >
                    {improveResult.polishedResumePreview}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
