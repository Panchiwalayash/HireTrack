import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { updateJob } from '../services/job.service';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import type { JobStatus, WorkModel } from '../models';

export const EditJobPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { jobs, loadData, handleDeleteJob } = useData();

  const currentJob = jobs.find((j) => j.id === id);

  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [location, setLocation] = useState('');
  const [workModel, setWorkModel] = useState<WorkModel>('remote');
  const [salaryMin, setSalaryMin] = useState<number | ''>('');
  const [salaryMax, setSalaryMax] = useState<number | ''>('');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState<JobStatus>('saved');
  const [jobUrl, setJobUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentJob) {
      setCompany(currentJob.company);
      setRole(currentJob.role);
      setLocation(currentJob.location || '');
      setWorkModel(currentJob.work_model || 'remote');
      setSalaryMin(currentJob.salary_min ?? '');
      setSalaryMax(currentJob.salary_max ?? '');
      if (currentJob.application_deadline) {
        setDeadline(new Date(currentJob.application_deadline).toISOString().split('T')[0]);
      }
      setStatus(currentJob.status);
      setJobUrl(currentJob.job_url || '');
      setNotes(currentJob.notes || '');
    }
  }, [currentJob]);

  if (!currentJob) {
    return (
      <div style={{ maxWidth: '700px', margin: '40px auto', textAlign: 'center' }}>
        <h2>Job Application Not Found</h2>
        <p style={{ color: 'var(--text-secondary)' }}>The requested job application could not be located.</p>
        <button onClick={() => navigate('/jobs')} className="btn btn--primary" style={{ marginTop: '16px' }}>
          Back to Applications
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !user || !id) return;

    setIsSubmitting(true);
    try {
      await updateJob(
        id,
        {
          company: company.trim(),
          role: role.trim(),
          location: location.trim() || 'Remote',
          work_model: workModel,
          salary_min: salaryMin === '' ? undefined : Number(salaryMin),
          salary_max: salaryMax === '' ? undefined : Number(salaryMax),
          application_deadline: deadline ? new Date(deadline).toISOString() : currentJob.application_deadline,
          status,
          job_url: jobUrl.trim() || undefined,
          notes: notes.trim() || undefined,
        },
        user.id,
      );
      await loadData();
      navigate('/jobs');
    } catch (err) {
      console.error('Failed to update job:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    await handleDeleteJob(id);
    navigate('/jobs');
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
          <h2>Edit Application: {currentJob.company}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Update interview loop status, comp targets, and preparation milestones
          </p>
        </div>

        <button
          type="button"
          className="btn btn--danger btn--sm"
          onClick={handleDelete}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Trash2 size={14} />
          <span>Delete Application</span>
        </button>
      </div>

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
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Role / Title *</label>
            <input type="text" required className="input" value={role} onChange={(e) => setRole(e.target.value)} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '18px' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Location</label>
            <input type="text" className="input" value={location} onChange={(e) => setLocation(e.target.value)} />
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
            <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Application Status</label>
            <select className="select" value={status} onChange={(e) => setStatus(e.target.value as JobStatus)}>
              <option value="saved">Saved</option>
              <option value="applied">Applied</option>
              <option value="interviewing">Interviewing</option>
              <option value="offer">Offer Received</option>
              <option value="rejected">Rejected</option>
              <option value="ghosted">Ghosted</option>
              <option value="withdrawn">Withdrawn</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '18px' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Target / Deadline Date</label>
            <input type="date" className="input" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Min Base ($ USD)</label>
            <input
              type="number"
              className="input"
              value={salaryMin}
              onChange={(e) => setSalaryMin(e.target.value === '' ? '' : Number(e.target.value))}
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Target Total Comp ($ USD)</label>
            <input
              type="number"
              className="input"
              value={salaryMax}
              onChange={(e) => setSalaryMax(e.target.value === '' ? '' : Number(e.target.value))}
            />
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: '18px' }}>
          <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Job Posting URL</label>
          <input type="url" className="input" value={jobUrl} onChange={(e) => setJobUrl(e.target.value)} />
        </div>

        <div className="form-group" style={{ marginBottom: '24px' }}>
          <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Notes & Insights</label>
          <textarea className="textarea" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button type="button" className="btn btn--ghost" onClick={() => navigate('/jobs')}>
            Cancel
          </button>
          <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
            <Save size={16} />
            <span>{isSubmitting ? 'Saving...' : 'Update Application'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
