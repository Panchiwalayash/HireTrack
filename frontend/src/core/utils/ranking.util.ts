import type { Job, NeedsAttentionItem, Task, UrgencyLevel } from '../../models';
import {
  CRITICAL_THRESHOLD_DAYS,
  DEFAULT_NEEDS_ATTENTION_LIMIT,
  DEFAULT_TASK_WEIGHT,
  MILLISECONDS_PER_DAY,
  PERCENTAGE_MULTIPLIER,
  TASK_WEIGHTS,
  TERMINAL_JOB_STATUSES,
  URGENT_THRESHOLD_DAYS,
} from '../constants/ranking.constant';

export function calculateJobCompletionPercentage(jobTasks: Task[]): number {
  if (!jobTasks || jobTasks.length === 0) {
    return 0;
  }
  const completed = jobTasks.filter((task) => task.status === 'done').length;
  return Math.round((completed / jobTasks.length) * PERCENTAGE_MULTIPLIER);
}

export function calculateDaysRemaining(deadlineIso: string, referenceDate: Date = new Date()): number {
  if (!deadlineIso) {
    return 0;
  }
  const deadline = new Date(deadlineIso);
  return Math.ceil((deadline.getTime() - referenceDate.getTime()) / MILLISECONDS_PER_DAY);
}

export function determineUrgencyLevel(daysRemaining: number): UrgencyLevel {
  if (daysRemaining < 0) {
    return 'overdue';
  }
  if (daysRemaining <= CRITICAL_THRESHOLD_DAYS) {
    return 'critical';
  }
  if (daysRemaining <= URGENT_THRESHOLD_DAYS) {
    return 'urgent';
  }
  return 'upcoming';
}

export function getNeedsAttentionItems(
  jobs: Job[],
  tasks: Task[],
  limit: number = DEFAULT_NEEDS_ATTENTION_LIMIT,
  referenceDate: Date = new Date(),
): NeedsAttentionItem[] {
  const jobMap = new Map<string, Job>(jobs.map((job) => [job.id, job]));
  const rankedItems: NeedsAttentionItem[] = [];

  for (const task of tasks) {
    if (task.status === 'done') {
      continue;
    }

    const job = jobMap.get(task.job_id);
    if (!job || TERMINAL_JOB_STATUSES.includes(job.status)) {
      continue;
    }

    const daysRemaining = calculateDaysRemaining(job.application_deadline, referenceDate);
    const weight = TASK_WEIGHTS[task.type] || DEFAULT_TASK_WEIGHT;

    rankedItems.push({
      taskId: task.id,
      jobId: job.id,
      company: job.company,
      role: job.role,
      taskType: task.type,
      deadline: job.application_deadline,
      daysRemaining,
      urgencyScore: daysRemaining < 0 ? daysRemaining * weight : daysRemaining / weight,
      urgencyLevel: determineUrgencyLevel(daysRemaining),
      status: task.status,
      notes: task.notes,
    });
  }

  rankedItems.sort((a, b) => {
    if (a.urgencyScore !== b.urgencyScore) {
      return a.urgencyScore - b.urgencyScore;
    }
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });

  return rankedItems.slice(0, limit);
}
