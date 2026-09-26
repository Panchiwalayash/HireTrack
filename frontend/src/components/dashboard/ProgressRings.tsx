import React from 'react';
import type { Job, Task } from '../../models';
import { calculateJobCompletionPercentage, calculateDaysRemaining } from '../../core/utils/ranking.util';
import { ExternalLink, Check, Clock, Edit2 } from 'lucide-react';

interface ProgressRingsProps {
  jobs: Job[];
  tasks: Task[];
  onSelectJob: (job: Job) => void;
  onEditJob: (job: Job) => void;
}

const RING_RADIUS = 36;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const RING_COLOR = {
  complete: '#10B981',
  high: '#06B6D4',
  medium: '#6366F1',
  low: '#A855F7',
};

export const ProgressRings: React.FC<ProgressRingsProps> = ({ jobs, tasks, onSelectJob, onEditJob }) => {
  if (jobs.length === 0) {
    return null;
  }

  const RADIUS = RING_RADIUS;
  const CIRCUMFERENCE = RING_CIRCUMFERENCE;

  const getRingColor = (percent: number) => {
    if (percent === 100) return RING_COLOR.complete;
    if (percent >= 60) return RING_COLOR.high;
    if (percent >= 30) return RING_COLOR.medium;
    return RING_COLOR.low;
  };

  return (
    <section style={{ marginBottom: '36px' }}>
      <div className="section-title-bar">
        <div>
          <h2>Application Prep Rings</h2>
          <p style={{ color: '#94A3B8', fontSize: '0.85rem' }}>
            Interview readiness and stage checklist completion per tracked company
          </p>
        </div>
      </div>

      <div className="rings-grid">
        {jobs.map((job) => {
          const jobTasks = tasks.filter((t) => t.job_id === job.id);
          const percent = calculateJobCompletionPercentage(jobTasks);
          const doneCount = jobTasks.filter((t) => t.status === 'done').length;
          const daysLeft = calculateDaysRemaining(job.application_deadline);
          const strokeColor = getRingColor(percent);
          const strokeDashoffset = CIRCUMFERENCE - (percent / 100) * CIRCUMFERENCE;

          return (
            <div key={job.id} className="ring-card" onClick={() => onSelectJob(job)} style={{ cursor: 'pointer' }}>
              <div className="ring-card__header">
                <span className={`badge badge--${job.status}`}>{job.status.replace('_', ' ')}</span>
                <button
                  className="btn btn--ghost btn--sm"
                  style={{ padding: '4px' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditJob(job);
                  }}
                  title="Edit Job"
                >
                  <Edit2 size={13} />
                </button>
              </div>

              <div className="ring-card__body">
                {/* Circular Progress Gauge */}
                <div className="ring-card__gauge">
                  <svg viewBox="0 0 90 90">
                    {/* Background track circle */}
                    <circle
                      cx="45"
                      cy="45"
                      r={RADIUS}
                      stroke="rgba(255, 255, 255, 0.08)"
                      strokeWidth="7"
                      fill="none"
                    />
                    {/* Filled progress ring with smooth transition */}
                    <circle
                      cx="45"
                      cy="45"
                      r={RADIUS}
                      stroke={strokeColor}
                      strokeWidth="7"
                      strokeDasharray={CIRCUMFERENCE}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      fill="none"
                      style={{
                        transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                    />
                  </svg>
                  <div className="ring-card__gauge-center">
                    {percent === 100 ? (
                      <Check size={24} color="#10B981" />
                    ) : (
                      <>
                        {percent}%
                        <span>
                          {doneCount}/{jobTasks.length}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="ring-card__details">
                  <h3 title={job.company}>{job.company}</h3>
                  <p title={job.role}>{job.role}</p>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.78rem',
                      color: '#CBD5E1',
                    }}
                  >
                    <Clock size={12} color="#06B6D4" />
                    <span>
                      {daysLeft < 0 ? (
                        <strong style={{ color: '#F43F5E' }}>Overdue</strong>
                      ) : (
                        `${daysLeft} days remaining`
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="ring-card__footer">
                <span>Deadline: {new Date(job.application_deadline).toLocaleDateString()}</span>
                {job.job_url && (
                  <a
                    href={job.job_url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#06B6D4' }}
                  >
                    <span>Posting</span>
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
