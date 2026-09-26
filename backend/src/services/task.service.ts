import crypto from 'crypto';
import { ERROR_MESSAGE } from '../core/constants/app.constant.js';
import { HttpError } from '../core/errors/http-error.js';
import { taskRepository } from '../db/repositories.js';
import type { Task } from '../models/index.js';
import type { CreateTaskPayload, UpdateTaskPayload } from '../schema/task.schema.js';

export async function listTasks(userId: string): Promise<Task[]> {
    return taskRepository.findAllByUser(userId);
}

export async function createTask(userId: string, payload: CreateTaskPayload): Promise<Task> {
    return taskRepository.insert({
        ...payload,
        id: crypto.randomUUID(),
        user_id: userId,
        updated_at: new Date().toISOString(),
    });
}

export async function updateTask(userId: string, taskId: string, patch: UpdateTaskPayload): Promise<Task> {
    const updated = await taskRepository.updateForUser(taskId, userId, {
        ...patch,
        updated_at: new Date().toISOString(),
    });
    if (!updated) {
        throw HttpError.notFound(ERROR_MESSAGE.TASK_NOT_FOUND);
    }
    return updated;
}

export async function deleteTask(userId: string, taskId: string): Promise<void> {
    const deleted = await taskRepository.deleteForUser(taskId, userId);
    if (!deleted) {
        throw HttpError.notFound(ERROR_MESSAGE.TASK_NOT_FOUND);
    }
}
