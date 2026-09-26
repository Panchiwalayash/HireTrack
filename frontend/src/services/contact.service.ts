import { httpClient } from '../core/utils/http-client.util';
import type { Contact } from '../models';

export async function fetchContacts(userId: string): Promise<Contact[]> {
  return httpClient.get<Contact[]>('/contacts', { userId });
}

export async function createContact(
  contact: Omit<Contact, 'id' | 'created_at' | 'user_id'>,
  userId: string,
): Promise<Contact> {
  return httpClient.post<Contact>('/contacts', { userId, body: contact });
}

export async function updateContact(
  contactId: string,
  updates: Partial<Contact>,
  userId: string,
): Promise<Contact> {
  return httpClient.put<Contact>(`/contacts/${contactId}`, { userId, body: updates });
}

export async function deleteContact(contactId: string, userId: string): Promise<void> {
  await httpClient.delete(`/contacts/${contactId}`, { userId });
}
