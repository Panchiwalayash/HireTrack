import { Router, type Response } from 'express';
import { asyncHandler } from '../core/middleware/async-handler.js';
import type { AuthenticatedRequest } from '../core/middleware/auth.middleware.js';
import { clearUserData, seedDemoData } from '../services/demo.service.js';

const router = Router();

router.post(
    '/seed',
    asyncHandler<AuthenticatedRequest>(async (req, res: Response) => {
        await seedDemoData(req.userId!);
        res.json({ message: 'Demo dataset seeded successfully' });
    }),
);

router.post(
    '/clear',
    asyncHandler<AuthenticatedRequest>(async (req, res: Response) => {
        await clearUserData(req.userId!);
        res.json({ message: 'All records cleared successfully' });
    }),
);

export default router;
