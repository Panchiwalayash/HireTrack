import { Router, type Response } from 'express';
import { HTTP_STATUS } from '../core/constants/app.constant.js';
import { asyncHandler } from '../core/middleware/async-handler.js';
import type { AuthenticatedRequest } from '../core/middleware/auth.middleware.js';
import { validateBody } from '../core/middleware/validate.middleware.js';
import { createTaskSchema, updateTaskSchema } from '../schema/task.schema.js';
import { createTask, deleteTask, listTasks, updateTask } from '../services/task.service.js';

const router = Router();

router.get(
    '/',
    asyncHandler<AuthenticatedRequest>(async (req, res: Response) => {
        res.json(await listTasks(req.userId!));
    }),
);

router.post(
    '/',
    validateBody(createTaskSchema),
    asyncHandler<AuthenticatedRequest>(async (req, res: Response) => {
        const task = await createTask(req.userId!, req.body);
        res.status(HTTP_STATUS.CREATED).json(task);
    }),
);

router.put(
    '/:id',
    validateBody(updateTaskSchema),
    asyncHandler<AuthenticatedRequest>(async (req, res: Response) => {
        res.json(await updateTask(req.userId!, req.params.id, req.body));
    }),
);

router.delete(
    '/:id',
    asyncHandler<AuthenticatedRequest>(async (req, res: Response) => {
        await deleteTask(req.userId!, req.params.id);
        res.status(HTTP_STATUS.NO_CONTENT).send();
    }),
);

export default router;
