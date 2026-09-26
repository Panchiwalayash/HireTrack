import type { CandidateProfileContext } from '../../models/index.js';

export const DEFAULT_CANDIDATE_PROFILE: CandidateProfileContext = {
    skills: ['TypeScript', 'React', 'Node.js', 'System Design'],
    yearsOfExperience: 3,
    targetRoleLevel: 'mid',
    desiredSalaryMin: 140000,
    desiredSalaryMax: 200000,
    workPreference: 'hybrid',
};

export const DEFAULT_TARGET_ROLE = 'Software Engineer';
