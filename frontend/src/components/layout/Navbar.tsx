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
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useData } from '../../context/DataContext';

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
          <div
            className="navbar__brand"
            onClick={() => {
              closeMobile();
              navigate(user ? '/dashboard' : '/optimizer');
            }}
            style={{ cursor: 'pointer' }}
            title={user ? 'HireTrack AI Dashboard' : 'HireTrack AI Strategy Engine'}
          >
            <div className="navbar__brand-icon">
              <Briefcase size={22} />
            </div>
            <div>
              <div className="navbar__brand-title">HireTrack AI</div>
              <div className="navbar__brand-subtitle">Job Hunt OS</div>
            </div>
          </div>

          {/* Unified Desktop Navigation Bar */}
          <nav className="navbar__nav" aria-label="Primary Navigation">
            <NavLink
              to="/dashboard"
              className={({ isActive }) => `navbar__nav-link ${isActive ? 'navbar__nav-link--active' : ''}`}
            >
              <LayoutDashboard size={14} />
              <span>Dashboard</span>
            </NavLink>

            <NavLink
              to="/optimizer"
              className={({ isActive }) => `navbar__nav-link ${isActive ? 'navbar__nav-link--active' : ''}`}
            >
              <Sparkles size={14} color="var(--primary)" />
              <span>Company Fit AI</span>
            </NavLink>

            <NavLink
              to="/jobs"
              className={({ isActive }) => `navbar__nav-link ${isActive ? 'navbar__nav-link--active' : ''}`}
            >
              <Briefcase size={14} />
              <span>Applications {user ? `(${jobs.length})` : ''}</span>
            </NavLink>

            <NavLink
              to="/contacts"
              className={({ isActive }) => `navbar__nav-link ${isActive ? 'navbar__nav-link--active' : ''}`}
            >
              <Users size={14} />
              <span>Referrals {user ? `(${contacts.length})` : ''}</span>
            </NavLink>

            <NavLink
              to="/matrix"
              className={({ isActive }) => `navbar__nav-link ${isActive ? 'navbar__nav-link--active' : ''}`}
            >
              <Grid3X3 size={14} />
              <span>Pipeline Matrix</span>
            </NavLink>
          </nav>
        </div>

        {/* Desktop Global Controls & Actions */}
        <div className="navbar__actions">
          {/* Theme Toggle (Light / Dark) */}
          <button
            className="btn btn--ghost btn--sm"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            aria-label="Toggle theme"
            style={{ padding: '6px 10px' }}
          >
            {theme === 'dark' ? <Sun size={15} color="#F59E0B" /> : <Moon size={15} color="#6366F1" />}
            <span style={{ fontSize: '0.78rem', textTransform: 'capitalize' }}>
              {theme === 'dark' ? 'Light' : 'Dark'}
            </span>
          </button>

          {user ? (
            <div className="user-pill">
              <div className="user-pill__avatar">{user.email ? user.email.charAt(0).toUpperCase() : 'U'}</div>
              <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</span>
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
            <>
              <button className="btn btn--secondary btn--sm" onClick={handleAuthClick}>
                <Key size={14} />
                <span>Sign In</span>
              </button>
              <button className="btn btn--primary btn--sm" onClick={() => navigate('/register')}>
                <UserPlus size={14} />
                <span>Create Account</span>
              </button>
            </>
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
          <div
            className="navbar__brand"
            onClick={() => {
              closeMobile();
              navigate(user ? '/dashboard' : '/optimizer');
            }}
            style={{ cursor: 'pointer' }}
          >
            <div className="navbar__brand-icon" style={{ width: '32px', height: '32px' }}>
              <Briefcase size={18} />
            </div>
            <div>
              <div className="navbar__brand-title" style={{ fontSize: '1.05rem' }}>
                HireTrack AI
              </div>
              <div className="navbar__brand-subtitle" style={{ fontSize: '0.62rem' }}>
                Job Hunt OS
              </div>
            </div>
          </div>
          <button
            className="btn btn--ghost btn--sm"
            onClick={closeMobile}
            style={{ padding: '6px' }}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Mobile Navigation Links */}
        <nav className="navbar__mobile-drawer-nav">
          <NavLink
            to="/optimizer"
            onClick={closeMobile}
            className={({ isActive }) =>
              `navbar__mobile-drawer-link ${isActive ? 'navbar__mobile-drawer-link--active' : ''}`
            }
          >
            <Sparkles size={18} color="var(--primary)" />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 600 }}>Company Fit AI</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Tech Match & Strategy Engine</span>
            </div>
          </NavLink>

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
            <span>Applications {user ? `(${jobs.length})` : ''}</span>
          </NavLink>

          <NavLink
            to="/contacts"
            onClick={closeMobile}
            className={({ isActive }) =>
              `navbar__mobile-drawer-link ${isActive ? 'navbar__mobile-drawer-link--active' : ''}`
            }
          >
            <Users size={18} />
            <span>Network & Referrals {user ? `(${contacts.length})` : ''}</span>
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
        </nav>

        {/* Mobile Drawer Actions & User Auth */}
        <div className="navbar__mobile-drawer-actions">
          {user ? (
            <>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  marginBottom: '8px',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #A855F7, #6366F1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                  }}
                >
                  {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Signed In</div>
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
                  style={{ padding: '4px 8px' }}
                >
                  <LogOut size={15} />
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                className="btn btn--primary"
                onClick={() => {
                  closeMobile();
                  navigate('/register');
                }}
                style={{ width: '100%', justifyContent: 'center' }}
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
                style={{ width: '100%', justifyContent: 'center' }}
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
