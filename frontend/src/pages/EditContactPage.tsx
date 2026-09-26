import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { updateContact } from '../services/contact.service';
import { ArrowLeft, Save, Trash2, UserCheck } from 'lucide-react';

export const EditContactPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { contacts, loadData, handleDeleteContact } = useData();

  const currentContact = contacts.find((c) => c.id === id);

  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [relationship, setRelationship] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentContact) {
      setName(currentContact.name);
      setCompany(currentContact.company || '');
      setRole(currentContact.role || '');
      setRelationship(currentContact.relationship || '');
      setEmail(currentContact.email || '');
      setPhone(currentContact.phone || '');
      setLinkedinUrl(currentContact.linkedin_url || '');
      setNotes(currentContact.notes || '');
    }
  }, [currentContact]);

  if (!currentContact) {
    return (
      <div style={{ maxWidth: '700px', margin: '40px auto', textAlign: 'center' }}>
        <h2>Contact Not Found</h2>
        <p style={{ color: 'var(--text-secondary)' }}>The requested contact could not be located.</p>
        <button onClick={() => navigate('/contacts')} className="btn btn--primary" style={{ marginTop: '16px' }}>
          Back to Contacts
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !user || !id) return;

    setIsSubmitting(true);
    try {
      await updateContact(
        id,
        {
          name: name.trim(),
          company: company.trim() || 'Tech Company',
          role: role.trim() || 'Software Engineer',
          relationship: relationship.trim(),
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          linkedin_url: linkedinUrl.trim() || undefined,
          notes: notes.trim() || undefined,
        },
        user.id,
      );
      await loadData();
      navigate('/contacts');
    } catch (err) {
      console.error('Failed to update contact:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    await handleDeleteContact(id);
    navigate('/contacts');
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
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
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
              <h2 style={{ margin: 0, fontSize: '1.4rem' }}>Edit Contact: {currentContact.name}</h2>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Update contact credentials and professional referral details
              </p>
            </div>
          </div>

          <button
            type="button"
            className="btn btn--danger btn--sm"
            onClick={handleDelete}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Trash2 size={14} />
            <span>Delete Contact</span>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginBottom: '18px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Full Name *</label>
              <input
                type="text"
                required
                className="input"
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
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginBottom: '18px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Title / Role</label>
              <input type="text" className="input" value={role} onChange={(e) => setRole(e.target.value)} />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Relationship</label>
              <input
                type="text"
                className="input"
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginBottom: '18px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Email Address</label>
              <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Phone</label>
              <input type="tel" className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '18px' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>LinkedIn Profile URL</label>
            <input
              type="url"
              className="input"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Context & Notes</label>
            <textarea className="textarea" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" className="btn btn--ghost" onClick={() => navigate('/contacts')}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
              <Save size={16} />
              <span>{isSubmitting ? 'Saving...' : 'Update Contact'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
