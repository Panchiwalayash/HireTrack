import { HTTP_STATUS } from '../constants/app.constant.js';

export class HttpError extends Error {
    public readonly statusCode: number;
    public readonly details?: unknown;

    constructor(statusCode: number, message: string, details?: unknown) {
        super(message);
        this.name = 'HttpError';
        this.statusCode = statusCode;
        this.details = details;
        Error.captureStackTrace?.(this, HttpError);
    }

    static badRequest(message: string, details?: unknown): HttpError {
        return new HttpError(HTTP_STATUS.BAD_REQUEST, message, details);
    }

    static unauthorized(message: string): HttpError {
        return new HttpError(HTTP_STATUS.UNAUTHORIZED, message);
    }

    static notFound(message: string): HttpError {
        return new HttpError(HTTP_STATUS.NOT_FOUND, message);
    }

    static internal(message: string, details?: unknown): HttpError {
        return new HttpError(HTTP_STATUS.INTERNAL_SERVER_ERROR, message, details);
    }
}

export function isHttpError(error: unknown): error is HttpError {
    return error instanceof HttpError;
}
