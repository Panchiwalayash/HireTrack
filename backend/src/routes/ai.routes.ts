import { Router, type Request, type Response } from 'express';
import { DEFAULT_CANDIDATE_PROFILE } from '../core/constants/ai.constant.js';
import { asyncHandler } from '../core/middleware/async-handler.js';
import { validateBody } from '../core/middleware/validate.middleware.js';
import { companyFitSchema, previewSiteSchema } from '../schema/ai.schema.js';
import { assessCompanyFitWithAI, fetchCompanyWebsiteText } from '../services/company-ai.service.js';

const router = Router();

router.post(
    '/company-fit',
    validateBody(companyFitSchema),
    asyncHandler(async (req: Request, res: Response) => {
        const payload = req.body;
        const result = await assessCompanyFitWithAI({
            ...payload,
            profile: payload.profile ?? DEFAULT_CANDIDATE_PROFILE,
        });
        res.json(result);
    }),
);

router.post(
    '/preview-site',
    validateBody(previewSiteSchema),
    asyncHandler(async (req: Request, res: Response) => {
        const text = await fetchCompanyWebsiteText(req.body.url);
        res.json({ url: req.body.url, extractedSnippet: text, length: text.length });
    }),
);

export default router;
