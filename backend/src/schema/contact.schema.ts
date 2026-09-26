import { z } from 'zod';

export const createContactSchema = z.object({
    name: z.string().trim().min(1, 'Name is required'),
    company: z.string().trim().min(1, 'Company is required'),
    role: z.string().trim().default(''),
    relationship: z.string().trim().default('recruiter'),
    email: z.string().trim().email('Email must be valid').optional().or(z.literal('')),
    linkedin_url: z.string().trim().url('LinkedIn URL must be valid').optional().or(z.literal('')),
    phone: z.string().trim().optional(),
    notes: z.string().trim().optional(),
});

export const updateContactSchema = createContactSchema.partial();

export type CreateContactPayload = z.infer<typeof createContactSchema>;
export type UpdateContactPayload = z.infer<typeof updateContactSchema>;
