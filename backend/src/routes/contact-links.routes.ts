import { Router, type Response } from 'express';
import { HTTP_STATUS } from '../core/constants/app.constant.js';
import { asyncHandler } from '../core/middleware/async-handler.js';
import type { AuthenticatedRequest } from '../core/middleware/auth.middleware.js';
import { validateBody } from '../core/middleware/validate.middleware.js';
import { updateContactLinkSchema, upsertContactLinkSchema } from '../schema/contact-link.schema.js';
import {
    deleteContactLink,
    listContactLinks,
    updateContactLink,
    upsertContactLink,
} from '../services/contact-link.service.js';

const router = Router();

router.get(
    '/',
    asyncHandler<AuthenticatedRequest>(async (req, res: Response) => {
        res.json(await listContactLinks(req.userId!));
    }),
);

router.post(
    '/',
    validateBody(upsertContactLinkSchema),
    asyncHandler<AuthenticatedRequest>(async (req, res: Response) => {
        const { link, created } = await upsertContactLink(req.userId!, req.body);
        res.status(created ? HTTP_STATUS.CREATED : HTTP_STATUS.OK).json(link);
    }),
);

router.put(
    '/:id',
    validateBody(updateContactLinkSchema),
    asyncHandler<AuthenticatedRequest>(async (req, res: Response) => {
        res.json(await updateContactLink(req.userId!, req.params.id, req.body));
    }),
);

router.delete(
    '/:id',
    asyncHandler<AuthenticatedRequest>(async (req, res: Response) => {
        await deleteContactLink(req.userId!, req.params.id);
        res.status(HTTP_STATUS.NO_CONTENT).send();
    }),
);

export default router;
