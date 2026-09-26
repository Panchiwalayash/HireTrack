import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ArrowLeft, Plus } from 'lucide-react';
import type { WorkModel } from '../models';

export const AddJobPage: React.FC = () => {
  const navigate = useNavigate();
  const { handleSaveJob } = useData();

  const [company, setCompany] = useState('');
  const [role, setRole] = useState('Software Engineer');
  const [location, setLocation] = useState('Remote');
  const [workModel, setWorkModel] = useState<WorkModel>('remote');
  const [salaryMin, setSalaryMin] = useState<number | ''>(140000);
  const [salaryMax, setSalaryMax] = useState<number | ''>(190000);
  const [deadline, setDeadline] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [autoCreateTasks, setAutoCreateTasks] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim()) return;

    setIsSubmitting(true);
    try {
      await handleSaveJob(
        {
          company: company.trim(),
          role: role.trim(),
          location: location.trim() || 'Remote',
          work_model: workModel,
          salary_min: salaryMin === '' ? undefined : Number(salaryMin),
          salary_max: salaryMax === '' ? undefined : Number(salaryMax),
          application_deadline: deadline
            ? new Date(deadline).toISOString()
            : new Date(Date.now() + 30 * 86400000).toISOString(),
          status: 'saved',
          job_url: jobUrl.trim() || undefined,
          notes: notes.trim() || undefined,
        },
        autoCreateTasks,
      );
      navigate('/jobs');
    } catch (err) {
      console.error('Failed to create job:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', paddingBottom: '60px' }}>
      <button
        className="btn btn--ghost btn--sm"
        onClick={() => navigate('/jobs')}
        style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}
      >
        <ArrowLeft size={14} />
        <span>Back to Applications</span>
      </button>

      <div className="section-title-bar" style={{ marginBottom: '20px' }}>
        <div>
          <h2>Track New Job Application</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Add a target role to your pipeline, set prep milestones, and track interviews
          </p>
        </div>
      </div>

      {/* Main Form */}
      <form
        onSubmit={handleSubmit}
        style={{
          background: 'var(--bg-card-solid)',
          border: '1px solid var(--border-medium)',
          borderRadius: '12px',
          padding: '24px',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginBottom: '18px' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Company Name *</label>
            <input
              type="text"
              required
              className="input"
              placeholder="e.g. Stripe, Datadog, Google"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Role / Title *</label>
            <input
              type="text"
              required
              className="input"
              placeholder="e.g. Senior Backend Engineer"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '18px' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Location</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="input"
                placeholder="e.g. San Francisco, CA"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Work Model</label>
            <select
              className="select"
              value={workModel}
              onChange={(e) => setWorkModel(e.target.value as WorkModel)}
            >
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">Onsite</option>
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Target / Deadline Date</label>
            <input type="date" className="input" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '18px' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Min Base Comp ($ USD)</label>
            <input
              type="number"
              className="input"
              placeholder="e.g. 150000"
              value={salaryMin}
              onChange={(e) => setSalaryMin(e.target.value === '' ? '' : Number(e.target.value))}
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Target Total Comp ($ USD)</label>
            <input
              type="number"
              className="input"
              placeholder="e.g. 210000"
              value={salaryMax}
              onChange={(e) => setSalaryMax(e.target.value === '' ? '' : Number(e.target.value))}
            />
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: '18px' }}>
          <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Job Posting URL</label>
          <input
            type="url"
            className="input"
            placeholder="https://boards.greenhouse.io/... or careers URL"
            value={jobUrl}
            onChange={(e) => setJobUrl(e.target.value)}
          />
        </div>

        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Preparation Notes & Key Context</label>
          <textarea
            className="textarea"
            rows={3}
            placeholder="Tech stack, recruiter name, specific system design topics, referral links..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Auto-create prep tasks */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'var(--bg-input)',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '24px',
          }}
        >
          <input
            type="checkbox"
            id="auto-tasks"
            checked={autoCreateTasks}
            onChange={(e) => setAutoCreateTasks(e.target.checked)}
            style={{ width: '16px', height: '16px', accentColor: '#6366F1' }}
          />
          <label htmlFor="auto-tasks" style={{ fontSize: '0.85rem', cursor: 'pointer' }}>
            <strong>Auto-generate standard prep tasks</strong> (Resume Tailoring, Cover Letter, Coding OA, System
            Design, Behavioral)
          </label>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button type="button" className="btn btn--ghost" onClick={() => navigate('/jobs')}>
            Cancel
          </button>
          <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
            <Plus size={16} />
            <span>{isSubmitting ? 'Saving...' : 'Add Application'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
