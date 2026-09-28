import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Grid3X3, Users, Briefcase, Sparkles, FileText } from 'lucide-react';
import { useData } from '../../context/DataContext';

export const TabNav: React.FC = () => {
  const { jobs, contacts } = useData();

  const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `tab-nav__button ${isActive ? 'tab-nav__button--active' : ''}`;

  return (
    <nav className="tab-nav" aria-label="Main Navigation">
      <NavLink to="/dashboard" className={getNavLinkClass}>
        <LayoutDashboard size={16} />
        <span>Dashboard</span>
      </NavLink>

      <NavLink to="/optimizer" className={getNavLinkClass}>
        <Sparkles size={16} />
        <span>Company Fit AI</span>
      </NavLink>

      <NavLink to="/tailor" className={getNavLinkClass}>
        <FileText size={16} />
        <span>Resume Tailor</span>
      </NavLink>

      <NavLink to="/jobs" className={getNavLinkClass}>
        <Briefcase size={16} />
        <span>Applications ({jobs.length})</span>
      </NavLink>

      <NavLink to="/contacts" className={getNavLinkClass}>
        <Users size={16} />
        <span>Referrals ({contacts.length})</span>
      </NavLink>

      <NavLink to="/matrix" className={getNavLinkClass}>
        <Grid3X3 size={16} />
        <span>Pipeline Matrix</span>
      </NavLink>
    </nav>
  );
};
