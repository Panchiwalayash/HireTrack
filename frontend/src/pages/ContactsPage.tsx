import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ContactPanel } from '../components/contacts/ContactPanel';
import { AssignReferralModal } from '../components/modals/AssignReferralModal';
import { ContactEmailModal } from '../components/modals/ContactEmailModal';
import type { Contact } from '../models';

export const ContactsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    contacts,
    jobs,
    contactLinks,
    handleDeleteContact,
    handleSaveContactLink,
    handleUpdateContactLinkStatus,
    handleDeleteContactLink,
  } = useData();

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [contactForLink, setContactForLink] = useState<Contact | null>(null);

  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [contactForEmail, setContactForEmail] = useState<Contact | null>(null);

  return (
    <>
      <ContactPanel
        contacts={contacts}
        jobs={jobs}
        contactLinks={contactLinks}
        onOpenNewContact={() => navigate('/contacts/new')}
        onEditContact={(contact: Contact) => navigate(`/contacts/${contact.id}/edit`)}
        onDeleteContact={handleDeleteContact}
        onOpenAssignLink={(contact: Contact) => {
          setContactForLink(contact);
          setIsAssignModalOpen(true);
        }}
        onUpdateLinkStatus={handleUpdateContactLinkStatus}
        onDeleteLink={handleDeleteContactLink}
        onOpenEmailModal={(contact: Contact) => {
          setContactForEmail(contact);
          setIsEmailModalOpen(true);
        }}
      />

      <AssignReferralModal
        isOpen={isAssignModalOpen}
        contact={contactForLink}
        jobs={jobs}
        existingLinks={contactLinks}
        onClose={() => {
          setIsAssignModalOpen(false);
          setContactForLink(null);
        }}
        onSave={handleSaveContactLink}
      />

      <ContactEmailModal
        isOpen={isEmailModalOpen}
        contact={contactForEmail}
        jobs={jobs}
        contactLinks={contactLinks}
        onClose={() => {
          setIsEmailModalOpen(false);
          setContactForEmail(null);
        }}
      />
    </>
  );
};
