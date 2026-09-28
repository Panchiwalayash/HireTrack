import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  LogOut,
  Key,
  Sun,
  Moon,
  Sparkles,
  LayoutDashboard,
  Grid3X3,
  Users,
  Menu,
  X,
  UserPlus,
  Home,
  FileText,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useData } from '../../context/DataContext';
import { BrandLogo } from '../common/BrandLogo';

interface NavbarProps {
  onOpenAuth?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth }) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { jobs, contacts } = useData();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobile = () => setMobileMenuOpen(false);

  const handleAuthClick = () => {
    closeMobile();
    if (onOpenAuth) {
      onOpenAuth();
    } else {
      navigate('/login');
    }
  };

  const handleSignOut = async () => {
    closeMobile();
    await signOut();
  };

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <div className="navbar__left">
          {/* Brand Logo & Title */}
          <BrandLogo
            size={34}
            onClick={() => {
              closeMobile();
              navigate(user ? '/dashboard' : '/optimizer');
            }}
          />

          {/* Desktop Navigation */}
          <nav className="navbar__nav" aria-label="Primary Navigation">
            {user ? (
              // Logged-in full application suite
              <>
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) => `navbar__nav-link ${isActive ? 'navbar__nav-link--active' : ''}`}
                >
                  <LayoutDashboard size={15} />
                  <span>Dashboard</span>
                </NavLink>

                <NavLink
                  to="/jobs"
                  className={({ isActive }) => `navbar__nav-link ${isActive ? 'navbar__nav-link--active' : ''}`}
                >
                  <Briefcase size={15} />
                  <span>
                    <span className="nav-text-full">Applications {jobs.length > 0 ? `(${jobs.length})` : ''}</span>
                    <span className="nav-text-short">Jobs {jobs.length > 0 ? `(${jobs.length})` : ''}</span>
                  </span>
                </NavLink>

                <NavLink
                  to="/optimizer"
                  className={({ isActive }) => `navbar__nav-link ${isActive ? 'navbar__nav-link--active' : ''}`}
                >
                  <Sparkles size={15} className="navbar__ai-icon" />
                  <span>
                    <span className="nav-text-full">AI Company Fit</span>
                    <span className="nav-text-short">Company Fit</span>
                  </span>
                  <span className="navbar__badge-free">FREE</span>
                </NavLink>

                <NavLink
                  to="/tailor"
                  className={({ isActive }) => `navbar__nav-link ${isActive ? 'navbar__nav-link--active' : ''}`}
                >
                  <FileText size={15} />
                  <span>
                    <span className="nav-text-full">Resume & Cover Letter</span>
                    <span className="nav-text-short">Resume Suite</span>
                  </span>
                </NavLink>

                <NavLink
                  to="/contacts"
                  className={({ isActive }) => `navbar__nav-link ${isActive ? 'navbar__nav-link--active' : ''}`}
                >
                  <Users size={15} />
                  <span>
                    <span className="nav-text-full">Referrals {contacts.length > 0 ? `(${contacts.length})` : ''}</span>
                    <span className="nav-text-short">Network {contacts.length > 0 ? `(${contacts.length})` : ''}</span>
                  </span>
                </NavLink>

                <NavLink
                  to="/matrix"
                  className={({ isActive }) => `navbar__nav-link ${isActive ? 'navbar__nav-link--active' : ''}`}
                >
                  <Grid3X3 size={15} />
                  <span>
                    <span className="nav-text-full">Pipeline Matrix</span>
                    <span className="nav-text-short">Matrix</span>
                  </span>
                </NavLink>
              </>
            ) : (
              // Unauthenticated visitor: Clean, public, accessible tools only!
              <>
                <NavLink
                  to="/optimizer"
                  className={({ isActive }) => `navbar__nav-link ${isActive ? 'navbar__nav-link--active' : ''}`}
                >
                  <Sparkles size={15} className="navbar__ai-icon" />
                  <span style={{ fontWeight: 600 }}>
                    <span className="nav-text-full">AI Company Fit</span>
                    <span className="nav-text-short">Company Fit</span>
                  </span>
                  <span className="navbar__badge-free">FREE TOOL</span>
                </NavLink>

                <NavLink
                  to="/tailor"
                  className={({ isActive }) => `navbar__nav-link ${isActive ? 'navbar__nav-link--active' : ''}`}
                >
                  <FileText size={15} />
                  <span style={{ fontWeight: 600 }}>
                    <span className="nav-text-full">Resume & Cover Letter</span>
                    <span className="nav-text-short">Resume Suite</span>
                  </span>
                  <span className="navbar__badge-free">FREE</span>
                </NavLink>

                <NavLink
                  to="/"
                  className={({ isActive }) => `navbar__nav-link ${isActive ? 'navbar__nav-link--active' : ''}`}
                >
                  <Home size={15} />
                  <span>
                    <span className="nav-text-full">Overview & Features</span>
                    <span className="nav-text-short">Features</span>
                  </span>
                </NavLink>
              </>
            )}
          </nav>
        </div>

        {/* Desktop Global Controls & Actions */}
        <div className="navbar__actions">
          {/* Theme Toggle (Light / Dark) */}
          <button
            className="btn btn--ghost btn--sm theme-toggle-btn"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={15} color="#F59E0B" /> : <Moon size={15} color="#6366F1" />}
            <span className="theme-toggle-label">{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>

          {user ? (
            <div className="user-pill">
              <div className="user-pill__avatar">{user.email ? user.email.charAt(0).toUpperCase() : 'U'}</div>
              <span className="user-pill__email">{user.email}</span>
              <button
                className="btn btn--ghost btn--sm"
                style={{ padding: '2px 6px', margin: 0 }}
                onClick={handleSignOut}
                title="Sign out"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <div className="navbar__auth-group">
              <button className="btn btn--secondary btn--sm" onClick={handleAuthClick}>
                <Key size={14} />
                <span>Sign In</span>
              </button>
              <button className="btn btn--primary btn--sm" onClick={() => navigate('/register')}>
                <UserPlus size={14} />
                <span>
                  <span className="nav-text-full">Get Started Free</span>
                  <span className="nav-text-short">Get Started</span>
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Mobile Actions Header (Visible on screens <= 960px) */}
        <div className="navbar__mobile-actions">
          <button
            className="btn btn--ghost btn--sm"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            aria-label="Toggle theme"
            style={{ padding: '6px 8px' }}
          >
            {theme === 'dark' ? <Sun size={16} color="#F59E0B" /> : <Moon size={16} color="#6366F1" />}
          </button>

          <button
            className="navbar__hamburger"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay Backdrop */}
      {mobileMenuOpen && <div className="navbar__mobile-backdrop" onClick={closeMobile} aria-hidden="true" />}

      {/* Mobile Slide-out Drawer */}
      <aside className={`navbar__mobile-drawer ${mobileMenuOpen ? 'navbar__mobile-drawer--open' : ''}`}>
        <div className="navbar__mobile-drawer-header">
          <BrandLogo
            size={30}
            onClick={() => {
              closeMobile();
              navigate(user ? '/dashboard' : '/optimizer');
            }}
          />
          <button
            className="btn btn--ghost btn--sm"
            onClick={closeMobile}
            style={{ padding: '6px' }}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Mobile Navigation Links */}
        <nav className="navbar__mobile-drawer-nav">
          {user ? (
            // Logged-in Mobile Links
            <>
              <NavLink
                to="/dashboard"
                onClick={closeMobile}
                className={({ isActive }) =>
                  `navbar__mobile-drawer-link ${isActive ? 'navbar__mobile-drawer-link--active' : ''}`
                }
              >
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </NavLink>

              <NavLink
                to="/jobs"
                onClick={closeMobile}
                className={({ isActive }) =>
                  `navbar__mobile-drawer-link ${isActive ? 'navbar__mobile-drawer-link--active' : ''}`
                }
              >
                <Briefcase size={18} />
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <span>Applications</span>
                  {jobs.length > 0 && <span className="badge badge--primary">{jobs.length}</span>}
                </div>
              </NavLink>

              <NavLink
                to="/optimizer"
                onClick={closeMobile}
                className={({ isActive }) =>
                  `navbar__mobile-drawer-link ${isActive ? 'navbar__mobile-drawer-link--active' : ''}`
                }
              >
                <Sparkles size={18} className="navbar__ai-icon" />
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <span>AI Company Fit</span>
                  <span className="navbar__badge-free">FREE</span>
                </div>
              </NavLink>

              <NavLink
                to="/tailor"
                onClick={closeMobile}
                className={({ isActive }) =>
                  `navbar__mobile-drawer-link ${isActive ? 'navbar__mobile-drawer-link--active' : ''}`
                }
              >
                <FileText size={18} />
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <span>Resume & Cover Letter</span>
                </div>
              </NavLink>

              <NavLink
                to="/contacts"
                onClick={closeMobile}
                className={({ isActive }) =>
                  `navbar__mobile-drawer-link ${isActive ? 'navbar__mobile-drawer-link--active' : ''}`
                }
              >
                <Users size={18} />
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <span>Referrals & Network</span>
                  {contacts.length > 0 && <span className="badge badge--neutral">{contacts.length}</span>}
                </div>
              </NavLink>

              <NavLink
                to="/matrix"
                onClick={closeMobile}
                className={({ isActive }) =>
                  `navbar__mobile-drawer-link ${isActive ? 'navbar__mobile-drawer-link--active' : ''}`
                }
              >
                <Grid3X3 size={18} />
                <span>Pipeline Matrix</span>
              </NavLink>
            </>
          ) : (
            // Unauthenticated Mobile Links
            <>
              <NavLink
                to="/optimizer"
                onClick={closeMobile}
                className={({ isActive }) =>
                  `navbar__mobile-drawer-link ${isActive ? 'navbar__mobile-drawer-link--active' : ''}`
                }
              >
                <Sparkles size={18} className="navbar__ai-icon" />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 600 }}>AI Company Fit</span>
                    <span className="navbar__badge-free">FREE</span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Live Career Scraper & Match Scorer
                  </span>
                </div>
              </NavLink>

              <NavLink
                to="/tailor"
                onClick={closeMobile}
                className={({ isActive }) =>
                  `navbar__mobile-drawer-link ${isActive ? 'navbar__mobile-drawer-link--active' : ''}`
                }
              >
                <FileText size={18} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 600 }}>Resume & Cover Letter</span>
                    <span className="navbar__badge-free">FREE</span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Action-Impact Bullets, ATS Audit & Cover Letter
                  </span>
                </div>
              </NavLink>

              <NavLink
                to="/"
                onClick={closeMobile}
                className={({ isActive }) =>
                  `navbar__mobile-drawer-link ${isActive ? 'navbar__mobile-drawer-link--active' : ''}`
                }
              >
                <Home size={18} />
                <span>Product Overview</span>
              </NavLink>
            </>
          )}
        </nav>

        {/* Mobile Drawer Actions & User Auth */}
        <div className="navbar__mobile-drawer-actions">
          {user ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 14px',
                borderRadius: '12px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366F1, #06B6D4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                }}
              >
                {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Signed in as</div>
                <div
                  style={{
                    fontSize: '0.82rem',
                    color: 'var(--text-primary)',
                    fontWeight: 600,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {user.email}
                </div>
              </div>
              <button
                className="btn btn--ghost btn--sm"
                onClick={handleSignOut}
                title="Sign out"
                style={{ padding: '6px 8px' }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                className="btn btn--primary"
                onClick={() => {
                  closeMobile();
                  navigate('/register');
                }}
                style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
              >
                <UserPlus size={16} />
                <span>Create Free Account</span>
              </button>
              <button
                className="btn btn--secondary"
                onClick={() => {
                  closeMobile();
                  navigate('/login');
                }}
                style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
              >
                <Key size={16} />
                <span>Sign In</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </header>
  );
};
