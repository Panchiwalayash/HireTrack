import type { REFERRAL_STATUSES } from '../core/constants/domain.constant.js';

export type ReferralStatus = (typeof REFERRAL_STATUSES)[number];

export interface ContactLink {
    id: string;
    user_id: string;
    contact_id: string;
    job_id: string;
    status: ReferralStatus;
    notes?: string;
    last_updated?: string;
}

export interface EnrichedContactLink extends ContactLink {
    contact_name?: string;
    company_name?: string;
    role_name?: string;
    deadline?: string;
}
