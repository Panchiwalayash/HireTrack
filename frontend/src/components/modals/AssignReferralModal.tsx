import React, { useState, useEffect } from 'react';
import type { Contact, Job, ContactLink, ReferralStatus } from '../../models';
import { X, Send } from 'lucide-react';

interface AssignReferralModalProps {
  isOpen: boolean;
  contact: Contact | null;
  jobs: Job[];
  existingLinks: ContactLink[];
  onClose: () => void;
  onSave: (linkData: {
    contact_id: string;
    job_id: string;
    status: ReferralStatus;
    notes?: string;
  }) => Promise<void>;
}

export const AssignReferralModal: React.FC<AssignReferralModalProps> = ({
  isOpen,
  contact,
  jobs,
  existingLinks,
  onClose,
  onSave,
}) => {
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [status, setStatus] = useState<ReferralStatus>('asked');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const linkedJobIds = new Set(existingLinks.filter((l) => l.contact_id === contact?.id).map((l) => l.job_id));

  const availableJobs = jobs.filter((j) => !linkedJobIds.has(j.id));

  useEffect(() => {
    if (availableJobs.length > 0) {
      setSelectedJobId(availableJobs[0].id);
    } else {
      setSelectedJobId('');
    }
    setStatus('asked');
    setNotes('');
  }, [isOpen, contact]);

  if (!isOpen || !contact) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJobId) return;

    try {
      setIsSubmitting(true);
      await onSave({
        contact_id: contact.id,
        job_id: selectedJobId,
        status,
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (err) {
      console.error('Failed to link referral:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-dialog__header">
          <div>
            <h3>Link Job Referral / Introduction</h3>
            <div style={{ fontSize: '0.8rem', color: '#06B6D4', marginTop: '2px' }}>
              Contact: {contact.name} ({contact.role} at {contact.company})
            </div>
          </div>
          <button className="btn btn--ghost btn--sm" onClick={onClose} style={{ padding: '4px' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-dialog__body">
            {availableJobs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#94A3B8' }}>
                <p style={{ marginBottom: '8px' }}>
                  {contact.name} is already linked to all currently tracked job opportunities!
                </p>
                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                  Track another application first if you need an additional referral link.
                </span>
              </div>
            ) : (
              <>
                <div className="form-group">
                  <label htmlFor="assign-job">Target Job Opportunity *</label>
                  <select
                    id="assign-job"
                    className="select"
                    value={selectedJobId}
                    onChange={(e) => setSelectedJobId(e.target.value)}
                  >
                    {availableJobs.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.company} — {j.role} (Target: {new Date(j.application_deadline).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="assign-status">Referral Status</label>
                  <select
                    id="assign-status"
                    className="select"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ReferralStatus)}
                  >
                    <option value="not_asked">Not Yet Asked</option>
                    <option value="asked">Referral Requested / In Discussion</option>
                    <option value="referred">Referred (Application Submitted via Link/Portal)</option>
                    <option value="confirmed">Confirmed by Recruiter / Hiring Team</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="assign-notes">Referral Notes & Details</label>
                  <textarea
                    id="assign-notes"
                    className="textarea"
                    placeholder="Sent resume link, connected on LinkedIn, warm intro from tech lead..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>

          <div className="modal-dialog__footer">
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              Cancel
            </button>
            {availableJobs.length > 0 && (
              <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
                <Send size={14} />
                <span>{isSubmitting ? 'Saving...' : 'Link Opportunity'}</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
