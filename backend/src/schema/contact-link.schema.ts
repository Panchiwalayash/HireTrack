import { z } from 'zod';
import { DEFAULT_REFERRAL_STATUS, REFERRAL_STATUSES } from '../core/constants/domain.constant.js';

export const upsertContactLinkSchema = z.object({
    contact_id: z.string().trim().min(1, 'Contact ID is required'),
    job_id: z.string().trim().min(1, 'Job ID is required'),
    status: z.enum(REFERRAL_STATUSES).default(DEFAULT_REFERRAL_STATUS),
    notes: z.string().trim().optional(),
});

export const updateContactLinkSchema = z.object({
    status: z.enum(REFERRAL_STATUSES).optional(),
    notes: z.string().trim().optional(),
});

export type UpsertContactLinkPayload = z.infer<typeof upsertContactLinkSchema>;
export type UpdateContactLinkPayload = z.infer<typeof updateContactLinkSchema>;
