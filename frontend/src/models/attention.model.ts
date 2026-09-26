import type { TaskType, TaskStatus } from './task.model';

export type UrgencyLevel = 'critical' | 'urgent' | 'upcoming' | 'overdue';

export interface NeedsAttentionItem {
  taskId: string;
  jobId: string;
  company: string;
  role: string;
  taskType: TaskType;
  deadline: string;
  daysRemaining: number;
  urgencyScore: number;
  urgencyLevel: UrgencyLevel;
  status: TaskStatus;
  notes?: string;
}
