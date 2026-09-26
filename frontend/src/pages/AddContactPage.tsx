import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Users, ArrowLeft, UserCheck } from 'lucide-react';

export const AddContactPage: React.FC = () => {
  const navigate = useNavigate();
  const { handleSaveContact } = useData();

  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [relationship, setRelationship] = useState('Employee Referral / Colleague');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await handleSaveContact({
        name: name.trim(),
        company: company.trim() || 'Tech Company',
        role: role.trim() || 'Software Engineer',
        relationship: relationship.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        linkedin_url: linkedinUrl.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      navigate('/contacts');
    } catch (err) {
      console.error('Failed to save contact:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', paddingBottom: '60px' }}>
      <button
        onClick={() => navigate('/contacts')}
        className="btn btn--ghost btn--sm"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}
      >
        <ArrowLeft size={16} />
        <span>Back to Contacts</span>
      </button>

      <div
        style={{
          background: 'var(--bg-card-solid)',
          borderRadius: '16px',
          border: '1px solid var(--border-medium)',
          padding: '32px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'rgba(99, 102, 241, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <UserCheck size={22} color="#818CF8" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.4rem' }}>Add Professional Contact</h2>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Track recruiters, hiring managers, and internal referrers for your target companies
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginBottom: '18px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Full Name *</label>
              <input
                type="text"
                required
                className="input"
                placeholder="e.g. Sarah Chen"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Company *</label>
              <input
                type="text"
                required
                className="input"
                placeholder="e.g. Google, Stripe, Meta"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginBottom: '18px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Title / Role</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Senior Technical Recruiter / Staff SWE"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Relationship</label>
              <select className="select" value={relationship} onChange={(e) => setRelationship(e.target.value)}>
                <option value="Employee Referral / Colleague">Employee Referral / Colleague</option>
                <option value="Technical Recruiter">Technical Recruiter</option>
                <option value="Hiring Manager">Hiring Manager</option>
                <option value="Alumni Connection">Alumni Connection</option>
                <option value="Mentor / Advisor">Mentor / Advisor</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginBottom: '18px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Email Address</label>
              <input
                type="email"
                className="input"
                placeholder="sarah.chen@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Phone (Optional)</label>
              <input
                type="tel"
                className="input"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '18px' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>LinkedIn Profile URL</label>
            <input
              type="url"
              className="input"
              placeholder="https://linkedin.com/in/username"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Context & Notes</label>
            <textarea
              className="textarea"
              rows={3}
              placeholder="How you met, projects discussed, referral guidelines..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" className="btn btn--ghost" onClick={() => navigate('/contacts')}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
              <Users size={16} />
              <span>{isSubmitting ? 'Saving...' : 'Save Contact'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
