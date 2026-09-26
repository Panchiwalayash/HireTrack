import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { ERROR_MESSAGE, HTTP_STATUS } from '../constants/app.constant.js';
import { isHttpError } from '../errors/http-error.js';
import { Logger } from '../logger/logger.js';
import { env } from '../../config/env.config.js';

const logger = new Logger('ErrorHandler');

export function notFoundHandler(req: Request, res: Response): void {
    res.status(HTTP_STATUS.NOT_FOUND).json({ error: `Route ${req.method} ${req.originalUrl} not found` });
}

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction): void {
    if (error instanceof ZodError) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
            error: ERROR_MESSAGE.VALIDATION_FAILED,
            details: error.issues.map((issue) => ({
                field: issue.path.join('.'),
                message: issue.message,
            })),
        });
        return;
    }

    if (isHttpError(error)) {
        res.status(error.statusCode).json({
            error: error.message,
            ...(error.details ? { details: error.details } : {}),
        });
        return;
    }

    logger.error('Unhandled server error', error);

    const message = env.isProduction ? ERROR_MESSAGE.INTERNAL : ((error as Error)?.message ?? ERROR_MESSAGE.INTERNAL);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: message });
}
