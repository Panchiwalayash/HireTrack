import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { WORK_MODELS } from '../core/constants/domain.constant';
import { createJob, deleteJob, fetchJobs, updateJob } from '../services/job.service';
import { createTask, deleteTask, fetchTasks, updateTask } from '../services/task.service';
import { createContact, deleteContact, fetchContacts } from '../services/contact.service';
import { deleteContactLink, fetchContactLinks, saveContactLink } from '../services/contact-link.service';
import { clearAllUserData } from '../services/demo.service';
import type { Job, JobStatus, Task, Contact, ContactLink, TaskType, TaskStatus, ReferralStatus } from '../models';

interface DataContextType {
  jobs: Job[];
  tasks: Task[];
  contacts: Contact[];
  contactLinks: ContactLink[];
  isDataLoading: boolean;
  loadData: () => Promise<void>;
  handleSaveJob: (jobData: Omit<Job, 'id' | 'created_at' | 'user_id'>, autoCreateTasks: boolean) => Promise<void>;
  handleUpdateJobStatus: (jobId: string, newStatus: JobStatus) => Promise<void>;
  handleDeleteJob: (jobId: string) => Promise<void>;
  handleUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => Promise<void>;
  handleSaveTask: (taskData: {
    job_id: string;
    type: TaskType;
    status: TaskStatus;
    notes?: string;
  }) => Promise<void>;
  handleDeleteTask: (taskId: string) => Promise<void>;
  handleSaveContact: (contactData: Omit<Contact, 'id' | 'created_at' | 'user_id'>) => Promise<void>;
  handleDeleteContact: (contactId: string) => Promise<void>;
  handleSaveContactLink: (linkData: {
    contact_id: string;
    job_id: string;
    status: ReferralStatus;
    notes?: string;
  }) => Promise<void>;
  handleUpdateContactLinkStatus: (linkId: string, status: ReferralStatus) => Promise<void>;
  handleDeleteContactLink: (linkId: string) => Promise<void>;
  handleClearData: () => Promise<void>;
  handleImportOptimizedJobs: (
    jobsToImport: Array<{
      company: string;
      role: string;
      location: string;
      work_model: string;
      salary_min?: number;
      salary_max?: number;
      application_deadline: string;
      job_url: string;
      notes: string;
    }>,
  ) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactLinks, setContactLinks] = useState<ContactLink[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) {
      setJobs([]);
      setTasks([]);
      setContacts([]);
      setContactLinks([]);
      return;
    }
    try {
      setIsDataLoading(true);
      const [fetchedJobs, fetchedTasks, fetchedContacts, fetchedLinks] = await Promise.all([
        fetchJobs(user.id),
        fetchTasks(user.id),
        fetchContacts(user.id),
        fetchContactLinks(user.id),
      ]);
      setJobs(fetchedJobs);
      setTasks(fetchedTasks);
      setContacts(fetchedContacts);
      setContactLinks(fetchedLinks);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsDataLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveJob = async (jobData: Omit<Job, 'id' | 'created_at' | 'user_id'>, autoCreateTasks: boolean) => {
    if (!user) return;
    await createJob(jobData, user.id, autoCreateTasks);
    await loadData();
  };

  const handleUpdateJobStatus = async (jobId: string, newStatus: JobStatus) => {
    if (!user) return;
    setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j)));
    try {
      await updateJob(jobId, { status: newStatus }, user.id);
    } catch (err) {
      console.error('Failed to update job status:', err);
      await loadData();
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!user) return;
    if (window.confirm('Delete this job application and all associated tasks?')) {
      await deleteJob(jobId, user.id);
      await loadData();
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
    if (!user) return;
    await updateTask(taskId, { status: newStatus }, user.id);
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
  };

  const handleSaveTask = async (taskData: {
    job_id: string;
    type: TaskType;
    status: TaskStatus;
    notes?: string;
  }) => {
    if (!user) return;
    await createTask(taskData, user.id);
    await loadData();
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!user) return;
    await deleteTask(taskId, user.id);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleSaveContact = async (contactData: Omit<Contact, 'id' | 'created_at' | 'user_id'>) => {
    if (!user) return;
    await createContact(contactData, user.id);
    await loadData();
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!user) return;
    if (window.confirm('Delete this contact and all linked job referrals?')) {
      await deleteContact(contactId, user.id);
      await loadData();
    }
  };

  const handleSaveContactLink = async (linkData: {
    contact_id: string;
    job_id: string;
    status: ReferralStatus;
    notes?: string;
  }) => {
    if (!user) return;
    await saveContactLink(linkData, user.id);
    await loadData();
  };

  const handleUpdateContactLinkStatus = async (linkId: string, status: ReferralStatus) => {
    if (!user) return;
    const target = contactLinks.find((l) => l.id === linkId);
    if (!target) return;
    await saveContactLink(
      { contact_id: target.contact_id, job_id: target.job_id, status, notes: target.notes },
      user.id,
    );
    setContactLinks((prev) => prev.map((l) => (l.id === linkId ? { ...l, status } : l)));
  };

  const handleDeleteContactLink = async (linkId: string) => {
    if (!user) return;
    await deleteContactLink(linkId, user.id);
    setContactLinks((prev) => prev.filter((l) => l.id !== linkId));
  };

  const handleClearData = async () => {
    if (!user) return;
    if (window.confirm('Reset tracker to empty state? All jobs and contacts will be cleared.')) {
      await clearAllUserData(user.id);
      await loadData();
    }
  };

  const handleImportOptimizedJobs = async (
    jobsToImport: Array<{
      company: string;
      role: string;
      location: string;
      work_model: string;
      salary_min?: number;
      salary_max?: number;
      application_deadline: string;
      job_url: string;
      notes: string;
    }>,
  ) => {
    if (!user) return;
    for (const item of jobsToImport) {
      const exists = jobs.some(
        (j) =>
          j.company.toLowerCase() === item.company.toLowerCase() &&
          j.role.toLowerCase() === item.role.toLowerCase(),
      );
      if (!exists) {
        await createJob(
          {
            company: item.company,
            role: item.role,
            location: item.location || 'Remote',
            work_model: WORK_MODELS.includes(item.work_model as (typeof WORK_MODELS)[number])
              ? (item.work_model as (typeof WORK_MODELS)[number])
              : 'remote',
            salary_min: item.salary_min,
            salary_max: item.salary_max,
            application_deadline: item.application_deadline,
            status: 'saved',
            job_url: item.job_url,
            notes: item.notes,
          },
          user.id,
          true,
        );
      }
    }
    await loadData();
  };

  return (
    <DataContext.Provider
      value={{
        jobs,
        tasks,
        contacts,
        contactLinks,
        isDataLoading,
        loadData,
        handleSaveJob,
        handleUpdateJobStatus,
        handleDeleteJob,
        handleUpdateTaskStatus,
        handleSaveTask,
        handleDeleteTask,
        handleSaveContact,
        handleDeleteContact,
        handleSaveContactLink,
        handleUpdateContactLinkStatus,
        handleDeleteContactLink,
        handleClearData,
        handleImportOptimizedJobs,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};
