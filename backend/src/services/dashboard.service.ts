import { getNeedsAttentionItems, calculateJobCompletionPercentage } from '../core/utils/ranking.util.js';
import { jobRepository, taskRepository } from '../db/repositories.js';
import type { Job, NeedsAttentionItem, Task } from '../models/index.js';
import { DEFAULT_NEEDS_ATTENTION_LIMIT } from '../core/constants/ranking.constant.js';

const APPLIED_STATUSES = ['applied', 'interviewing', 'offer'] as const;

export interface DashboardStats {
    totalJobs: number;
    appliedCount: number;
    interviewingCount: number;
    offersCount: number;
    totalTasks: number;
    completedTasks: number;
    overallCompletionRate: number;
}

async function loadUserData(userId: string): Promise<{ jobs: Job[]; tasks: Task[] }> {
    const [jobs, tasks] = await Promise.all([
        jobRepository.findAllByUser(userId),
        taskRepository.findAllByUser(userId),
    ]);
    return { jobs, tasks };
}

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
    const { jobs, tasks } = await loadUserData(userId);

    return {
        totalJobs: jobs.length,
        appliedCount: jobs.filter((job) => APPLIED_STATUSES.includes(job.status as (typeof APPLIED_STATUSES)[number]))
            .length,
        interviewingCount: jobs.filter((job) => job.status === 'interviewing').length,
        offersCount: jobs.filter((job) => job.status === 'offer').length,
        totalTasks: tasks.length,
        completedTasks: tasks.filter((task) => task.status === 'done').length,
        overallCompletionRate: calculateJobCompletionPercentage(tasks),
    };
}

export async function getAttentionItems(
    userId: string,
    limit: number = DEFAULT_NEEDS_ATTENTION_LIMIT,
): Promise<NeedsAttentionItem[]> {
    const { jobs, tasks } = await loadUserData(userId);
    return getNeedsAttentionItems(jobs, tasks, limit);
}
