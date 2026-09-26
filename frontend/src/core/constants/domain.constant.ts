export const JOB_STATUSES = [
  'saved',
  'applied',
  'interviewing',
  'offer',
  'rejected',
  'ghosted',
  'withdrawn',
] as const;

export const WORK_MODELS = ['remote', 'hybrid', 'onsite'] as const;

export const TASK_TYPES = [
  'Resume',
  'Cover_Letter',
  'Coding_Challenge',
  'System_Design',
  'Behavioral',
  'Take_Home',
  'Background_Check',
  'Negotiation',
  'Other',
] as const;

export const TASK_STATUSES = ['not_started', 'in_progress', 'done'] as const;

export const REFERRAL_STATUSES = ['not_asked', 'asked', 'referred', 'confirmed'] as const;
