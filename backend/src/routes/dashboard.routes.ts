import { Router, type Response } from 'express';
import { z } from 'zod';
import { DEFAULT_NEEDS_ATTENTION_LIMIT } from '../core/constants/ranking.constant.js';
import { asyncHandler } from '../core/middleware/async-handler.js';
import type { AuthenticatedRequest } from '../core/middleware/auth.middleware.js';
import { getAttentionItems, getDashboardStats } from '../services/dashboard.service.js';

const router = Router();

const attentionQuerySchema = z.object({
    limit: z.coerce.number().int().positive().max(50).default(DEFAULT_NEEDS_ATTENTION_LIMIT),
});

router.get(
    '/stats',
    asyncHandler<AuthenticatedRequest>(async (req, res: Response) => {
        res.json(await getDashboardStats(req.userId!));
    }),
);

router.get(
    '/attention',
    asyncHandler<AuthenticatedRequest>(async (req, res: Response) => {
        const { limit } = attentionQuerySchema.parse(req.query);
        res.json(await getAttentionItems(req.userId!, limit));
    }),
);

export default router;
