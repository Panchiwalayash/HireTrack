import { Router } from 'express';
import { isLiveSupabaseConfigured } from '../config/supabase.config.js';
import { SERVICE_NAME } from '../core/constants/app.constant.js';

const router = Router();

router.get('/', (_req, res) => {
    res.json({
        status: 'healthy',
        service: SERVICE_NAME,
        databaseMode: isLiveSupabaseConfigured ? 'supabase_live' : 'sandbox_fallback',
        timestamp: new Date().toISOString(),
    });
});

export default router;
