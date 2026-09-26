import React, { useState, useMemo } from 'react';
import type { Job, Task, TaskStatus, JobStatus } from '../../models';
import {
  Plus,
  ExternalLink,
  Edit2,
  Trash2,
  Clock,
  Calendar,
  DollarSign,
  MapPin,
  Search,
  LayoutGrid,
  Columns3,
  ArrowRight,
  ArrowLeft,
  Briefcase,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { calculateDaysRemaining, calculateJobCompletionPercentage } from '../../core/utils/ranking.util';
import { buildGoogleCalendarUrl, downloadIcsCalendar } from '../../lib/calendar';
import confetti from 'canvas-confetti';

interface JobListViewProps {
  jobs: Job[];
  tasks: Task[];
  onEditJob: (job: Job) => void;
  onDeleteJob: (jobId: string) => void;
  onUpdateJobStatus?: (jobId: string, status: JobStatus) => void;
  onAddTask: (jobId: string) => void;
  onUpdateTaskStatus: (taskId: string, status: TaskStatus) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenNewJob: () => void;
}

const STAGES: Array<{ id: JobStatus; label: string; color: string; icon: string }> = [
  { id: 'saved', label: 'Saved', color: '#818CF8', icon: '📌' },
  { id: 'applied', label: 'Applied', color: '#6366F1', icon: '🚀' },
  { id: 'interviewing', label: 'Interviewing', color: '#06B6D4', icon: '💬' },
  { id: 'offer', label: 'Offer Received', color: '#10B981', icon: '🎉' },
  { id: 'rejected', label: 'Rejected', color: '#F43F5E', icon: '❌' },
  { id: 'ghosted', label: 'Ghosted', color: '#64748B', icon: '👻' },
  { id: 'withdrawn', label: 'Withdrawn', color: '#6B7280', icon: '↩️' },
];

const STAGE_TRANSITION_ORDER: JobStatus[] = ['saved', 'applied', 'interviewing', 'offer'];

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #6366F1 0%, #06B6D4 100%)',
  'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
  'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)',
  'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
  'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
  'linear-gradient(135deg, #06B6D4 0%, #10B981 100%)',
];

function getCompanyGradient(companyName: string) {
  let hash = 0;
  for (let i = 0; i < companyName.length; i++) {
    hash = companyName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[index];
}

export const JobListView: React.FC<JobListViewProps> = ({
  jobs,
  tasks,
  onEditJob,
  onDeleteJob,
  onUpdateJobStatus,
  onAddTask,
  onUpdateTaskStatus,
  onDeleteTask,
  onOpenNewJob,
}) => {
  const [viewMode, setViewMode] = useState<'cards' | 'kanban'>('cards');

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [workModelFilter, setWorkModelFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'urgency' | 'company' | 'salary' | 'prep'>('urgency');

  const metrics = useMemo(() => {
    const total = jobs.length;
    const interviewing = jobs.filter((j) => j.status === 'interviewing').length;
    const offers = jobs.filter((j) => j.status === 'offer').length;
    const totalComp = jobs.reduce((acc, j) => acc + (j.salary_max || j.salary_min || 0), 0);
    const allTasksCount = tasks.length;
    const doneTasksCount = tasks.filter((t) => t.status === 'done').length;
    const overallProgress = allTasksCount > 0 ? Math.round((doneTasksCount / allTasksCount) * 100) : 0;

    return { total, interviewing, offers, totalComp, overallProgress };
  }, [jobs, tasks]);

  const filteredJobs = useMemo(() => {
    return jobs
      .filter((j) => {
        const matchesSearch =
          j.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
          j.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (j.location && j.location.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesStatus = statusFilter === 'all' || j.status === statusFilter;
        const matchesWorkModel = workModelFilter === 'all' || j.work_model === workModelFilter;

        return matchesSearch && matchesStatus && matchesWorkModel;
      })
      .sort((a, b) => {
        if (sortBy === 'urgency') {
          const daysA = calculateDaysRemaining(a.application_deadline);
          const daysB = calculateDaysRemaining(b.application_deadline);
          return daysA - daysB;
        }
        if (sortBy === 'company') {
          return a.company.localeCompare(b.company);
        }
        if (sortBy === 'salary') {
          const compA = a.salary_max || a.salary_min || 0;
          const compB = b.salary_max || b.salary_min || 0;
          return compB - compA;
        }
        if (sortBy === 'prep') {
          const tasksA = tasks.filter((t) => t.job_id === a.id);
          const tasksB = tasks.filter((t) => t.job_id === b.id);
          const prepA = calculateJobCompletionPercentage(tasksA);
          const prepB = calculateJobCompletionPercentage(tasksB);
          return prepA - prepB;
        }
        return 0;
      });
  }, [jobs, tasks, searchQuery, statusFilter, workModelFilter, sortBy]);

  const handleCycleTask = (task: Task) => {
    const cycleMap: Record<TaskStatus, TaskStatus> = {
      not_started: 'in_progress',
      in_progress: 'done',
      done: 'not_started',
    };
    const nextStatus = cycleMap[task.status];
    if (nextStatus === 'done') {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#10B981', '#06B6D4'],
      });
    }
    onUpdateTaskStatus(task.id, nextStatus);
  };

  const handleStatusChange = (jobId: string, newStatus: JobStatus) => {
    if (newStatus === 'offer') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10B981', '#F59E0B', '#06B6D4'],
      });
    }
    if (onUpdateJobStatus) {
      onUpdateJobStatus(jobId, newStatus);
    }
  };

  const getStatusBadgeStyle = (status: JobStatus) => {
    switch (status) {
      case 'offer':
        return {
          background: 'rgba(16, 185, 129, 0.18)',
          color: '#34D399',
          border: '1px solid rgba(16, 185, 129, 0.35)',
        };
      case 'interviewing':
        return {
          background: 'rgba(6, 182, 212, 0.18)',
          color: '#38BDF8',
          border: '1px solid rgba(6, 182, 212, 0.35)',
        };
      case 'applied':
        return {
          background: 'rgba(99, 102, 241, 0.18)',
          color: '#818CF8',
          border: '1px solid rgba(99, 102, 241, 0.35)',
        };
      case 'saved':
        return {
          background: 'rgba(148, 163, 184, 0.15)',
          color: '#CBD5E1',
          border: '1px solid rgba(148, 163, 184, 0.3)',
        };
      case 'rejected':
        return {
          background: 'rgba(239, 68, 68, 0.15)',
          color: '#F87171',
          border: '1px solid rgba(239, 68, 68, 0.3)',
        };
      default:
        return {
          background: 'rgba(107, 114, 128, 0.15)',
          color: '#9CA3AF',
          border: '1px solid rgba(107, 114, 128, 0.3)',
        };
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', paddingBottom: '80px' }}>
      {/* Top Header & Quick Action Bar */}
      <div className="section-title-bar" style={{ marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span
              className="badge"
              style={{
                background: 'rgba(99, 102, 241, 0.15)',
                color: '#818CF8',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                fontSize: '0.72rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Career Command Center
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{jobs.length} Active Targets</span>
          </div>
          <h2>Job Applications & Pipeline</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem' }}>
            Manage active target opportunities, advance interview rounds, and track preparation milestones.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* View Mode Toggle: Cards vs Kanban */}
          <div
            style={{
              display: 'flex',
              background: 'var(--bg-input, rgba(255, 255, 255, 0.05))',
              border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
              borderRadius: '10px',
              padding: '3px',
            }}
          >
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: viewMode === 'cards' ? 600 : 400,
                background: viewMode === 'cards' ? 'var(--bg-card-solid, #1E2330)' : 'transparent',
                color: viewMode === 'cards' ? 'var(--text-primary)' : 'var(--text-muted)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <LayoutGrid size={14} />
              <span>Cards</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: viewMode === 'kanban' ? 600 : 400,
                background: viewMode === 'kanban' ? 'var(--bg-card-solid, #1E2330)' : 'transparent',
                color: viewMode === 'kanban' ? 'var(--text-primary)' : 'var(--text-muted)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Columns3 size={14} />
              <span>Kanban</span>
            </button>
          </div>

          <button
            className="btn btn--secondary btn--sm"
            onClick={() => downloadIcsCalendar(jobs)}
            title="Download iCalendar format"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Calendar size={14} color="#4285F4" />
            <span>Export .ICS</span>
          </button>

          <button
            className="btn btn--primary btn--sm"
            onClick={onOpenNewJob}
            style={{
              background: 'linear-gradient(135deg, #6366F1 0%, #06B6D4 100%)',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 10px rgba(99, 102, 241, 0.25)',
            }}
          >
            <Plus size={15} />
            <span>+ Track Application</span>
          </button>
        </div>
      </div>

      {/* Metrics Ribbon */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
          marginBottom: '22px',
        }}
      >
        <div
          style={{
            background: 'var(--bg-card-solid, #131722)',
            border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
            borderRadius: '12px',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Total Roles
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
              {metrics.total}
            </div>
          </div>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'rgba(99, 102, 241, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Briefcase size={18} color="#818CF8" />
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-card-solid, #131722)',
            border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
            borderRadius: '12px',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              In Interviews
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#06B6D4', marginTop: '2px' }}>
              {metrics.interviewing}
            </div>
          </div>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'rgba(6, 182, 212, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TrendingUp size={18} color="#06B6D4" />
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-card-solid, #131722)',
            border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
            borderRadius: '12px',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Offers Received
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#10B981', marginTop: '2px' }}>
              {metrics.offers}
            </div>
          </div>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CheckCircle2 size={18} color="#10B981" />
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-card-solid, #131722)',
            border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
            borderRadius: '12px',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Pipeline Value
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#F59E0B', marginTop: '2px' }}>
              ${(metrics.totalComp / 1000).toFixed(0)}k
            </div>
          </div>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'rgba(245, 158, 11, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <DollarSign size={18} color="#F59E0B" />
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div
        style={{
          background: 'var(--bg-card-solid, #131722)',
          border: '1px solid var(--border-medium, rgba(255, 255, 255, 0.1))',
          borderRadius: '14px',
          padding: '16px 20px',
          marginBottom: '22px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px',
          }}
        >
          {/* Search Input */}
          <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: '400px' }}>
            <input
              type="text"
              className="input"
              placeholder="Search target company, role, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '34px', fontSize: '0.84rem' }}
            />
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: '11px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Work Model Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600 }}>Model:</span>
              <select
                className="select"
                style={{ fontSize: '0.78rem', padding: '6px 10px', width: 'auto' }}
                value={workModelFilter}
                onChange={(e) => setWorkModelFilter(e.target.value)}
              >
                <option value="all">All Models</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">Onsite</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600 }}>Sort:</span>
              <select
                className="select"
                style={{ fontSize: '0.78rem', padding: '6px 10px', width: 'auto' }}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
              >
                <option value="urgency">Deadline (Urgent First)</option>
                <option value="prep">Preparation Needed</option>
                <option value="salary">Compensation (High to Low)</option>
                <option value="company">Company Name (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Status Filter Tabs (Only relevant in Cards view) */}
        {viewMode === 'cards' && (
          <div
            style={{
              display: 'flex',
              gap: '6px',
              flexWrap: 'wrap',
              borderTop: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.06))',
              paddingTop: '12px',
            }}
          >
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              style={{
                padding: '4px 12px',
                borderRadius: '8px',
                fontSize: '0.76rem',
                fontWeight: statusFilter === 'all' ? 700 : 500,
                background: statusFilter === 'all' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                color: statusFilter === 'all' ? '#A5B4FC' : 'var(--text-secondary)',
                border: statusFilter === 'all' ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
                cursor: 'pointer',
              }}
            >
              All ({jobs.length})
            </button>

            {STAGES.map((st) => {
              const count = jobs.filter((j) => j.status === st.id).length;
              const isSelected = statusFilter === st.id;
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setStatusFilter(st.id)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '8px',
                    fontSize: '0.76rem',
                    fontWeight: isSelected ? 700 : 500,
                    background: isSelected ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                    color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                    border: isSelected ? `1px solid ${st.color}` : '1px solid transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span>{st.icon}</span>
                  <span>{st.label}</span>
                  <span style={{ opacity: 0.6, fontSize: '0.7rem' }}>({count})</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Content Area: Cards or Kanban */}
      {filteredJobs.length === 0 ? (
        /* Empty State */
        <div
          style={{
            padding: '50px 24px',
            background: 'var(--bg-card-solid, #131722)',
            border: '1px dashed var(--border-medium, rgba(255, 255, 255, 0.12))',
            borderRadius: '16px',
            textAlign: 'center',
            margin: '20px 0',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'rgba(99, 102, 241, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <Briefcase size={26} color="#818CF8" />
          </div>
          <h3 style={{ margin: '0 0 6px', fontSize: '1.2rem', fontWeight: 700 }}>No Applications Found</h3>
          <p
            style={{
              margin: '0 0 20px',
              fontSize: '0.86rem',
              color: 'var(--text-secondary)',
              maxWidth: '460px',
              marginInline: 'auto',
            }}
          >
            {searchQuery
              ? `No tracked roles match your search query "${searchQuery}".`
              : statusFilter !== 'all'
                ? `No active roles are currently in the "${statusFilter}" stage.`
                : 'You have not added any job applications yet. Start tracking target companies or explore our AI fit scorer.'}
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            {(searchQuery || statusFilter !== 'all' || workModelFilter !== 'all') && (
              <button
                className="btn btn--secondary btn--sm"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setWorkModelFilter('all');
                }}
              >
                Clear All Filters
              </button>
            )}
            <button className="btn btn--primary btn--sm" onClick={onOpenNewJob}>
              <Plus size={15} />
              <span>Add Target Role</span>
            </button>
          </div>
        </div>
      ) : viewMode === 'cards' ? (
        /* Cards View */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredJobs.map((job) => {
            const jobTasks = tasks.filter((t) => t.job_id === job.id);
            const percent = calculateJobCompletionPercentage(jobTasks);
            const daysLeft = calculateDaysRemaining(job.application_deadline);
            const badgeStyle = getStatusBadgeStyle(job.status);
            const avatarGrad = getCompanyGradient(job.company);

            return (
              <div
                key={job.id}
                style={{
                  background: 'var(--bg-card-solid, #131722)',
                  border: '1px solid var(--border-medium, rgba(255, 255, 255, 0.1))',
                  borderRadius: '16px',
                  padding: '20px 24px',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 18px rgba(0, 0, 0, 0.25)',
                }}
              >
                {/* Top Row: Avatar, Title, Role, Stage Selector & Actions */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '16px',
                    marginBottom: '16px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                    {/* Brand Avatar Icon */}
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '12px',
                        background: avatarGrad,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontWeight: 800,
                        fontSize: '1.25rem',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                        flexShrink: 0,
                      }}
                    >
                      {job.company.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          flexWrap: 'wrap',
                          marginBottom: '4px',
                        }}
                      >
                        <h3
                          style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}
                        >
                          {job.company}
                        </h3>

                        {/* Interactive Stage Selector Dropdown */}
                        <select
                          value={job.status}
                          onChange={(e) => handleStatusChange(job.id, e.target.value as JobStatus)}
                          style={{
                            ...badgeStyle,
                            borderRadius: '12px',
                            padding: '3px 10px',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            outline: 'none',
                          }}
                        >
                          <option value="saved">📌 Saved</option>
                          <option value="applied">🚀 Applied</option>
                          <option value="interviewing">💬 Interviewing</option>
                          <option value="offer">🎉 Offer Received</option>
                          <option value="rejected">❌ Rejected</option>
                          <option value="ghosted">👻 Ghosted</option>
                          <option value="withdrawn">↩️ Withdrawn</option>
                        </select>

                        {/* Work model */}
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: '10px',
                            fontSize: '0.72rem',
                            background: 'rgba(255, 255, 255, 0.05)',
                            color: 'var(--text-muted)',
                            textTransform: 'capitalize',
                          }}
                        >
                          {job.work_model}
                        </span>

                        {/* Location */}
                        {job.location && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              fontSize: '0.74rem',
                              color: 'var(--text-muted)',
                            }}
                          >
                            <MapPin size={11} />
                            {job.location}
                          </span>
                        )}

                        {/* Salary */}
                        {(job.salary_min || job.salary_max) && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '2px',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              color: '#10B981',
                              background: 'rgba(16, 185, 129, 0.12)',
                              padding: '2px 8px',
                              borderRadius: '8px',
                            }}
                          >
                            <DollarSign size={11} />${((job.salary_min || 0) / 1000).toFixed(0)}k – $
                            {((job.salary_max || 0) / 1000).toFixed(0)}k
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                        {job.role}
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <a
                      href={buildGoogleCalendarUrl(job)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn--secondary btn--sm"
                      title="Add target milestone to Google Calendar"
                      style={{
                        padding: '6px 10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '0.74rem',
                      }}
                    >
                      <Calendar size={13} color="#4285F4" />
                      <span>Google Cal</span>
                    </a>

                    {job.job_url && (
                      <a
                        href={job.job_url}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn--secondary btn--sm"
                        title="Open posting"
                        style={{ padding: '6px' }}
                      >
                        <ExternalLink size={13} />
                      </a>
                    )}

                    <button
                      className="btn btn--secondary btn--sm"
                      onClick={() => onEditJob(job)}
                      title="Edit role details"
                      style={{ padding: '6px' }}
                    >
                      <Edit2 size={13} />
                    </button>

                    <button
                      className="btn btn--secondary btn--sm"
                      onClick={() => onDeleteJob(job.id)}
                      title="Delete application"
                      style={{ padding: '6px', color: '#F43F5E' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Notes or AI Insight Callout */}
                {job.notes && (
                  <div
                    style={{
                      background: 'rgba(99, 102, 241, 0.05)',
                      borderLeft: '3px solid #6366F1',
                      padding: '10px 14px',
                      borderRadius: '0 8px 8px 0',
                      fontSize: '0.8rem',
                      color: 'var(--text-secondary)',
                      lineHeight: '1.5',
                      marginBottom: '16px',
                    }}
                  >
                    {job.notes}
                  </div>
                )}

                {/* Target Deadline & Progress Bar */}
                <div style={{ marginBottom: '16px' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.78rem',
                      marginBottom: '6px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                      <Clock size={13} color="#06B6D4" />
                      <span>
                        Target Milestone:{' '}
                        <strong style={{ color: 'var(--text-primary)' }}>
                          {new Date(job.application_deadline).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </strong>
                      </span>
                      <span>·</span>
                      <span
                        style={{
                          fontWeight: 700,
                          color:
                            daysLeft < 0
                              ? '#F43F5E'
                              : daysLeft === 0
                                ? '#F59E0B'
                                : daysLeft <= 7
                                  ? '#06B6D4'
                                  : 'var(--text-muted)',
                        }}
                      >
                        {daysLeft < 0
                          ? `Overdue (${Math.abs(daysLeft)}d ago)`
                          : daysLeft === 0
                            ? 'Due Today'
                            : `${daysLeft} days remaining`}
                      </span>
                    </div>

                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: percent === 100 ? '#10B981' : '#A5B4FC',
                      }}
                    >
                      {percent}% Prepared ({jobTasks.filter((t) => t.status === 'done').length}/{jobTasks.length}{' '}
                      Milestones)
                    </span>
                  </div>

                  <div
                    style={{
                      height: '6px',
                      background: 'rgba(255, 255, 255, 0.06)',
                      borderRadius: '3px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${percent}%`,
                        height: '100%',
                        background: percent === 100 ? '#10B981' : percent > 50 ? '#06B6D4' : '#6366F1',
                        borderRadius: '3px',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                </div>

                {/* Milestones Checklist Grid */}
                <div
                  style={{
                    background: 'rgba(0, 0, 0, 0.2)',
                    border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.05))',
                    borderRadius: '12px',
                    padding: '12px 14px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px',
                    }}
                  >
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                      Preparation Checklist & Interview Stages:
                    </span>
                    <button
                      className="btn btn--sm"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#818CF8',
                        fontSize: '0.72rem',
                        padding: '2px 6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                      onClick={() => onAddTask(job.id)}
                    >
                      <Plus size={11} />
                      <span>Add Milestone</span>
                    </button>
                  </div>

                  {jobTasks.length === 0 ? (
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        fontStyle: 'italic',
                        padding: '4px 0',
                      }}
                    >
                      No milestones attached yet. Click "+ Add Milestone" to track custom prep or interview rounds.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {jobTasks.map((task) => {
                        const isDone = task.status === 'done';
                        const inProgress = task.status === 'in_progress';
                        return (
                          <div
                            key={task.id}
                            onClick={() => handleCycleTask(task)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '5px 10px',
                              borderRadius: '8px',
                              fontSize: '0.74rem',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                              background: isDone
                                ? 'rgba(16, 185, 129, 0.15)'
                                : inProgress
                                  ? 'rgba(6, 182, 212, 0.15)'
                                  : 'rgba(255, 255, 255, 0.04)',
                              border: isDone
                                ? '1px solid rgba(16, 185, 129, 0.35)'
                                : inProgress
                                  ? '1px solid rgba(6, 182, 212, 0.35)'
                                  : '1px solid rgba(255, 255, 255, 0.08)',
                              color: isDone ? '#A7F3D0' : inProgress ? '#BAE6FD' : 'var(--text-secondary)',
                            }}
                            title="Click to cycle status (To Do → In Progress → Done)"
                          >
                            <span
                              style={{
                                width: '14px',
                                height: '14px',
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: isDone
                                  ? '#10B981'
                                  : inProgress
                                    ? '#06B6D4'
                                    : 'rgba(255, 255, 255, 0.1)',
                                color: '#fff',
                                fontSize: '10px',
                              }}
                            >
                              {isDone ? '✓' : inProgress ? '•' : ''}
                            </span>

                            <span style={{ fontWeight: 600 }}>{task.type.replace('_', ' ')}</span>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteTask(task.id);
                              }}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-muted)',
                                cursor: 'pointer',
                                padding: '0 2px',
                                fontSize: '0.75rem',
                              }}
                              title="Delete milestone"
                            >
                              ×
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Kanban Pipeline Board View */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '16px',
            alignItems: 'start',
          }}
        >
          {['saved', 'applied', 'interviewing', 'offer'].map((stageId) => {
            const stageConfig = STAGES.find((s) => s.id === stageId)!;
            const stageJobs = filteredJobs.filter((j) => j.status === stageId);

            return (
              <div
                key={stageId}
                style={{
                  background: 'var(--bg-card-solid, #131722)',
                  border: '1px solid var(--border-medium, rgba(255, 255, 255, 0.1))',
                  borderRadius: '16px',
                  padding: '16px',
                  minHeight: '420px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                {/* Column Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingBottom: '10px',
                    borderBottom: `2px solid ${stageConfig.color}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>{stageConfig.icon}</span>
                    <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700 }}>{stageConfig.label}</h4>
                  </div>
                  <span
                    style={{
                      background: 'rgba(255, 255, 255, 0.06)',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: stageConfig.color,
                    }}
                  >
                    {stageJobs.length}
                  </span>
                </div>

                {/* Column Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                  {stageJobs.length === 0 ? (
                    <div
                      style={{
                        padding: '30px 10px',
                        textAlign: 'center',
                        color: 'var(--text-muted)',
                        fontSize: '0.78rem',
                        fontStyle: 'italic',
                      }}
                    >
                      No jobs in {stageConfig.label}
                    </div>
                  ) : (
                    stageJobs.map((job) => {
                      const jobTasks = tasks.filter((t) => t.job_id === job.id);
                      const percent = calculateJobCompletionPercentage(jobTasks);
                      const daysLeft = calculateDaysRemaining(job.application_deadline);
                      const avatarGrad = getCompanyGradient(job.company);

                      const currentIndex = STAGE_TRANSITION_ORDER.indexOf(job.status);
                      const prevStage = currentIndex > 0 ? STAGE_TRANSITION_ORDER[currentIndex - 1] : null;
                      const nextStage =
                        currentIndex < STAGE_TRANSITION_ORDER.length - 1
                          ? STAGE_TRANSITION_ORDER[currentIndex + 1]
                          : null;

                      return (
                        <div
                          key={job.id}
                          style={{
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
                            borderRadius: '12px',
                            padding: '12px 14px',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                            <div
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '8px',
                                background: avatarGrad,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff',
                                fontWeight: 700,
                                fontSize: '0.85rem',
                                flexShrink: 0,
                              }}
                            >
                              {job.company.charAt(0).toUpperCase()}
                            </div>

                            <div style={{ flex: 1, minWidth: 0 }}>
                              <h5
                                style={{
                                  margin: 0,
                                  fontSize: '0.88rem',
                                  fontWeight: 700,
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {job.company}
                              </h5>
                              <div
                                style={{
                                  fontSize: '0.74rem',
                                  color: 'var(--text-secondary)',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {job.role}
                              </div>
                            </div>
                          </div>

                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              fontSize: '0.72rem',
                              color: 'var(--text-muted)',
                              marginBottom: '8px',
                            }}
                          >
                            <span style={{ textTransform: 'capitalize' }}>
                              {job.work_model} ·{' '}
                              <strong
                                style={{ color: daysLeft < 0 ? '#F43F5E' : daysLeft <= 7 ? '#06B6D4' : 'inherit' }}
                              >
                                {daysLeft < 0 ? 'Overdue' : daysLeft === 0 ? 'Due Today' : `${daysLeft}d left`}
                              </strong>
                            </span>
                            {job.salary_max && (
                              <span style={{ color: '#10B981', fontWeight: 600 }}>
                                ${(job.salary_max / 1000).toFixed(0)}k
                              </span>
                            )}
                          </div>

                          {/* Progress mini meter */}
                          <div style={{ marginBottom: '10px' }}>
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: '0.68rem',
                                color: 'var(--text-muted)',
                                marginBottom: '3px',
                              }}
                            >
                              <span>Prep</span>
                              <span>{percent}%</span>
                            </div>
                            <div
                              style={{
                                height: '3px',
                                background: 'rgba(255, 255, 255, 0.08)',
                                borderRadius: '2px',
                                overflow: 'hidden',
                              }}
                            >
                              <div
                                style={{ width: `${percent}%`, height: '100%', background: stageConfig.color }}
                              />
                            </div>
                          </div>

                          {/* Card Footer: Quick Stage Shifter & Edit Button */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                              paddingTop: '8px',
                            }}
                          >
                            <div style={{ display: 'flex', gap: '4px' }}>
                              {prevStage && (
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(job.id, prevStage)}
                                  className="btn btn--sm"
                                  style={{
                                    padding: '2px 6px',
                                    fontSize: '0.7rem',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: 'none',
                                  }}
                                  title={`Move back to ${prevStage}`}
                                >
                                  <ArrowLeft size={11} />
                                </button>
                              )}
                              {nextStage && (
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(job.id, nextStage)}
                                  className="btn btn--sm"
                                  style={{
                                    padding: '2px 6px',
                                    fontSize: '0.7rem',
                                    background: 'rgba(99, 102, 241, 0.2)',
                                    color: '#A5B4FC',
                                    border: 'none',
                                  }}
                                  title={`Advance to ${nextStage}`}
                                >
                                  <ArrowRight size={11} />
                                </button>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => onEditJob(job)}
                              className="btn btn--sm"
                              style={{
                                padding: '2px 6px',
                                fontSize: '0.7rem',
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-muted)',
                              }}
                              title="Edit"
                            >
                              <Edit2 size={11} />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
