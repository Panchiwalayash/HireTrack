import React from 'react';
import { useData } from '../context/DataContext';
import { QuickStats } from '../components/dashboard/QuickStats';
import { NeedsAttention } from '../components/dashboard/NeedsAttention';
import { ProgressRings } from '../components/dashboard/ProgressRings';
import { DeadlineTimeline } from '../components/dashboard/DeadlineTimeline';
import { Briefcase, Plus, Users, Compass } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { jobs, tasks, handleUpdateTaskStatus } = useData();
  const navigate = useNavigate();

  return (
    <div>
      <div className="section-title-bar" style={{ marginBottom: '20px' }}>
        <div>
          <h2>Job Hunt Command Center</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Real-time pipeline tracking for interview stages, technical prep milestones, and recruiter referrals
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button className="btn btn--secondary btn--sm" onClick={() => navigate('/contacts')}>
            <Users size={14} />
            <span>Network & Referrals</span>
          </button>
          <button className="btn btn--secondary btn--sm" onClick={() => navigate('/jobs')}>
            <Briefcase size={14} />
            <span>All Applications</span>
          </button>
        </div>
      </div>
      <QuickStats jobs={jobs} tasks={tasks} />
      <NeedsAttention
        jobs={jobs}
        tasks={tasks}
        onMarkTaskDone={(id: string) => handleUpdateTaskStatus(id, 'done')}
      />
      <ProgressRings
        jobs={jobs}
        tasks={tasks}
        onSelectJob={() => navigate('/jobs')}
        onEditJob={(job) => navigate(`/jobs/${job.id}/edit`)}
      />
      <DeadlineTimeline jobs={jobs} onSelectJob={() => navigate('/jobs')} />

      {jobs.length === 0 && (
        <div className="empty-state">
          <div className="empty-state__icon">
            <Briefcase size={28} />
          </div>
          <h3 className="empty-state__title">Ready to Accelerate Your Career?</h3>
          <p className="empty-state__desc">
            Track your target companies, technical interview stages, and recruiter contacts all in one place.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button className="btn btn--primary" onClick={() => navigate('/jobs/new')}>
              <Plus size={16} />
              <span>Track First Application</span>
            </button>
            <button className="btn btn--secondary" onClick={() => navigate('/optimizer')}>
              <Compass size={16} />
              <span>Explore Company Fit AI</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
