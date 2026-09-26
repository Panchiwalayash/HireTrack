import React, { useState } from 'react';
import type { Job, Task, TaskType, TaskStatus } from '../../models';
import { Check, Clock, Plus, Search } from 'lucide-react';
import confetti from 'canvas-confetti';

interface RequirementsMatrixProps {
  jobs: Job[];
  tasks: Task[];
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  onAddTask: (jobId: string, type: TaskType) => void;
  onSelectJob: (job: Job) => void;
}

const TASK_COLUMNS: { type: TaskType; label: string }[] = [
  { type: 'Resume', label: 'Resume Tailored' },
  { type: 'Cover_Letter', label: 'Cover Letter' },
  { type: 'Coding_Challenge', label: 'Coding / OA' },
  { type: 'System_Design', label: 'System Design' },
  { type: 'Behavioral', label: 'Behavioral / STAR' },
  { type: 'Take_Home', label: 'Take-Home' },
  { type: 'Negotiation', label: 'Negotiation' },
];

export const RequirementsMatrix: React.FC<RequirementsMatrixProps> = ({
  jobs,
  tasks,
  onUpdateTaskStatus,
  onAddTask,
  onSelectJob,
}) => {
  const [search, setSearch] = useState('');

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
    <div className="matrix-container">
      <div className="section-title-bar">
        <div>
          <h2>Pipeline Stages & Preparation Matrix</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Cross-company interview stage tracker. Click any cell to cycle status (Not Started → In Progress →
            Done).
          </p>
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', width: '260px' }}>
          <input
            type="text"
            className="input"
            style={{ paddingLeft: '32px' }}
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

      <div style={{ overflowX: 'auto' }}>
        <table className="matrix-table">
          <thead>
            <tr>
              <th style={{ minWidth: '220px' }}>Target Opportunity</th>
              <th style={{ minWidth: '110px' }}>Status</th>
              {TASK_COLUMNS.map((col) => (
                <th key={col.type} style={{ minWidth: '125px', textAlign: 'center' }}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredJobs.length === 0 ? (
              <tr>
                <td
                  colSpan={2 + TASK_COLUMNS.length}
                  style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}
                >
                  No matching jobs found in pipeline.
                </td>
              </tr>
            ) : (
              filteredJobs.map((job) => {
                const jobTasks = tasks.filter((t) => t.job_id === job.id);

                return (
                  <tr key={job.id}>
                    <td style={{ cursor: 'pointer' }} onClick={() => onSelectJob(job)}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{job.company}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{job.role}</div>
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
                                padding: '3px 8px',
                                fontSize: '0.7rem',
                                color: 'var(--text-muted)',
                                opacity: 0.6,
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
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
