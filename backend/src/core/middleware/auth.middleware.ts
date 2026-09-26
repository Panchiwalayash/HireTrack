import type { NextFunction, Request, Response } from 'express';
import { supabase, isLiveSupabaseConfigured } from '../../config/supabase.config.js';
import { env } from '../../config/env.config.js';
import { ERROR_MESSAGE } from '../constants/app.constant.js';
import { HttpError } from '../errors/http-error.js';
import { Logger } from '../logger/logger.js';

export interface AuthenticatedRequest extends Request {
    userId?: string;
    userEmail?: string;
}

const SANDBOX_USER_ID = 'usr-local-applicant';

const logger = new Logger('AuthMiddleware');

export async function authMiddleware(req: AuthenticatedRequest, _res: Response, next: NextFunction): Promise<void> {
    const authHeader = req.headers.authorization;

    if (isLiveSupabaseConfigured && !env.ALLOW_INSECURE_LOCAL_AUTH) {
        if (!authHeader?.startsWith('Bearer ')) {
            next(HttpError.unauthorized(ERROR_MESSAGE.UNAUTHORIZED));
            return;
        }

        const token = authHeader.slice('Bearer '.length);
        try {
            const {
                data: { user },
                error,
            } = await supabase.auth.getUser(token);

            if (error || !user) {
                next(HttpError.unauthorized(ERROR_MESSAGE.INVALID_SESSION));
                return;
            }

            req.userId = user.id;
            req.userEmail = user.email;
            next();
        } catch (error) {
            logger.error('Token verification failed', error);
            next(HttpError.unauthorized(ERROR_MESSAGE.INVALID_SESSION));
        }
        return;
    }

    req.userId = (req.headers['x-user-id'] as string) || SANDBOX_USER_ID;
    next();
}
