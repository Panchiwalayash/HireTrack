import type { JobStatus, TaskType } from '../../models';

export const TASK_WEIGHTS: Record<TaskType, number> = {
  System_Design: 1.5,
  Coding_Challenge: 1.4,
  Take_Home: 1.3,
  Cover_Letter: 1.2,
  Resume: 1.2,
  Behavioral: 1.1,
  Negotiation: 1.0,
  Background_Check: 0.9,
  Other: 1.0,
};

export const DEFAULT_TASK_WEIGHT = 1.0;

export const DEFAULT_NEEDS_ATTENTION_LIMIT = 3;

export const CRITICAL_THRESHOLD_DAYS = 7;

export const URGENT_THRESHOLD_DAYS = 21;

export const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

export const TERMINAL_JOB_STATUSES: readonly JobStatus[] = ['offer', 'rejected', 'withdrawn', 'ghosted'];

export const PERCENTAGE_MULTIPLIER = 100;
