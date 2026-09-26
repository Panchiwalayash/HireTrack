import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const PLACEHOLDER_FRAGMENTS = ['your-project-ref', 'your-service-role', 'your-anon-key'];

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().int().positive().default(5000),
    SUPABASE_URL: z.string().default(''),
    SUPABASE_SERVICE_ROLE_KEY: z.string().default(''),
    SUPABASE_ANON_KEY: z.string().default(''),
    GEMINI_API_KEY: z.string().default(''),
    OPENAI_API_KEY: z.string().default(''),
    CORS_ORIGINS: z.string().default('http://localhost:5173'),
    ALLOW_INSECURE_LOCAL_AUTH: z
        .string()
        .default('false')
        .transform((value) => value.toLowerCase() === 'true'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ');
    throw new Error(`Invalid environment configuration: ${issues}`);
}

const isPlaceholder = (value: string): boolean =>
    !value || PLACEHOLDER_FRAGMENTS.some((fragment) => value.includes(fragment));

const supabaseKey = parsed.data.SUPABASE_SERVICE_ROLE_KEY || parsed.data.SUPABASE_ANON_KEY;

export const env = {
    ...parsed.data,
    supabaseKey,
    corsOrigins: parsed.data.CORS_ORIGINS.split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
    isProduction: parsed.data.NODE_ENV === 'production',
};

export const isLiveSupabaseConfigured = !isPlaceholder(parsed.data.SUPABASE_URL) && !isPlaceholder(supabaseKey);
