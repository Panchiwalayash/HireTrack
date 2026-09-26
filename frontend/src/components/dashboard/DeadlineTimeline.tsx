import React from 'react';
import type { Job } from '../../models';
import { calculateDaysRemaining, determineUrgencyLevel } from '../../core/utils/ranking.util';
import { buildGoogleCalendarUrl, downloadIcsCalendar } from '../../lib/calendar';
import { Calendar, Clock, ExternalLink } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

interface DeadlineTimelineProps {
  jobs: Job[];
  onSelectJob: (job: Job) => void;
}

export const DeadlineTimeline: React.FC<DeadlineTimelineProps> = ({ jobs, onSelectJob }) => {
  if (jobs.length === 0) return null;

  const sortedJobs = [...jobs].sort(
    (a, b) => new Date(a.application_deadline).getTime() - new Date(b.application_deadline).getTime(),
  );

  const monthMap = new Map<string, number>();
  sortedJobs.forEach((j) => {
    const d = new Date(j.application_deadline);
    const key = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
    monthMap.set(key, (monthMap.get(key) || 0) + 1);
  });

  const chartData = Array.from(monthMap.entries()).map(([month, count]) => ({
    month,
    count,
  }));

  const getUrgencyColor = (urgency: 'overdue' | 'critical' | 'urgent' | 'upcoming') => {
    switch (urgency) {
      case 'overdue':
      case 'critical':
        return '#F43F5E';
      case 'urgent':
        return '#F59E0B';
      case 'upcoming':
        return '#06B6D4';
    }
  };

  return (
    <section className="timeline-panel">
      <div className="section-title-bar" style={{ marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2>Interview & Deadline Timeline</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Chronological roadmap across all applications with color-intensity urgency grading
          </p>
        </div>

        <button
          className="btn btn--secondary btn--sm"
          onClick={() => downloadIcsCalendar(jobs)}
          title="Download all deadlines as an .ics file to sync with Google Calendar, Apple, or Outlook"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Calendar size={13} color="#4285F4" />
          <span>Sync Deadlines to Calendar (.ics)</span>
        </button>
      </div>

      {/* Horizontal Timeline Track */}
      <div className="timeline-panel__track">
        {sortedJobs.map((job) => {
          const daysLeft = calculateDaysRemaining(job.application_deadline);
          const urgency = determineUrgencyLevel(daysLeft);
          const accentColor = getUrgencyColor(urgency);

          return (
            <div
              key={job.id}
              className="timeline-panel__node"
              onClick={() => onSelectJob(job)}
              style={{ cursor: 'pointer', borderTop: `3px solid ${accentColor}` }}
              title="Click to view tasks"
            >
              <div className="timeline-panel__node-date">
                {new Date(job.application_deadline).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>

              <div className="timeline-panel__node-school">{job.company}</div>
              <div className="timeline-panel__node-program">{job.role}</div>

              <div className="timeline-panel__node-footer">
                <span
                  className={`urgency-badge urgency-badge--${urgency}`}
                  style={{ fontSize: '0.68rem', padding: '2px 8px' }}
                >
                  <Clock size={10} />
                  <span>
                    {daysLeft < 0 ? `${Math.abs(daysLeft)}d ago` : daysLeft === 0 ? 'Today!' : `${daysLeft}d left`}
                  </span>
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <a
                    href={buildGoogleCalendarUrl(job)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    style={{ color: 'var(--text-muted)', display: 'inline-flex' }}
                    title={`Add ${job.company} deadline to Google Calendar`}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M19 4H18V2H16V4H8V2H6V4H5C3.89 4 3 4.9 3 6V20C3 21.1 3.89 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V9H19V20ZM19 7H5V6H19V7Z"
                        fill="#4285F4"
                      />
                    </svg>
                  </a>

                  {job.job_url && (
                    <a
                      href={job.job_url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{ color: 'var(--text-muted)', display: 'inline-flex' }}
                      title="Open job posting"
                    >
                      <ExternalLink size={13} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Secondary: Monthly Histogram */}
      {chartData.length > 1 && (
        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '12px',
              fontSize: '0.82rem',
              color: 'var(--text-secondary)',
            }}
          >
            <Calendar size={14} color="#6366F1" />
            <span>Monthly Application Volume</span>
          </div>
          <div style={{ height: '110px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="month"
                  stroke="var(--text-muted)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: 'var(--border-subtle)' }}
                />
                <YAxis
                  allowDecimals={false}
                  stroke="var(--text-muted)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-card-solid)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: 'var(--text-primary)',
                  }}
                  cursor={{ fill: 'rgba(99, 102, 241, 0.08)' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {chartData.map((_entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === 0 ? '#6366F1' : index === 1 ? '#06B6D4' : '#A855F7'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </section>
  );
};
