import type { JOB_STATUSES, WORK_MODELS } from '../core/constants/domain.constant.js';

export type JobStatus = (typeof JOB_STATUSES)[number];

export type WorkModel = (typeof WORK_MODELS)[number];

export interface Job {
    id: string;
    user_id: string;
    company: string;
    role: string;
    location: string;
    work_model: WorkModel;
    salary_min?: number;
    salary_max?: number;
    job_url?: string;
    application_deadline: string;
    status: JobStatus;
    notes?: string;
    created_at?: string;
}

export interface JobWithStats extends Job {
    totalTasks: number;
    completedTasks: number;
    completionPercentage: number;
    daysRemaining: number;
}
