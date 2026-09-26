import React, { useState, useEffect } from 'react';
import type { Contact, Job, ContactLink } from '../../models';
import { buildFollowUpEmailUrl, buildMailtoUrl } from '../../lib/gmail';
import { Mail, Copy, Check, ExternalLink, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ContactEmailModalProps {
  isOpen: boolean;
  contact: Contact | null;
  jobs: Job[];
  contactLinks: ContactLink[];
  onClose: () => void;
}

export const ContactEmailModal: React.FC<ContactEmailModalProps> = ({
  isOpen,
  contact,
  jobs,
  contactLinks,
  onClose,
}) => {
  const { user } = useAuth();

  const linkedJobIds = contact ? contactLinks.filter((l) => l.contact_id === contact.id).map((l) => l.job_id) : [];

  const relevantJobs = jobs.filter((j) => (linkedJobIds.length > 0 ? linkedJobIds.includes(j.id) : true));

  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [templateType, setTemplateType] = useState<'follow_up' | 'thank_you' | 'referral_request'>(
    'referral_request',
  );
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (contact && isOpen) {
      const activeJobId = relevantJobs[0]?.id || jobs[0]?.id || '';
      setSelectedJobId(activeJobId);
      const targetJob = jobs.find((j) => j.id === activeJobId) || jobs[0];

      if (targetJob) {
        updateContent(contact, targetJob, templateType);
      }
    }
  }, [isOpen, contact]);

  const updateContent = (
    currentContact: Contact,
    currentJob: Job,
    type: 'follow_up' | 'thank_you' | 'referral_request',
  ) => {
    const candidateName = user?.email
      ? user.email
          .split('@')[0]
          .replace(/[._]/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase())
      : 'Candidate';

    if (type === 'referral_request') {
      setSubject(`Referral Request — ${currentJob.role} at ${currentJob.company}`);
      setBody(
        `Hi ${currentContact.name},\n\nI hope you're doing well! I'm reaching out because I saw that ${currentJob.company} has an exciting opening for a ${currentJob.role}.\n\nGiven your experience and leadership, I would be immensely grateful if you'd consider referring me for this position. My background in software engineering and systems aligns strongly with the team's needs.\n\nJob details:\nRole: ${currentJob.role}\nLink: ${currentJob.job_url || 'Available on careers page'}\n\nPlease let me know if you would like me to send over my updated resume or any further details. Thank you so much for your time and guidance!\n\nBest regards,\n${candidateName}`,
      );
    } else if (type === 'thank_you') {
      setSubject(`Thank You — ${currentJob.role} Interview at ${currentJob.company}`);
      setBody(
        `Dear ${currentContact.name},\n\nThank you very much for speaking with me today regarding the ${currentJob.role} opportunity at ${currentJob.company}.\n\nI really enjoyed learning more about the engineering challenges your team is solving. Our discussion reinforced my enthusiasm for joining the team and contributing to ${currentJob.company}'s mission.\n\nPlease let me know if there are any other materials or references I can provide. I look forward to the next steps!\n\nWarm regards,\n${candidateName}`,
      );
    } else {
      setSubject(`Following Up — ${currentJob.role} Application at ${currentJob.company}`);
      setBody(
        `Hi ${currentContact.name},\n\nI hope you are having a wonderful week. I wanted to follow up on my application for the ${currentJob.role} role at ${currentJob.company}.\n\nI remain very enthusiastic about the opportunity to bring my skills in technical design and engineering to the team. Please let me know if there are any updates or if additional details would be helpful at this stage.\n\nThank you for your consideration!\n\nBest regards,\n${candidateName}`,
      );
    }
  };

  if (!isOpen || !contact) return null;

  const activeJob = jobs.find((j) => j.id === selectedJobId) || jobs[0];

  const handleJobChange = (jobId: string) => {
    setSelectedJobId(jobId);
    const target = jobs.find((j) => j.id === jobId);
    if (target) {
      updateContent(contact, target, templateType);
    }
  };

  const handleTemplateChange = (type: 'follow_up' | 'thank_you' | 'referral_request') => {
    setTemplateType(type);
    if (activeJob) {
      updateContent(contact, activeJob, type);
    }
  };

  const handleCopy = () => {
    const fullText = `To: ${contact.email || ''}\nSubject: ${subject}\n\n${body}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const gmailUrl = activeJob ? buildFollowUpEmailUrl(contact, activeJob, templateType) : '#';
  const mailtoUrl = activeJob ? buildMailtoUrl(contact, activeJob, templateType) : '#';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog modal-dialog--wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-dialog__header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(66, 133, 244, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Mail size={18} color="#4285F4" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem' }}>Draft Email to {contact.name}</h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                {contact.role} · {contact.company} {contact.email ? `(${contact.email})` : ''}
              </p>
            </div>
          </div>
          <button className="btn btn--ghost btn--sm" onClick={onClose} style={{ padding: '4px' }}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-dialog__body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {/* Controls row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Email Template Purpose
              </label>
              <select
                className="select"
                value={templateType}
                onChange={(e) => handleTemplateChange(e.target.value as any)}
              >
                <option value="referral_request">🚀 Referral Request / Introduction</option>
                <option value="thank_you">🤝 Post-Interview Thank You Note</option>
                <option value="follow_up">⏱️ Status Follow-up on Application</option>
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Linked Target Role
              </label>
              <select className="select" value={selectedJobId} onChange={(e) => handleJobChange(e.target.value)}>
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.company} — {j.role}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Subject Field */}
          <div className="form-group" style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Subject Line
            </label>
            <input type="text" className="input" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>

          {/* Body Field */}
          <div className="form-group" style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Email Body (Editable)
            </label>
            <textarea
              className="textarea"
              rows={11}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              style={{ fontFamily: 'inherit', lineHeight: '1.6' }}
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-dialog__footer" style={{ justifyContent: 'space-between' }}>
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={handleCopy}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {copied ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Subject & Body'}</span>
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" className="btn btn--ghost btn--sm" onClick={onClose}>
              Close
            </button>

            {contact.email ? (
              <>
                <a
                  href={mailtoUrl}
                  className="btn btn--secondary btn--sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Mail size={14} />
                  <span>Default Mail</span>
                </a>

                <a
                  href={gmailUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn--primary btn--sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <ExternalLink size={14} />
                  <span>Open in Gmail</span>
                </a>
              </>
            ) : (
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
                Add email address to contact for one-click compose
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
