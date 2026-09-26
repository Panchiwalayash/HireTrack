import { httpClient } from '../core/utils/http-client.util';
import type { Task } from '../models';

export async function fetchTasks(userId: string): Promise<Task[]> {
  return httpClient.get<Task[]>('/tasks', { userId });
}

export async function createTask(
  task: Omit<Task, 'id' | 'updated_at' | 'user_id'>,
  userId: string,
): Promise<Task> {
  return httpClient.post<Task>('/tasks', { userId, body: task });
}

export async function updateTask(taskId: string, updates: Partial<Task>, userId: string): Promise<Task> {
  return httpClient.put<Task>(`/tasks/${taskId}`, { userId, body: updates });
}

export async function deleteTask(taskId: string, userId: string): Promise<void> {
  await httpClient.delete(`/tasks/${taskId}`, { userId });
}
