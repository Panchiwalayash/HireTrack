import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ArrowRight, Sparkles, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { BrandLogo } from '../components/common/BrandLogo';

export const LoginPage: React.FC = () => {
  const { isSupabaseConfigured, signInWithEmail, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const res = await signInWithEmail(email, password);
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        navigate(redirectUrl);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle(redirectUrl);
    } catch (err: any) {
      setErrorMsg(err.message || 'Google sign-in failed');
    }
  };

  return (
    <div className="auth-page">
      {/* Left side: Hero */}
      <div className="auth-page__hero">
        <div className="auth-page__hero-content">
          <div className="auth-page__hero-logo">
            <BrandLogo size={42} showText={false} />
          </div>
          <h1 className="auth-page__hero-title">HireTrack AI</h1>
          <p className="auth-page__hero-subtitle">AI-Powered Job Hunt Command Center</p>
          <div className="auth-page__hero-features">
            <div className="auth-page__hero-feature">
              <ShieldCheck size={18} />
              <span>Track applications, technical rounds & referral pipelines</span>
            </div>
            <div className="auth-page__hero-feature">
              <Sparkles size={18} />
              <span>AI-driven company culture fit & resume alignment scoring</span>
            </div>
          </div>
        </div>
        <div className="auth-page__hero-glow" />
      </div>

      {/* Right side: Form */}
      <div className="auth-page__form-section">
        <div className="auth-page__form-container">
          <div className="auth-page__form-header">
            <h2>Welcome Back</h2>
            <p>Sign in to your HireTrack account</p>
          </div>


          {errorMsg && <div className="auth-page__error">{errorMsg}</div>}

          <form onSubmit={handleSubmit} className="auth-page__form">
            <div className="form-group">
              <label htmlFor="login-email">Email Address</label>
              <div className="auth-page__input-wrapper">
                <Mail size={16} className="auth-page__input-icon" />
                <input
                  id="login-email"
                  className="input"
                  type="email"
                  required
                  placeholder="engineer@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '40px' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="login-password">Password</label>
              <div className="auth-page__input-wrapper">
                <Lock size={16} className="auth-page__input-icon" />
                <input
                  id="login-password"
                  className="input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '40px', paddingRight: '40px' }}
                />
                <button
                  type="button"
                  className="auth-page__password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn--primary auth-page__submit-btn" disabled={isSubmitting}>
              <span>{isSubmitting ? 'Signing in...' : 'Sign In'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Google OAuth */}
          {isSupabaseConfigured && (
            <>
              <div className="auth-page__divider">
                <span>or continue with</span>
              </div>
              <button
                type="button"
                className="btn btn--secondary auth-page__google-btn"
                onClick={handleGoogleLogin}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>
            </>
          )}

          {/* Standalone Free AI Tools Card (No Account Required) */}
          <div className="auth-page__free-tool-box">
            <div className="auth-page__free-tool-badge">
              <Sparkles size={13} />
              <span>Free Public Access</span>
            </div>
            <p className="auth-page__free-tool-text">
              Want to explore before signing up? You can test our free AI career tools with zero sign-in required.
            </p>
            <Link to="/ai-fit" className="btn btn--secondary auth-page__ai-fit-btn">
              <Sparkles size={16} color="#6366f1" />
              <span>Explore Free AI Tools</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <p className="auth-page__switch-link">
            Don't have an account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
