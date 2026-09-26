import type { TASK_STATUSES, TASK_TYPES } from '../core/constants/domain.constant.js';

export type TaskType = (typeof TASK_TYPES)[number];

export type TaskStatus = (typeof TASK_STATUSES)[number];

export interface Task {
    id: string;
    user_id: string;
    job_id: string;
    type: TaskType;
    status: TaskStatus;
    notes?: string;
    updated_at?: string;
}
