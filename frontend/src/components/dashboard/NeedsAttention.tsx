import React from 'react';
import { CheckCircle2, ExternalLink, Clock, Flame } from 'lucide-react';
import type { Job, Task, NeedsAttentionItem } from '../../models';
import { getNeedsAttentionItems } from '../../core/utils/ranking.util';
import confetti from 'canvas-confetti';

interface NeedsAttentionProps {
  jobs: Job[];
  tasks: Task[];
  onMarkTaskDone: (taskId: string) => void;
}

export const NeedsAttention: React.FC<NeedsAttentionProps> = ({ jobs, tasks, onMarkTaskDone }) => {
  const items: NeedsAttentionItem[] = getNeedsAttentionItems(jobs, tasks, 3);

  const handleMarkDone = (id: string) => {
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#10B981', '#06B6D4', '#6366F1', '#F59E0B'],
    });
    onMarkTaskDone(id);
  };

  const formatTaskName = (type: string) => {
    switch (type) {
      case 'Resume':
        return 'Tailor Resume & Highlights';
      case 'Cover_Letter':
        return 'Custom Cover Letter';
      case 'Coding_Challenge':
        return 'Online Assessment / LeetCode';
      case 'System_Design':
        return 'System Design Architecture';
      case 'Behavioral':
        return 'STAR Behavioral Prep';
      case 'Take_Home':
        return 'Take-Home Project Assignment';
      case 'Background_Check':
        return 'Background Check & Docs';
      case 'Negotiation':
        return 'Offer & Comp Negotiation';
      default:
        return type;
    }
  };

  const getUrgencyBadgeText = (item: NeedsAttentionItem) => {
    if (item.daysRemaining < 0) {
      return `${Math.abs(item.daysRemaining)}d Overdue`;
    }
    if (item.daysRemaining === 0) {
      return 'Due Today!';
    }
    return `${item.daysRemaining} days left`;
  };

  if (items.length === 0) {
    return (
      <section className="needs-attention" style={{ borderLeftColor: '#10B981' }}>
        <div className="needs-attention__header">
          <div className="needs-attention__header-title">
            <CheckCircle2 color="#10B981" size={20} />
            <h2>Needs Attention This Week</h2>
          </div>
          <span
            className="needs-attention__header-tag"
            style={{
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#6EE7B7',
              borderColor: 'rgba(16, 185, 129, 0.3)',
            }}
          >
            All Caught Up
          </span>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          🎉 Stellar work! There are no urgent pending tasks for your job pipeline right now.
        </p>
      </section>
    );
  }

  return (
    <section className="needs-attention">
      <div className="needs-attention__header">
        <div className="needs-attention__header-title">
          <Flame color="#F59E0B" size={22} />
          <h2>Needs Attention This Week</h2>
        </div>
        <span className="needs-attention__header-tag">Auto-Ranked by Proximity & Prep Weight</span>
      </div>

      <div className="needs-attention__list">
        {items.map((item) => {
          const matchingJob = jobs.find((j) => j.id === item.jobId);

          return (
            <div key={item.taskId} className="needs-attention__card">
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                  }}
                >
                  <span className={`urgency-badge urgency-badge--${item.urgencyLevel}`}>
                    <Clock size={12} />
                    {getUrgencyBadgeText(item)}
                  </span>
                  <span className={`badge badge--${item.status}`}>{item.status.replace('_', ' ')}</span>
                </div>

                <div className="needs-attention__card-school">{item.company}</div>
                <div className="needs-attention__card-program">{item.role}</div>

                <div
                  style={{
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    marginBottom: '10px',
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: '0.86rem', color: 'var(--text-primary)' }}>
                    {formatTaskName(item.taskType)}
                  </div>
                  {item.notes && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '3px' }}>
                      "{item.notes}"
                    </div>
                  )}
                </div>
              </div>

              <div className="needs-attention__card-meta">
                {matchingJob?.job_url ? (
                  <a
                    href={matchingJob.job_url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn--ghost btn--sm"
                    style={{ fontSize: '0.76rem', padding: '4px 8px' }}
                  >
                    <span>Job Post</span>
                    <ExternalLink size={12} />
                  </a>
                ) : (
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                    Target: {new Date(item.deadline).toLocaleDateString()}
                  </span>
                )}

                <button
                  className="btn btn--primary btn--sm"
                  onClick={() => handleMarkDone(item.taskId)}
                  title="Mark this task as done"
                >
                  <CheckCircle2 size={14} />
                  <span>Mark Done</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
