import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserCheck, Sparkles, ArrowRight, Shield, BarChart3, Brain, Network } from 'lucide-react';
import { BrandLogo } from '../components/common/BrandLogo';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleOpenFitScorer = () => {
    navigate('/optimizer');
  };

  const handleOpenTracker = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="landing-page">
      <nav className="landing-page__nav">
        <BrandLogo size={36} onClick={() => navigate('/')} />
        <div className="landing-page__nav-actions">
          <button className="btn btn--ghost btn--sm" onClick={() => navigate('/login')}>
            Sign In
          </button>
          <button className="btn btn--primary btn--sm" onClick={() => navigate('/register')}>
            Get Started Free
            <ArrowRight size={14} />
          </button>
        </div>
      </nav>

      <main className="landing-page__hero">
        <div className="landing-page__hero-glow" />
        <div className="landing-page__hero-content">
          <div className="landing-page__badge">
            <Sparkles size={14} />
            <span>AI-Powered Career Intelligence</span>
          </div>

          <h1 className="landing-page__title">
            AI-Powered Job Hunt
            <span className="landing-page__title-gradient"> Command Center</span>
          </h1>

          <p className="landing-page__subtitle">
            Engineered for modern software engineers and technical professionals. Evaluate fit for any company you
            add, track interview loops, manage referral networks, and sync deadlines directly with Google Calendar
            and Gmail.
          </p>

          <div className="landing-page__cta-group">
            <button className="btn btn--primary landing-page__cta" onClick={handleOpenFitScorer}>
              <Sparkles size={16} />
              <span>Explore Company Fit AI</span>
            </button>
            <button className="btn btn--secondary landing-page__cta" onClick={handleOpenTracker}>
              <UserCheck size={16} />
              <span>Launch Application Pipeline</span>
            </button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="landing-page__features">
          <div className="landing-page__feature-card">
            <div className="landing-page__feature-icon" style={{ background: 'rgba(99, 102, 241, 0.15)' }}>
              <Brain size={22} color="#6366F1" />
            </div>
            <h3>AI Company Fit Scoring</h3>
            <p>
              Multi-objective algorithmic scoring matching tech stack, target comp, culture, and difficulty to
              build an optimal Dream/Target/Safe strategy.
            </p>
          </div>

          <div className="landing-page__feature-card">
            <div className="landing-page__feature-icon" style={{ background: 'rgba(6, 182, 212, 0.15)' }}>
              <BarChart3 size={22} color="#06B6D4" />
            </div>
            <h3>Interview Pipeline & Timeline</h3>
            <p>
              Monitor rounds with visual urgency cadences, completion rings, and 1-click Google Calendar & .ics
              export for all your deadlines.
            </p>
          </div>

          <div className="landing-page__feature-card">
            <div className="landing-page__feature-icon" style={{ background: 'rgba(168, 85, 247, 0.15)' }}>
              <Network size={22} color="#A855F7" />
            </div>
            <h3>Referral Graph & Outreach</h3>
            <p>
              Manage recruiter and employee referral connections with many-to-many application tracking and
              automated Gmail follow-up drafting.
            </p>
          </div>

          <div className="landing-page__feature-card">
            <div className="landing-page__feature-icon" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
              <Shield size={22} color="#10B981" />
            </div>
            <h3>Secure 3-Tier Cloud Architecture</h3>
            <p>
              Production-grade PostgreSQL Row-Level Security via Supabase with fallback local sandbox and complete
              privacy controls.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
