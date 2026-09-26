import React from 'react';
import type { Job, Task } from '../../models';
import { calculateDaysRemaining } from '../../core/utils/ranking.util';

interface QuickStatsProps {
  jobs: Job[];
  tasks: Task[];
}

export const QuickStats: React.FC<QuickStatsProps> = ({ jobs, tasks }) => {
  const totalJobs = jobs.length;
  const interviewingJobs = jobs.filter((j) => j.status === 'interviewing').length;
  const offerJobs = jobs.filter((j) => j.status === 'offer').length;

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'done').length;
  const overallPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const pendingJobs = jobs
    .filter((j) => j.status !== 'rejected' && j.status !== 'withdrawn' && j.status !== 'ghosted')
    .sort((a, b) => new Date(a.application_deadline).getTime() - new Date(b.application_deadline).getTime());

  const nextJob = pendingJobs[0];
  const nextDays = nextJob ? calculateDaysRemaining(nextJob.application_deadline) : null;

  return (
    <div className="stats-grid">
      <div className="stat-card stat-card--cyan">
        <div className="stat-card__label">Active Applications</div>
        <div className="stat-card__value">{totalJobs}</div>
        <div className="stat-card__caption">Tracked tech opportunities</div>
      </div>

      <div className="stat-card stat-card--emerald">
        <div className="stat-card__label">Tasks & Prep Done</div>
        <div className="stat-card__value">
          {completedTasks}
          <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)', fontWeight: 500 }}>/{totalTasks}</span>
        </div>
        <div className="stat-card__caption">{overallPercentage}% prep completion rate</div>
      </div>

      <div className="stat-card stat-card--amber">
        <div className="stat-card__label">In Pipeline</div>
        <div className="stat-card__value">
          {interviewingJobs}
          {offerJobs > 0 && (
            <span style={{ fontSize: '1.1rem', color: '#10B981', fontWeight: 600, marginLeft: '6px' }}>
              ({offerJobs} {offerJobs === 1 ? 'Offer' : 'Offers'}!)
            </span>
          )}
        </div>
        <div className="stat-card__caption">
          {interviewingJobs > 0 ? `${interviewingJobs} active interview loops` : 'Applications in review'}
        </div>
      </div>

      <div className="stat-card stat-card--rose">
        <div className="stat-card__label">Next Milestone</div>
        <div className="stat-card__value">
          {nextDays !== null ? (
            nextDays < 0 ? (
              <span style={{ color: '#F43F5E' }}>Overdue</span>
            ) : (
              `${nextDays}d`
            )
          ) : (
            '—'
          )}
        </div>
        <div
          className="stat-card__caption"
          style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
        >
          {nextJob ? `${nextJob.company} (${nextJob.role})` : 'All deadlines cleared!'}
        </div>
      </div>
    </div>
  );
};
