import React from 'react';
import type { Contact, Job, ContactLink, ReferralStatus } from '../../models';
import { Mail, Phone, Plus, Trash2, Edit2, UserCheck, ExternalLink, Send } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ContactPanelProps {
  contacts: Contact[];
  jobs: Job[];
  contactLinks: ContactLink[];
  onOpenNewContact: () => void;
  onEditContact: (contact: Contact) => void;
  onDeleteContact: (contactId: string) => void;
  onOpenAssignLink: (contact: Contact) => void;
  onUpdateLinkStatus: (linkId: string, newStatus: ReferralStatus) => void;
  onDeleteLink: (linkId: string) => void;
  onOpenEmailModal: (contact: Contact) => void;
}

export const ContactPanel: React.FC<ContactPanelProps> = ({
  contacts,
  jobs,
  contactLinks,
  onOpenNewContact,
  onEditContact,
  onDeleteContact,
  onOpenAssignLink,
  onUpdateLinkStatus,
  onDeleteLink,
  onOpenEmailModal,
}) => {
  const jobMap = new Map(jobs.map((j) => [j.id, j]));

  const totalLinks = contactLinks.length;
  const confirmedReferrals = contactLinks.filter(
    (l) => l.status === 'confirmed' || l.status === 'referred',
  ).length;
  const inDiscussion = contactLinks.filter((l) => l.status === 'asked').length;

  const handleCycleStatus = (link: ContactLink) => {
    const cycleMap: Record<ReferralStatus, ReferralStatus> = {
      not_asked: 'asked',
      asked: 'referred',
      referred: 'confirmed',
      confirmed: 'not_asked',
    };
    const nextStatus = cycleMap[link.status];
    if (nextStatus === 'confirmed' || nextStatus === 'referred') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#10B981', '#06B6D4'],
      });
    }
    onUpdateLinkStatus(link.id, nextStatus);
  };

  const getStatusBadgeStyle = (status: ReferralStatus) => {
    switch (status) {
      case 'confirmed':
        return {
          background: 'rgba(16, 185, 129, 0.18)',
          color: '#6EE7B7',
          border: '1px solid rgba(16, 185, 129, 0.35)',
        };
      case 'referred':
        return {
          background: 'rgba(6, 182, 212, 0.18)',
          color: '#67E8F9',
          border: '1px solid rgba(6, 182, 212, 0.35)',
        };
      case 'asked':
        return {
          background: 'rgba(245, 158, 11, 0.18)',
          color: '#FDE68A',
          border: '1px solid rgba(245, 158, 11, 0.35)',
        };
      case 'not_asked':
      default:
        return {
          background: 'rgba(148, 163, 184, 0.15)',
          color: '#CBD5E1',
          border: '1px solid rgba(148, 163, 184, 0.25)',
        };
    }
  };

  return (
    <div>
      <div className="section-title-bar">
        <div>
          <h2>Professional Network & Referrals</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Manage recruiters, referrers, and hiring managers with many-to-many application tracking
          </p>
        </div>

        <button className="btn btn--primary btn--sm" onClick={onOpenNewContact}>
          <Plus size={16} />
          <span>Add Contact</span>
        </button>
      </div>

      {/* Aggregate Referral Progress Bar */}
      {totalLinks > 0 && (
        <div
          style={{
            background: 'var(--bg-card-solid)',
            border: '1px solid var(--border-medium)',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Total Linked Applications</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>{totalLinks}</div>
          </div>

          <div>
            <div style={{ fontSize: '0.78rem', color: '#10B981' }}>Referred / Confirmed</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#10B981' }}>
              {confirmedReferrals}
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: '4px' }}>
                ({totalLinks > 0 ? Math.round((confirmedReferrals / totalLinks) * 100) : 0}%)
              </span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.78rem', color: '#F59E0B' }}>Referrals In Discussion</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#F59E0B' }}>{inDiscussion}</div>
          </div>
        </div>
      )}

      {contacts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">
            <UserCheck size={32} />
          </div>
          <h3 className="empty-state__title">No Contacts Registered Yet</h3>
          <p className="empty-state__desc">
            Build your referral graph by adding recruiters, alumni connections, and engineers at your target
            companies.
          </p>
          <button className="btn btn--primary" onClick={onOpenNewContact}>
            <Plus size={16} />
            <span>Add First Contact</span>
          </button>
        </div>
      ) : (
        <div
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}
        >
          {contacts.map((contact) => {
            const assignedLinks = contactLinks.filter((l) => l.contact_id === contact.id);

            return (
              <div
                key={contact.id}
                style={{
                  background: 'var(--bg-card-solid)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '12px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                      {contact.name}
                    </h3>
                    <div style={{ fontSize: '0.82rem', color: '#06B6D4', fontWeight: 500 }}>
                      {contact.role} · {contact.company}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {contact.relationship}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      className="btn btn--ghost btn--sm"
                      style={{ padding: '4px' }}
                      onClick={() => onEditContact(contact)}
                      title="Edit contact"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      className="btn btn--ghost btn--sm"
                      style={{ padding: '4px', color: '#F43F5E' }}
                      onClick={() => onDeleteContact(contact.id)}
                      title="Delete contact"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Contact info channels */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '0.78rem' }}>
                  {contact.email && (
                    <a
                      href={`mailto:${contact.email}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: 'var(--text-secondary)',
                        textDecoration: 'none',
                        background: 'var(--bg-input)',
                        padding: '3px 8px',
                        borderRadius: '6px',
                      }}
                    >
                      <Mail size={12} color="#6366F1" />
                      <span>{contact.email}</span>
                    </a>
                  )}

                  {contact.phone && (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: 'var(--text-secondary)',
                        background: 'var(--bg-input)',
                        padding: '3px 8px',
                        borderRadius: '6px',
                      }}
                    >
                      <Phone size={12} color="#10B981" />
                      <span>{contact.phone}</span>
                    </span>
                  )}

                  {contact.linkedin_url && (
                    <a
                      href={contact.linkedin_url}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: '#38BDF8',
                        textDecoration: 'none',
                        background: 'var(--bg-input)',
                        padding: '3px 8px',
                        borderRadius: '6px',
                      }}
                    >
                      <ExternalLink size={12} color="#0EA5E9" />
                      <span>LinkedIn</span>
                    </a>
                  )}
                </div>

                {contact.notes && (
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderLeft: '2px solid #A855F7',
                      padding: '6px 10px',
                      borderRadius: '0 4px 4px 0',
                      fontSize: '0.78rem',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    "{contact.notes}"
                  </div>
                )}

                {/* Linked Jobs (M:N) */}
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px',
                    }}
                  >
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                      Linked Roles ({assignedLinks.length})
                    </span>
                    <button
                      className="btn btn--ghost btn--sm"
                      style={{ fontSize: '0.72rem', padding: '2px 6px' }}
                      onClick={() => onOpenAssignLink(contact)}
                    >
                      <Plus size={11} />
                      <span>Link Job</span>
                    </button>
                  </div>

                  {assignedLinks.length === 0 ? (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      No jobs linked to this contact yet. Click "Link Job" to track a referral.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {assignedLinks.map((link) => {
                        const targetJob = jobMap.get(link.job_id);
                        const badgeStyle = getStatusBadgeStyle(link.status);

                        return (
                          <div
                            key={link.id}
                            style={{
                              background: 'var(--bg-input)',
                              borderRadius: '8px',
                              padding: '8px 10px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                                {targetJob ? targetJob.company : 'Unknown Company'}
                              </div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                {targetJob ? targetJob.role : 'Position'}
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span
                                style={{
                                  ...badgeStyle,
                                  fontSize: '0.7rem',
                                  padding: '2px 8px',
                                  borderRadius: '6px',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                }}
                                onClick={() => handleCycleStatus(link)}
                                title="Click to update referral status"
                              >
                                {link.status.replace('_', ' ')}
                              </span>

                              <button
                                className="btn btn--ghost btn--sm"
                                style={{ padding: '2px', color: '#F43F5E' }}
                                onClick={() => onDeleteLink(link.id)}
                                title="Unlink job"
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Footer action: Send/Draft Email */}
                <div
                  style={{ marginTop: 'auto', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}
                >
                  <button
                    className="btn btn--secondary btn--sm"
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={() => onOpenEmailModal(contact)}
                  >
                    <Send size={13} color="#4285F4" />
                    <span>Draft Email / Follow-up</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
