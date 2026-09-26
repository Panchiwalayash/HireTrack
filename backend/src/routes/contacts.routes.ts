import { Router, type Response } from 'express';
import { HTTP_STATUS } from '../core/constants/app.constant.js';
import { asyncHandler } from '../core/middleware/async-handler.js';
import type { AuthenticatedRequest } from '../core/middleware/auth.middleware.js';
import { validateBody } from '../core/middleware/validate.middleware.js';
import { createContactSchema, updateContactSchema } from '../schema/contact.schema.js';
import { createContact, deleteContact, listContacts, updateContact } from '../services/contact.service.js';

const router = Router();

router.get(
    '/',
    asyncHandler<AuthenticatedRequest>(async (req, res: Response) => {
        res.json(await listContacts(req.userId!));
    }),
);

router.post(
    '/',
    validateBody(createContactSchema),
    asyncHandler<AuthenticatedRequest>(async (req, res: Response) => {
        const contact = await createContact(req.userId!, req.body);
        res.status(HTTP_STATUS.CREATED).json(contact);
    }),
);

router.put(
    '/:id',
    validateBody(updateContactSchema),
    asyncHandler<AuthenticatedRequest>(async (req, res: Response) => {
        res.json(await updateContact(req.userId!, req.params.id, req.body));
    }),
);

router.delete(
    '/:id',
    asyncHandler<AuthenticatedRequest>(async (req, res: Response) => {
        await deleteContact(req.userId!, req.params.id);
        res.status(HTTP_STATUS.NO_CONTENT).send();
    }),
);

export default router;
