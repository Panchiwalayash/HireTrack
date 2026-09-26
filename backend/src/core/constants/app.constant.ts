export const SERVICE_NAME = 'HireTrack AI Backend API';

export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500,
} as const;

export const ERROR_MESSAGE = {
    INTERNAL: 'Internal server error',
    UNAUTHORIZED: 'Authentication required',
    INVALID_SESSION: 'Invalid or expired authentication session',
    VALIDATION_FAILED: 'Request validation failed',
    JOB_NOT_FOUND: 'Job not found',
    TASK_NOT_FOUND: 'Task not found',
    CONTACT_NOT_FOUND: 'Contact not found',
    CONTACT_LINK_NOT_FOUND: 'Contact link not found',
} as const;
