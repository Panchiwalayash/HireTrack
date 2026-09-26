import type { Contact, ContactLink, Job, Task } from '../models/index.js';

export interface DemoDataset {
    jobs: Job[];
    tasks: Task[];
    contacts: Contact[];
    contactLinks: ContactLink[];
}

export function buildDemoDataset(userId: string): DemoDataset {
    const now = new Date().toISOString();

    const jobs: Job[] = [
        {
            id: 'job-google',
            user_id: userId,
            company: 'Google',
            role: 'Software Engineer, Distributed Systems',
            location: 'Mountain View, CA',
            work_model: 'hybrid',
            salary_min: 165000,
            salary_max: 210000,
            job_url: 'https://careers.google.com/jobs/results/',
            application_deadline: '2026-10-15T23:59:00Z',
            status: 'interviewing',
            notes: 'Passed initial recruiter screen. Virtual onsite scheduled for distributed cache design.',
            created_at: now,
        },
        {
            id: 'job-stripe',
            user_id: userId,
            company: 'Stripe',
            role: 'Backend Infrastructure Engineer',
            location: 'San Francisco, CA / Remote',
            work_model: 'remote',
            salary_min: 180000,
            salary_max: 235000,
            job_url: 'https://stripe.com/jobs',
            application_deadline: '2026-10-20T23:59:00Z',
            status: 'interviewing',
            notes: 'Take-home API integration test passed. Next round: architecture & bug squash session.',
            created_at: now,
        },
        {
            id: 'job-datadog',
            user_id: userId,
            company: 'Datadog',
            role: 'Core Observability Engineer',
            location: 'New York, NY',
            work_model: 'hybrid',
            salary_min: 170000,
            salary_max: 215000,
            job_url: 'https://www.datadoghq.com/careers/',
            application_deadline: '2026-10-28T23:59:00Z',
            status: 'applied',
            notes: 'Applied via employee referral. High emphasis on Go, Kafka, and eBPF.',
            created_at: now,
        },
        {
            id: 'job-snowflake',
            user_id: userId,
            company: 'Snowflake',
            role: 'Database Engine Engineer',
            location: 'Bellevue, WA',
            work_model: 'onsite',
            salary_min: 175000,
            salary_max: 225000,
            job_url: 'https://careers.snowflake.com/',
            application_deadline: '2026-11-05T23:59:00Z',
            status: 'saved',
            notes: 'Tailoring C++ resume and brushing up on columnar storage indexing techniques.',
            created_at: now,
        },
        {
            id: 'job-figma',
            user_id: userId,
            company: 'Figma',
            role: 'Full Stack Product Engineer (Collaboration)',
            location: 'San Francisco, CA',
            work_model: 'hybrid',
            salary_min: 185000,
            salary_max: 230000,
            job_url: 'https://www.figma.com/careers/',
            application_deadline: '2026-09-30T23:59:00Z',
            status: 'offer',
            notes: 'Written offer received: base plus equity grant. Decision required by next Friday.',
            created_at: now,
        },
    ];

    const taskSeeds: Array<Omit<Task, 'user_id' | 'updated_at'>> = [
        {
            id: 'task-1',
            job_id: 'job-google',
            type: 'Resume',
            status: 'done',
            notes: 'Tailored with distributed systems keywords',
        },
        {
            id: 'task-2',
            job_id: 'job-google',
            type: 'Coding_Challenge',
            status: 'done',
            notes: 'Completed OA with all tests passing',
        },
        {
            id: 'task-3',
            job_id: 'job-google',
            type: 'System_Design',
            status: 'in_progress',
            notes: 'Preparing video streaming scaling architecture',
        },
        {
            id: 'task-4',
            job_id: 'job-google',
            type: 'Behavioral',
            status: 'not_started',
            notes: 'Review STAR method responses',
        },
        { id: 'task-5', job_id: 'job-stripe', type: 'Resume', status: 'done', notes: 'Clean markdown resume sent' },
        {
            id: 'task-6',
            job_id: 'job-stripe',
            type: 'Take_Home',
            status: 'done',
            notes: 'Webhook idempotency service test submitted',
        },
        {
            id: 'task-7',
            job_id: 'job-stripe',
            type: 'System_Design',
            status: 'in_progress',
            notes: 'Reviewing ledger consistency models',
        },
        { id: 'task-8', job_id: 'job-datadog', type: 'Resume', status: 'done', notes: 'Submitted with referral link' },
        {
            id: 'task-9',
            job_id: 'job-datadog',
            type: 'Cover_Letter',
            status: 'done',
            notes: 'Highlighted open source telemetry contributions',
        },
        {
            id: 'task-10',
            job_id: 'job-datadog',
            type: 'Coding_Challenge',
            status: 'not_started',
            notes: 'Online assessment pending',
        },
        {
            id: 'task-11',
            job_id: 'job-snowflake',
            type: 'Resume',
            status: 'in_progress',
            notes: 'Drafting low-level systems projects',
        },
        {
            id: 'task-12',
            job_id: 'job-snowflake',
            type: 'Cover_Letter',
            status: 'not_started',
            notes: 'Draft intro for query optimizer team',
        },
        { id: 'task-13', job_id: 'job-figma', type: 'Resume', status: 'done', notes: 'Sent' },
        {
            id: 'task-14',
            job_id: 'job-figma',
            type: 'System_Design',
            status: 'done',
            notes: 'CRDT multiplayer canvas design completed',
        },
        {
            id: 'task-15',
            job_id: 'job-figma',
            type: 'Negotiation',
            status: 'in_progress',
            notes: 'Comp analysis and equity counter-offer drafted',
        },
    ];

    const tasks: Task[] = taskSeeds.map((task) => ({ ...task, user_id: userId, updated_at: now }));

    const contacts: Contact[] = [
        {
            id: 'cnt-1',
            user_id: userId,
            name: 'Elena Rostova',
            company: 'Google',
            role: 'Staff Software Engineer',
            relationship: 'referral',
            email: 'elena.rostova@example.com',
            linkedin_url: 'https://linkedin.com/in/elena-rostova',
            notes: 'Offered internal referral for the Core team.',
            created_at: now,
        },
        {
            id: 'cnt-2',
            user_id: userId,
            name: 'Marcus Vance',
            company: 'Stripe',
            role: 'Engineering Manager, Infra',
            relationship: 'hiring_manager',
            email: 'marcus.vance@example.com',
            linkedin_url: 'https://linkedin.com/in/marcus-vance',
            notes: 'Met at Systems Conf. Talked through database shard migrations.',
            created_at: now,
        },
        {
            id: 'cnt-3',
            user_id: userId,
            name: 'Sarah Chen',
            company: 'Datadog',
            role: 'Senior Technical Recruiter',
            relationship: 'recruiter',
            email: 'sarah.chen@example.com',
            linkedin_url: 'https://linkedin.com/in/sarah-chen-talent',
            notes: 'Reached out on LinkedIn with a warm introduction.',
            created_at: now,
        },
    ];

    const contactLinks: ContactLink[] = [
        {
            id: 'cl-1',
            user_id: userId,
            contact_id: 'cnt-1',
            job_id: 'job-google',
            status: 'confirmed',
            notes: 'Internal referral submitted',
            last_updated: now,
        },
        {
            id: 'cl-2',
            user_id: userId,
            contact_id: 'cnt-2',
            job_id: 'job-stripe',
            status: 'confirmed',
            notes: 'Had a 30 minute intro call on team roadmap',
            last_updated: now,
        },
        {
            id: 'cl-3',
            user_id: userId,
            contact_id: 'cnt-3',
            job_id: 'job-datadog',
            status: 'referred',
            notes: 'Fast-tracked profile to hiring team',
            last_updated: now,
        },
    ];

    return { jobs, tasks, contacts, contactLinks };
}
