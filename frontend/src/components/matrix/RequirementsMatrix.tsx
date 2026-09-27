import React, { useState } from 'react';
import type { Job, Task, TaskType, TaskStatus } from '../../models';
import { Check, Clock, Plus, Search, Grid, LayoutList, MoveHorizontal, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Link } from 'react-router-dom';

interface RequirementsMatrixProps {
  jobs: Job[];
  tasks: Task[];
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  onAddTask: (jobId: string, type: TaskType) => void;
  onSelectJob: (job: Job) => void;
}

const TASK_COLUMNS: { type: TaskType; label: string }[] = [
  { type: 'Resume', label: 'Resume' },
  { type: 'Cover_Letter', label: 'Cover Letter' },
  { type: 'Coding_Challenge', label: 'Coding / OA' },
  { type: 'System_Design', label: 'System Design' },
  { type: 'Behavioral', label: 'Behavioral' },
  { type: 'Take_Home', label: 'Take-Home' },
  { type: 'Negotiation', label: 'Offer / Neg.' },
];

export const RequirementsMatrix: React.FC<RequirementsMatrixProps> = ({
  jobs,
  tasks,
  onUpdateTaskStatus,
  onAddTask,
  onSelectJob,
}) => {
  const [search, setSearch] = useState('');
  const [mobileMode, setMobileMode] = useState<'cards' | 'table'>('cards');

  const filteredJobs = jobs.filter(
    (j) =>
      j.company.toLowerCase().includes(search.toLowerCase()) ||
      j.role.toLowerCase().includes(search.toLowerCase()),
  );

  const cycleStatus = (task: Task) => {
    const nextMap: Record<TaskStatus, TaskStatus> = {
      not_started: 'in_progress',
      in_progress: 'done',
      done: 'not_started',
    };
    const nextStatus = nextMap[task.status];
    if (nextStatus === 'done') {
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#10B981', '#06B6D4'],
      });
    }
    onUpdateTaskStatus(task.id, nextStatus);
  };

  return (
    <div
      className={`matrix-container ${
        mobileMode === 'cards' ? 'matrix-container--cards-mode' : 'matrix-container--table-mode'
      }`}
    >
      <div className="section-title-bar" style={{ marginBottom: '18px' }}>
        <div>
          <h2>Pipeline Stages & Preparation Matrix</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginTop: '2px' }}>
            Cross-company interview stage tracker. Click any cell to cycle status (Not Started → In Progress → Done).
          </p>
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '280px' }}>
          <input
            type="text"
            className="input"
            style={{ paddingLeft: '32px', width: '100%' }}
            placeholder="Search company or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search
            size={14}
            style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
          />
        </div>
      </div>

      {/* Empty State */}
      {filteredJobs.length === 0 ? (
        <div
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            background: 'var(--bg-secondary)',
            borderRadius: '12px',
            border: '1px dashed var(--border-medium)',
            margin: '8px 0',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(99, 102, 241, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
            }}
          >
            <Sparkles size={24} color="#6366F1" />
          </div>
          <h3 style={{ margin: '0 0 6px', fontSize: '1.1rem', fontWeight: 700 }}>
            {search ? `No jobs found matching "${search}"` : 'Your Pipeline Matrix is Empty'}
          </h3>
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '0.85rem',
              maxWidth: '440px',
              margin: '0 auto 18px',
            }}
          >
            {search
              ? 'Try searching by a different company name or role.'
              : 'Add applications to your pipeline or evaluate target companies with AI to track interview stages.'}
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/ai-fit" className="btn btn--primary btn--sm" style={{ gap: '6px' }}>
              <Sparkles size={14} />
              <span>Explore AI Company Fit</span>
            </Link>
            <Link to="/jobs/new" className="btn btn--secondary btn--sm" style={{ gap: '6px' }}>
              <Plus size={14} />
              <span>Add Custom Job</span>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Mobile View Toggle Switcher (Visible on mobile screens <= 768px) */}
          <div className="matrix-mobile-view-toggle">
            <button
              type="button"
              className={mobileMode === 'cards' ? 'active' : ''}
              onClick={() => setMobileMode('cards')}
            >
              <LayoutList size={14} />
              <span>Stage Cards View</span>
            </button>
            <button
              type="button"
              className={mobileMode === 'table' ? 'active' : ''}
              onClick={() => setMobileMode('table')}
            >
              <Grid size={14} />
              <span>Matrix Table View</span>
            </button>
          </div>

          {/* Mobile Card View (Rendered conditionally on small screens when selected) */}
          <div className="matrix-mobile-cards">
            {filteredJobs.map((job) => {
              const jobTasks = tasks.filter((t) => t.job_id === job.id);

              return (
                <div key={job.id} className="matrix-mobile-card">
                  <div className="matrix-mobile-card__header">
                    <div onClick={() => onSelectJob(job)} style={{ cursor: 'pointer' }}>
                      <div className="matrix-mobile-card__title">{job.company}</div>
                      <div className="matrix-mobile-card__role">{job.role}</div>
                    </div>
                    <span className={`badge badge--${job.status}`}>{job.status.replace('_', ' ')}</span>
                  </div>

                  <div className="matrix-mobile-card__stages-grid">
                    {TASK_COLUMNS.map((col) => {
                      const task = jobTasks.find((t) => t.type === col.type);

                      return (
                        <div key={col.type} className="matrix-mobile-card__stage-item">
                          <label>{col.label}</label>
                          {task ? (
                            <button
                              type="button"
                              onClick={() => cycleStatus(task)}
                              className={`matrix-badge matrix-badge--${task.status}`}
                              title={`Status: ${task.status}. Tap to cycle.`}
                            >
                              {task.status === 'done' && <Check size={12} />}
                              {task.status === 'in_progress' && <Clock size={12} />}
                              <span>{task.status.replace('_', ' ')}</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onAddTask(job.id, col.type)}
                              className="btn btn--ghost btn--sm"
                              style={{
                                padding: '5px 8px',
                                fontSize: '0.72rem',
                                color: 'var(--text-secondary)',
                                border: '1px dashed var(--border-subtle)',
                                width: '100%',
                                justifyContent: 'center',
                                gap: '4px',
                              }}
                            >
                              <Plus size={12} />
                              <span>Track</span>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Swipe Hint for Table View */}
          <div className="matrix-scroll-hint">
            <MoveHorizontal size={13} />
            <span>Swipe horizontally across stages · First column stays pinned</span>
          </div>

          {/* Full Matrix Table (With sticky first column) */}
          <div className="matrix-table-wrapper">
            <table className="matrix-table">
              <thead>
                <tr>
                  <th className="matrix-sticky-col matrix-sticky-col--header" style={{ minWidth: '200px' }}>
                    Target Opportunity
                  </th>
                  <th style={{ minWidth: '110px' }}>Pipeline Status</th>
                  {TASK_COLUMNS.map((col) => (
                    <th key={col.type} style={{ minWidth: '120px', textAlign: 'center' }}>
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map((job) => {
                  const jobTasks = tasks.filter((t) => t.job_id === job.id);

                  return (
                    <tr key={job.id}>
                      <td className="matrix-sticky-col" style={{ cursor: 'pointer' }} onClick={() => onSelectJob(job)}>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{job.company}</div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>{job.role}</div>
                      </td>

                      <td>
                        <span className={`badge badge--${job.status}`}>{job.status.replace('_', ' ')}</span>
                      </td>

                      {TASK_COLUMNS.map((col) => {
                        const task = jobTasks.find((t) => t.type === col.type);

                        return (
                          <td key={col.type} style={{ textAlign: 'center' }}>
                            {task ? (
                              <button
                                type="button"
                                onClick={() => cycleStatus(task)}
                                className={`matrix-badge matrix-badge--${task.status}`}
                                title={`Status: ${task.status}. Click to cycle.`}
                              >
                                {task.status === 'done' && <Check size={12} />}
                                {task.status === 'in_progress' && <Clock size={12} />}
                                <span>{task.status.replace('_', ' ')}</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => onAddTask(job.id, col.type)}
                                className="btn btn--ghost btn--sm"
                                style={{
                                  padding: '4px 8px',
                                  fontSize: '0.72rem',
                                  color: 'var(--text-secondary)',
                                  opacity: 0.7,
                                  border: '1px dashed var(--border-subtle)',
                                }}
                                title="Click to track this stage"
                              >
                                <Plus size={11} />
                                <span>Add</span>
                              </button>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};
