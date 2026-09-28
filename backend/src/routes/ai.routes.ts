import { Router, type Request, type Response } from 'express';
import { DEFAULT_CANDIDATE_PROFILE } from '../core/constants/ai.constant.js';
import { asyncHandler } from '../core/middleware/async-handler.js';
import { validateBody } from '../core/middleware/validate.middleware.js';
import { companyFitSchema, improveResumeSchema, previewSiteSchema, tailorResumeSchema } from '../schema/ai.schema.js';
import { assessCompanyFitWithAI, fetchCompanyWebsiteText } from '../services/company-ai.service.js';
import { auditAndImproveResume } from '../services/resume-improver.service.js';
import { tailorResumeAndCoverLetter } from '../services/resume-tailor.service.js';

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

router.post(
    '/tailor',
    validateBody(tailorResumeSchema),
    asyncHandler(async (req: Request, res: Response) => {
        const result = await tailorResumeAndCoverLetter(req.body);
        res.json(result);
    }),
);

router.post(
    '/improve-resume',
    validateBody(improveResumeSchema),
    asyncHandler(async (req: Request, res: Response) => {
        const result = await auditAndImproveResume(req.body);
        res.json(result);
    }),
);

export default router;
