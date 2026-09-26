import { Router, type Response } from 'express';
import { HTTP_STATUS } from '../core/constants/app.constant.js';
import { asyncHandler } from '../core/middleware/async-handler.js';
import type { AuthenticatedRequest } from '../core/middleware/auth.middleware.js';
import { validateBody } from '../core/middleware/validate.middleware.js';
import { createJobSchema, updateJobSchema } from '../schema/job.schema.js';
import { createJob, deleteJob, listJobs, updateJob } from '../services/job.service.js';

const router = Router();

router.get(
    '/',
    asyncHandler<AuthenticatedRequest>(async (req, res: Response) => {
        res.json(await listJobs(req.userId!));
    }),
);

router.post(
    '/',
    validateBody(createJobSchema),
    asyncHandler<AuthenticatedRequest>(async (req, res: Response) => {
        const job = await createJob(req.userId!, req.body);
        res.status(HTTP_STATUS.CREATED).json(job);
    }),
);

router.put(
    '/:id',
    validateBody(updateJobSchema),
    asyncHandler<AuthenticatedRequest>(async (req, res: Response) => {
        res.json(await updateJob(req.userId!, req.params.id, req.body));
    }),
);

router.delete(
    '/:id',
    asyncHandler<AuthenticatedRequest>(async (req, res: Response) => {
        await deleteJob(req.userId!, req.params.id);
        res.status(HTTP_STATUS.NO_CONTENT).send();
    }),
);

export default router;
