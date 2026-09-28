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

export const tailorResumeSchema = z.object({
    companyName: z.string().trim().default('Target Company'),
    targetRole: z.string().trim().default('Software Engineer'),
    jobDescription: z.string().trim().min(10, 'Job description must be at least 10 characters'),
    currentResume: z.string().trim().optional(),
    applicantName: z.string().trim().default('Candidate'),
    tone: z.enum(['impactful_tech', 'executive', 'conversational', 'startup']).default('impactful_tech'),
    focus: z.enum(['all', 'resume_bullets', 'cover_letter']).default('all'),
    modelConfig: z
        .object({
            provider: z.string().trim().optional(),
            model: z.string().trim().optional(),
            apiKey: z.string().trim().optional(),
        })
        .optional(),
});

export const improveResumeSchema = z.object({
    resumeText: z.string().trim().optional(),
    singleBullet: z.string().trim().optional(),
    targetRole: z.string().trim().default('Software Engineer'),
    seniority: z.enum(['junior', 'mid', 'senior', 'staff']).default('mid'),
    modelConfig: z
        .object({
            provider: z.string().trim().optional(),
            model: z.string().trim().optional(),
            apiKey: z.string().trim().optional(),
        })
        .optional(),
});

export type CompanyFitPayload = z.infer<typeof companyFitSchema>;
export type PreviewSitePayload = z.infer<typeof previewSiteSchema>;
export type TailorResumePayload = z.infer<typeof tailorResumeSchema>;
export type ImproveResumePayload = z.infer<typeof improveResumeSchema>;
