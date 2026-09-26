import crypto from 'crypto';
import { ERROR_MESSAGE } from '../core/constants/app.constant.js';
import { DEFAULT_JOB_TASK_TYPES, DEFAULT_TASK_STATUS } from '../core/constants/domain.constant.js';
import { HttpError } from '../core/errors/http-error.js';
import { contactLinkRepository, jobRepository, taskRepository } from '../db/repositories.js';
import type { Job, Task } from '../models/index.js';
import type { CreateJobPayload, UpdateJobPayload } from '../schema/job.schema.js';

export async function listJobs(userId: string): Promise<Job[]> {
    return jobRepository.findAllByUser(userId, { column: 'application_deadline', ascending: true });
}

export async function createJob(userId: string, payload: CreateJobPayload): Promise<Job> {
    const { autoCreateTasks, ...jobFields } = payload;

    const job: Job = {
        ...jobFields,
        job_url: jobFields.job_url || undefined,
        id: crypto.randomUUID(),
        user_id: userId,
        created_at: new Date().toISOString(),
    };

    const created = await jobRepository.insert(job);

    if (autoCreateTasks) {
        await taskRepository.insertMany(buildDefaultTasks(userId, created.id));
    }

    return created;
}

export async function updateJob(userId: string, jobId: string, patch: UpdateJobPayload): Promise<Job> {
    const updated = await jobRepository.updateForUser(jobId, userId, patch);
    if (!updated) {
        throw HttpError.notFound(ERROR_MESSAGE.JOB_NOT_FOUND);
    }
    return updated;
}

export async function deleteJob(userId: string, jobId: string): Promise<void> {
    const existing = await jobRepository.findByIdForUser(jobId, userId);
    if (!existing) {
        throw HttpError.notFound(ERROR_MESSAGE.JOB_NOT_FOUND);
    }

    const [tasks, links] = await Promise.all([
        taskRepository.findAllByUser(userId),
        contactLinkRepository.findAllByUser(userId),
    ]);

    await Promise.all([
        ...tasks.filter((task) => task.job_id === jobId).map((task) => taskRepository.deleteForUser(task.id, userId)),
        ...links
            .filter((link) => link.job_id === jobId)
            .map((link) => contactLinkRepository.deleteForUser(link.id, userId)),
    ]);

    await jobRepository.deleteForUser(jobId, userId);
}

function buildDefaultTasks(userId: string, jobId: string): Task[] {
    const timestamp = new Date().toISOString();
    return DEFAULT_JOB_TASK_TYPES.map((type) => ({
        id: crypto.randomUUID(),
        user_id: userId,
        job_id: jobId,
        type,
        status: DEFAULT_TASK_STATUS,
        updated_at: timestamp,
    }));
}
