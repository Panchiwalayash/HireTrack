export type ContactRelationship = 'recruiter' | 'referral' | 'hiring_manager' | 'mentor' | 'colleague' | string;

export interface Contact {
    id: string;
    user_id: string;
    name: string;
    company: string;
    role: string;
    relationship: ContactRelationship;
    email?: string;
    linkedin_url?: string;
    phone?: string;
    notes?: string;
    created_at?: string;
}
