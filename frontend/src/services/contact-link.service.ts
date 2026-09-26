import { httpClient } from '../core/utils/http-client.util';
import type { ContactLink, ReferralStatus } from '../models';

export interface ContactLinkPayload {
  contact_id: string;
  job_id: string;
  status: ReferralStatus;
  notes?: string;
}

export async function fetchContactLinks(userId: string): Promise<ContactLink[]> {
  return httpClient.get<ContactLink[]>('/contact-links', { userId });
}

export async function saveContactLink(link: ContactLinkPayload, userId: string): Promise<ContactLink> {
  return httpClient.post<ContactLink>('/contact-links', { userId, body: link });
}

export async function updateContactLink(
  linkId: string,
  updates: Partial<ContactLink>,
  userId: string,
): Promise<ContactLink> {
  return httpClient.put<ContactLink>(`/contact-links/${linkId}`, { userId, body: updates });
}

export async function deleteContactLink(linkId: string, userId: string): Promise<void> {
  await httpClient.delete(`/contact-links/${linkId}`, { userId });
}
