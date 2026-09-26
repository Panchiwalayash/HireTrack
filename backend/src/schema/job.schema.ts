import { z } from 'zod';
import {
    DEFAULT_JOB_LOCATION,
    DEFAULT_JOB_STATUS,
    DEFAULT_WORK_MODEL,
    JOB_STATUSES,
    WORK_MODELS,
} from '../core/constants/domain.constant.js';

export const createJobSchema = z
    .object({
        company: z.string().trim().min(1, 'Company is required'),
        role: z.string().trim().min(1, 'Role is required'),
        application_deadline: z.string().trim().min(1, 'Application deadline is required'),
        location: z.string().trim().default(DEFAULT_JOB_LOCATION),
        work_model: z.enum(WORK_MODELS).default(DEFAULT_WORK_MODEL),
        status: z.enum(JOB_STATUSES).default(DEFAULT_JOB_STATUS),
        salary_min: z.coerce.number().nonnegative().optional(),
        salary_max: z.coerce.number().nonnegative().optional(),
        job_url: z.string().trim().url('Job URL must be a valid URL').optional().or(z.literal('')),
        notes: z.string().trim().optional(),
        autoCreateTasks: z.boolean().default(true),
    })
    .refine((job) => job.salary_min === undefined || job.salary_max === undefined || job.salary_min <= job.salary_max, {
        message: 'Minimum salary cannot exceed maximum salary',
        path: ['salary_min'],
    });

export const updateJobSchema = z.object({
    company: z.string().trim().min(1).optional(),
    role: z.string().trim().min(1).optional(),
    application_deadline: z.string().trim().min(1).optional(),
    location: z.string().trim().optional(),
    work_model: z.enum(WORK_MODELS).optional(),
    status: z.enum(JOB_STATUSES).optional(),
    salary_min: z.coerce.number().nonnegative().optional(),
    salary_max: z.coerce.number().nonnegative().optional(),
    job_url: z.string().trim().url().optional().or(z.literal('')),
    notes: z.string().trim().optional(),
});

export type CreateJobPayload = z.infer<typeof createJobSchema>;
export type UpdateJobPayload = z.infer<typeof updateJobSchema>;
