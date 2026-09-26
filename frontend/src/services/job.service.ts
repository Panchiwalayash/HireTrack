import { httpClient } from '../core/utils/http-client.util';
import type { Job } from '../models';

export async function fetchJobs(userId: string): Promise<Job[]> {
  return httpClient.get<Job[]>('/jobs', { userId });
}

export async function createJob(
  job: Omit<Job, 'id' | 'created_at' | 'user_id'>,
  userId: string,
  autoCreateTasks = true,
): Promise<Job> {
  return httpClient.post<Job>('/jobs', { userId, body: { ...job, autoCreateTasks } });
}

export async function updateJob(jobId: string, updates: Partial<Job>, userId: string): Promise<Job> {
  return httpClient.put<Job>(`/jobs/${jobId}`, { userId, body: updates });
}

export async function deleteJob(jobId: string, userId: string): Promise<void> {
  await httpClient.delete(`/jobs/${jobId}`, { userId });
}
