import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  ArrowRight,
  BarChart3,
  Brain,
  Network,
  CheckCircle2,
  XCircle,
  Zap,
  Target,
  ChevronDown,
  Copy,
  Check,
  Lock,
} from 'lucide-react';
import { BrandLogo } from '../components/common/BrandLogo';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Interactive Demo state
  const [demoCopied, setDemoCopied] = useState(false);
  const [demoSelectedVariation, setDemoSelectedVariation] = useState<number>(0);

  // FAQ open states
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const handleCopyDemo = (text: string) => {
    navigator.clipboard.writeText(text);
    setDemoCopied(true);
    setTimeout(() => setDemoCopied(false), 2000);
  };

  const demoVariations = [
    {
      label: 'High-Impact (Scale & Metric)',
      badge: 'Metrics & Scale',
      text: 'Architected high-throughput payment settlement microservice in Node.js & Redis processing 4.2M daily transactions with 99.99% uptime, slashing latency by 34%.',
    },
    {
      label: 'Architecture & System Design',
      badge: 'System Design',
      text: 'Engineered event-driven transaction pipeline with Apache Kafka and PostgreSQL partitioning, mitigating peak payment bottlenecks for $120M annual GMV.',
    },
    {
      label: 'Leadership & Team Ownership',
      badge: 'Ownership',
      text: 'Spearheaded zero-downtime migration of legacy checkout gateway to microservices across 4 squads, completing 3 weeks ahead of schedule with zero incident rollbacks.',
    },
  ];

  const faqs = [
    {
      q: 'Are the AI Resume & Company Fit tools really 100% free?',
      a: 'Yes! Both the AI Company Fit Scorer and the AI Resume & Cover Letter Suite (including high-impact bullet rewrites) are free to explore with zero credit card required.',
    },
    {
      q: 'How do quantified achievement bullets improve my interview callback rate?',
      a: 'Top tech recruiters look for: "Accomplished [Outcome] as measured by [Metric] by doing [Action]". It replaces passive job duty statements with quantifiable impact and technical scale, making your achievements immediately clear to hiring managers and ATS filters.',
    },
    {
      q: 'Is my resume and interview data private?',
      a: 'Absolutely. Your resumes, notes, and application targets are protected with enterprise-grade encryption and secure access controls, strictly private to your account.',
    },
    {
      q: 'Can I track multi-round interview timelines and Google Calendar?',
      a: 'Yes. Every application supports multi-round pipelines (Screen, Technical, System Design, Behavioral) with 1-click Google Calendar & .ics deadline export.',
    },
  ];

  return (
    <div className="landing-page">
      {/* Living Ambient Glowing Orbs */}
      <div className="landing-page__orb landing-page__orb--1" />
      <div className="landing-page__orb landing-page__orb--2" />

      {/* Navigation */}
      <nav className="landing-page__nav">
        <BrandLogo size={36} onClick={() => navigate('/')} />
        <div className="landing-page__nav-actions">
          {user ? (
            <button className="btn btn--primary btn--sm" onClick={() => navigate('/dashboard')}>
              Go to Dashboard
              <ArrowRight size={14} />
            </button>
          ) : (
            <>
              <button className="btn btn--ghost btn--sm" onClick={() => navigate('/login')}>
                Sign In
              </button>
              <button className="btn btn--primary btn--sm" onClick={() => navigate('/register')}>
                Get Started Free
                <ArrowRight size={14} />
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <header className="landing-page__hero">
        <div className="landing-page__hero-content">
          {/* Sparkle Pill Badge */}
          <div className="landing-page__badge">
            <span className="pulse-dot" style={{ color: '#10B981' }}>
              <span className="pulse-dot__core" />
            </span>
            <span>AI Career Command Center · V2.0</span>
          </div>

          {/* Display Heading */}
          <h1 className="landing-page__title">
            Land Your Dream Tech Job.
            <br />
            <span className="landing-page__title-gradient">Engineered with Precision.</span>
          </h1>

          {/* Subtitle */}
          <p className="landing-page__subtitle">
            The all-in-one career intelligence cockpit for software engineers. Calibrate your resume with quantified impact formulas, predict company interview fit, track multi-round pipelines, and automate outreach.
          </p>

          {/* Action Buttons */}
          <div className="landing-page__cta-group">
            <button
              className="btn btn--primary btn--lg"
              onClick={() => navigate('/tailor')}
            >
              <Sparkles size={18} />
              <span>Optimize Resume & Cover Letter</span>
              <ArrowRight size={16} />
            </button>
            <button
              className="btn btn--secondary btn--lg"
              onClick={() => navigate('/optimizer')}
            >
              <Brain size={18} />
              <span>Explore Company Fit AI</span>
            </button>
          </div>

          {/* Trust Strip */}
          <div className="landing-page__trust">
            <span>Powered by</span>
            <span className="landing-page__trust-highlight">Google Gemini 3.8 Flash</span>
            <span className="landing-page__trust-dot">·</span>
            <span className="landing-page__trust-highlight">Enterprise Encryption</span>
            <span className="landing-page__trust-dot">·</span>
            <span className="landing-page__trust-highlight">Quantified Impact Bullets</span>
            <span className="landing-page__trust-dot">·</span>
            <span>100% Free & Open-Source</span>
          </div>
        </div>

        {/* Hero Interactive Showcase / Product Mockup */}
        <div className="landing-page__showcase">
          <div className="landing-page__showcase-header">
            <div className="landing-page__showcase-dots">
              <span />
              <span />
              <span />
            </div>
            <div className="landing-page__showcase-url">hiretrack.ai/cockpit — Live Optimization</div>
          </div>

          <div className="landing-page__showcase-body">
            {/* Left Column: ATS Score & Strategy */}
            <div style={{ background: 'var(--bg-input)', padding: '20px', borderRadius: '14px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Target Opportunity
                </span>
                <span style={{ fontSize: '0.72rem', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)', padding: '3px 8px', borderRadius: '12px', fontWeight: 600 }}>
                  High Match
                </span>
              </div>
              <h4 style={{ margin: '0 0 4px', fontSize: '1.05rem', color: 'var(--text-primary)' }}>Senior Full-Stack Engineer</h4>
              <p style={{ margin: '0 0 16px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Stripe · Core Payments Infrastructure</p>

              {/* Score Meter */}
              <div style={{ background: 'var(--bg-card-solid)', padding: '14px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '14px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', border: '2px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.95rem', color: '#10b981' }}>
                  94%
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>ATS & Impact Calibrated</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>18 Keywords Matched · 0 Passive Verbs</div>
                </div>
              </div>

              {/* Matched Keywords */}
              <div style={{ marginTop: '14px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {['TypeScript', 'PostgreSQL', 'Kafka', 'Microservices', 'Distributed Systems'].map((kw) => (
                  <span key={kw} style={{ fontSize: '0.72rem', background: 'rgba(16, 185, 129, 0.12)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '2px 8px', borderRadius: '999px', fontWeight: 500 }}>
                    ✓ {kw}
                  </span>
                ))}
              </div>
            </div>

            {/* Right Column: Google XYZ Bullet Comparison */}
            <div style={{ background: 'var(--bg-input)', padding: '20px', borderRadius: '14px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  AI High-Impact Bullet Transformation
                </span>
                <span style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 600 }}>
                  +42% Recruiter Score
                </span>
              </div>

              {/* Weak Before */}
              <div style={{ background: 'rgba(244, 63, 94, 0.08)', border: '1px dashed rgba(244, 63, 94, 0.3)', padding: '10px 14px', borderRadius: '8px', marginBottom: '12px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                <span style={{ color: '#fda4af', fontWeight: 700, marginRight: '6px' }}>Before:</span>
                Responsible for building payment APIs and database queries in Node.js.
              </div>

              {/* XYZ After */}
              <div style={{ background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.4)', padding: '14px', borderRadius: '10px', fontSize: '0.84rem', color: 'var(--text-primary)', lineHeight: 1.55 }}>
                <span style={{ color: 'var(--primary)', fontWeight: 700, marginRight: '6px' }}>After (Quantified Impact):</span>
                Architected high-throughput payment settlement microservice processing 4.2M daily transactions with 99.99% uptime, slashing latency by 34%.
              </div>

              <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                <span style={{ fontSize: '0.7rem', background: 'rgba(6, 182, 212, 0.15)', color: '#38bdf8', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>
                  Metric: 4.2M Daily
                </span>
                <span style={{ fontSize: '0.7rem', background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>
                  Scale: 99.99% Uptime
                </span>
                <span style={{ fontSize: '0.7rem', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>
                  Action: Architected
                </span>
              </div>
            </div>
          </div>

          {/* Floating Pill Status */}
          <div className="landing-page__showcase-float-badge">
            <Zap size={14} />
            <span>Tailored Bullets & Pitch Generated in 1.4s</span>
          </div>
        </div>
      </header>

      {/* Before vs With HireTrack AI Comparison Grid (Inspired by BillAI) */}
      <section className="landing-page__comparison">
        <div className="landing-page__comparison-header">
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>
            Why Engineers Switch
          </span>
          <h2>Stop Juggling Messy Spreadsheets</h2>
          <p>Upgrade from scattered notes and generic resumes to an automated career intelligence pipeline.</p>
        </div>

        <div className="landing-page__comparison-grid">
          {/* The Old Way */}
          <div className="landing-page__comparison-card landing-page__comparison-card--before">
            <h4 style={{ color: 'var(--text-muted)' }}>The Old Way (Spreadsheets & Manual)</h4>
            <ul>
              <li>
                <XCircle size={18} color="#f43f5e" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span style={{ color: 'var(--text-muted)' }}>Juggling 40+ spreadsheet tabs with broken links and lost notes</span>
              </li>
              <li>
                <XCircle size={18} color="#f43f5e" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span style={{ color: 'var(--text-muted)' }}>Generic bullet points filtered out by automated corporate ATS systems</span>
              </li>
              <li>
                <XCircle size={18} color="#f43f5e" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span style={{ color: 'var(--text-muted)' }}>Missing interview rounds, prep notes, and critical follow-up deadlines</span>
              </li>
              <li>
                <XCircle size={18} color="#f43f5e" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span style={{ color: 'var(--text-muted)' }}>Applying blindly without knowing compensation, culture, or stack fit</span>
              </li>
            </ul>
          </div>

          {/* Center Switch Badge */}
          <div className="landing-page__comparison-divider">
            <div className="landing-page__comparison-divider-icon">
              <ArrowRight size={20} />
            </div>
            <span>Switch in 2 Min</span>
          </div>

          {/* The HireTrack Way */}
          <div className="landing-page__comparison-card landing-page__comparison-card--after">
            <div className="landing-page__comparison-badge">
              AI Cockpit
            </div>
            <h4 style={{ color: 'var(--primary)' }}>With HireTrack AI</h4>
            <ul>
              <li>
                <CheckCircle2 size={18} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                  High-impact formula rewrites delivering quantifiable metrics in 10 seconds
                </span>
              </li>
              <li>
                <CheckCircle2 size={18} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                  Target JD keyword calibration & weak-verb audit for 90%+ ATS match
                </span>
              </li>
              <li>
                <CheckCircle2 size={18} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                  1-click Google Calendar & .ics export for all interview deadlines
                </span>
              </li>
              <li>
                <CheckCircle2 size={18} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                  Multi-objective Company Fit algorithm (Stack, Culture, Difficulty, Comp)
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Curated 6-Feature Grid (3x2) with Rotating Hover Icons */}
      <section className="landing-page__features-container">
        <div className="landing-page__features-container-header">
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>
            Engineered For Results
          </span>
          <h2>Everything You Need in One Unified Suite</h2>
          <p>Built specifically for software engineers seeking high-impact, non-generic career acceleration.</p>
        </div>

        <div className="landing-page__features-grid">
          {/* Feature 1 */}
          <div className="landing-page__feature-card" onClick={() => navigate('/tailor')}>
            <div className="landing-page__feature-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <Sparkles size={22} />
            </div>
            <h3>High-Impact Bullet Optimizer</h3>
            <p>
              Transform weak bullets into high-scale achievements. Generates 3 variations per bullet with quantifiable metrics and zero passive voice.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="landing-page__feature-card" onClick={() => navigate('/optimizer')}>
            <div className="landing-page__feature-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#06B6D4' }}>
              <Brain size={22} />
            </div>
            <h3>Company Fit Scoring</h3>
            <p>
              Multi-objective algorithmic scoring balancing tech stack, target salary, culture, and interview difficulty to identify your Dream, Target, and Safe tiers.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="landing-page__feature-card" onClick={() => navigate(user ? '/dashboard' : '/register')}>
            <div className="landing-page__feature-icon" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#A855F7' }}>
              <BarChart3 size={22} />
            </div>
            <h3>Interview Pipeline & Timeline</h3>
            <p>
              Monitor rounds with visual urgency cadences, completion rings, and 1-click Google Calendar & .ics sync for all your preparation deadlines.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="landing-page__feature-card" onClick={() => navigate(user ? '/contacts' : '/register')}>
            <div className="landing-page__feature-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981' }}>
              <Network size={22} />
            </div>
            <h3>Referral Network & Graph</h3>
            <p>
              Manage recruiter and employee referral connections with many-to-many application tracking and automated Gmail follow-up drafting.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="landing-page__feature-card" onClick={() => navigate('/tailor')}>
            <div className="landing-page__feature-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
              <Target size={22} />
            </div>
            <h3>ATS Keyword Gap Audit</h3>
            <p>
              Paste target job descriptions to uncover missing high-priority skills, calibrate match ratios, and craft tailored cover letters with a single click.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="landing-page__feature-card" onClick={() => navigate(user ? '/dashboard' : '/register')}>
            <div className="landing-page__feature-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
              <Lock size={22} />
            </div>
            <h3>Cloud Sync & Privacy</h3>
            <p>
              Enterprise-grade encryption with instant multi-device cloud synchronization and complete personal data privacy.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Live Bullet Demo Section */}
      <section className="landing-page__demo">
        <div className="landing-page__demo-header">
          <div>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Interactive Live Demo
            </span>
            <h3 style={{ margin: '4px 0 0', fontSize: '1.25rem', color: 'var(--text-primary)' }}>
              Test the Impact Formula Live
            </h3>
          </div>
          <button
            className="btn btn--secondary btn--sm"
            onClick={() => handleCopyDemo(demoVariations[demoSelectedVariation].text)}
          >
            {demoCopied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
            <span>{demoCopied ? 'Copied!' : 'Copy Power Bullet'}</span>
          </button>
        </div>

        <div style={{ background: 'var(--bg-input)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-subtle)', marginBottom: '16px' }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#f43f5e', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '4px' }}>
            Original Weak Bullet Point:
          </span>
          <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            &quot;Responsible for building backend APIs in Node.js and helped optimize some SQL database queries.&quot;
          </p>
        </div>

        {/* Variation Selector Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
          {demoVariations.map((v, i) => (
            <button
              key={v.badge}
              type="button"
              className={`btn btn--sm ${demoSelectedVariation === i ? 'btn--primary' : 'btn--secondary'}`}
              onClick={() => setDemoSelectedVariation(i)}
              style={{ fontSize: '0.78rem' }}
            >
              {v.label}
            </button>
          ))}
        </div>

        {/* Active Variation Output */}
        <div style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.35)', padding: '16px 20px', borderRadius: '12px', fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
          {demoVariations[demoSelectedVariation].text}
        </div>
      </section>

      {/* Clean FAQ Section (Accordion) */}
      <section className="landing-page__faq">
        <div className="landing-page__faq-header">
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>
            Frequently Asked Questions
          </span>
          <h2>Common Questions, Answered</h2>
        </div>

        <div className="landing-page__faq-list">
          {faqs.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={faq.q}
                className={`landing-page__faq-item ${isOpen ? 'landing-page__faq-item--open' : ''}`}
              >
                <button
                  type="button"
                  className="landing-page__faq-item-question"
                  onClick={() => toggleFaq(index)}
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={18}
                    style={{
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
                      transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                      color: isOpen ? 'var(--primary)' : 'var(--text-muted)',
                    }}
                  />
                </button>
                {isOpen && <div className="landing-page__faq-item-answer">{faq.a}</div>}
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-page__footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BrandLogo size={26} onClick={() => navigate('/')} />
          <span>© {new Date().getFullYear()} HireTrack AI · All rights reserved.</span>
        </div>
        <div className="landing-page__footer-links">
          <a href="/optimizer" onClick={(e) => { e.preventDefault(); navigate('/optimizer'); }}>Company Fit</a>
          <a href="/tailor" onClick={(e) => { e.preventDefault(); navigate('/tailor'); }}>Resume Suite</a>
          <a href="/login" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>Sign In</a>
          <a href="/register" onClick={(e) => { e.preventDefault(); navigate('/register'); }}>Get Started Free</a>
        </div>
      </footer>
    </div>
  );
};
