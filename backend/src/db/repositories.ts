import type { Contact, ContactLink, Job, Task } from '../models/index.js';
import { Repository } from './repository.js';

export const jobRepository = new Repository<Job>('jobs', 'jobs');
export const taskRepository = new Repository<Task>('tasks', 'tasks');
export const contactRepository = new Repository<Contact>('contacts', 'contacts');
export const contactLinkRepository = new Repository<ContactLink>('contact_links', 'contactLinks');
