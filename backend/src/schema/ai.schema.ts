import { z } from 'zod';
import { WORK_MODELS } from '../core/constants/domain.constant.js';

const candidateProfileSchema = z.object({
    skills: z.array(z.string().trim()).default([]),
    yearsOfExperience: z.coerce.number().nonnegative().default(0),
    targetRoleLevel: z.string().trim().default('mid'),
    desiredSalaryMin: z.coerce.number().nonnegative().optional(),
    desiredSalaryMax: z.coerce.number().nonnegative().optional(),
    workPreference: z.enum(WORK_MODELS).default('hybrid'),
});

export const companyFitSchema = z.object({
    companyName: z.string().trim().min(1, 'companyName is required'),
    companyWebsite: z.string().trim().optional(),
    careerUrl: z.string().trim().optional(),
    targetRole: z.string().trim().default('Software Engineer'),
    jobDescription: z.string().trim().optional(),
    industry: z.string().trim().optional(),
    companyStage: z.string().trim().optional(),
    workModel: z.enum(WORK_MODELS).optional(),
    profile: candidateProfileSchema.optional(),
    modelConfig: z
        .object({
            provider: z.string().trim().optional(),
            model: z.string().trim().optional(),
            apiKey: z.string().trim().optional(),
        })
        .optional(),
});

export const previewSiteSchema = z.object({
    url: z.string().trim().min(1, 'URL is required'),
});

export type CompanyFitPayload = z.infer<typeof companyFitSchema>;
export type PreviewSitePayload = z.infer<typeof previewSiteSchema>;
