import { z } from 'zod';
import { DEFAULT_TASK_STATUS, TASK_STATUSES, TASK_TYPES } from '../core/constants/domain.constant.js';

export const createTaskSchema = z.object({
    job_id: z.string().trim().min(1, 'Job ID is required'),
    type: z.enum(TASK_TYPES),
    status: z.enum(TASK_STATUSES).default(DEFAULT_TASK_STATUS),
    notes: z.string().trim().optional(),
});

export const updateTaskSchema = z.object({
    job_id: z.string().trim().min(1).optional(),
    type: z.enum(TASK_TYPES).optional(),
    status: z.enum(TASK_STATUSES).optional(),
    notes: z.string().trim().optional(),
});

export type CreateTaskPayload = z.infer<typeof createTaskSchema>;
export type UpdateTaskPayload = z.infer<typeof updateTaskSchema>;
