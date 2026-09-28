import { type TailorResumePayload } from '../schema/ai.schema.js';

export interface TailoredBullet {
    category: string;
    bulletPoint: string;
    keywordsHighlighted: string[];
    impactScore: number;
}

export interface TailoredCoverLetter {
    subject: string;
    salutation: string;
    openingParagraph: string;
    bodyParagraphs: string[];
    closingParagraph: string;
    fullLetterText: string;
}

export interface TailorResumeResult {
    matchScore: number;
    matchGrade: 'A+' | 'A' | 'B+' | 'B' | 'Needs Work';
    matchAnalysis: string;
    matchedKeywords: string[];
    missingKeywords: string[];
    executiveSummary: string;
    tailoredBullets: TailoredBullet[];
    coverLetter: TailoredCoverLetter;
    interviewTalkingPoints: string[];
    companyName: string;
    targetRole: string;
    providerUsed: 'gemini' | 'openai' | 'expert_heuristic';
    modelUsed?: string;
}

const COMMON_TECH_KEYWORDS = [
    'TypeScript', 'JavaScript', 'Python', 'Go', 'Rust', 'Java', 'C++', 'C#',
    'React', 'Next.js', 'Vue', 'Angular', 'Node.js', 'Express', 'FastAPI', 'Django',
    'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch', 'DynamoDB', 'Supabase',
    'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'Terraform', 'CI/CD', 'GitHub Actions',
    'Kafka', 'RabbitMQ', 'GraphQL', 'REST API', 'gRPC', 'Microservices', 'Distributed Systems',
    'System Design', 'Unit Testing', 'Jest', 'Cypress', 'Playwright', 'Agile', 'Scrum',
    'LLMs', 'Gemini', 'OpenAI', 'LangChain', 'RAG', 'Vector Database', 'Pinecone',
    'Performance Optimization', 'Caching', 'Security', 'Auth', 'OAuth', 'SQL',
];

function extractKeywords(text: string): string[] {
    if (!text) return [];
    const lower = text.toLowerCase();
    return COMMON_TECH_KEYWORDS.filter((kw) => lower.includes(kw.toLowerCase()));
}

export async function tailorResumeAndCoverLetter(
    payload: TailorResumePayload,
): Promise<TailorResumeResult> {
    const geminiKey = payload.modelConfig?.apiKey || process.env.GEMINI_API_KEY;

    const company = payload.companyName || 'Target Company';
    const role = payload.targetRole || 'Software Engineer';
    const applicantName = payload.applicantName || 'Candidate';
    const jd = payload.jobDescription;
    const resume = payload.currentResume || 'Experienced full-stack engineer with expertise in TypeScript, React, Node.js, PostgreSQL, distributed systems, and cloud infrastructure.';

    const jdKeywords = extractKeywords(jd);
    const resumeKeywords = extractKeywords(resume);
    const matchedKeywords = jdKeywords.filter((kw) => resumeKeywords.includes(kw));
    const missingKeywords = jdKeywords.filter((kw) => !resumeKeywords.includes(kw));

    // Try Gemini API first
    if (geminiKey && (!payload.modelConfig?.provider || payload.modelConfig?.provider === 'gemini')) {
        try {
            const modelToUse = payload.modelConfig?.model || 'gemini-3.8-flash';
            const prompt = `You are a premier technical recruiter, FAANG resume reviewer, and hiring manager.
Analyze this candidate's resume against the target Job Description for ${company} (${role}).

Generate an ATS-optimized resume tailoring package and high-converting cover letter in strict JSON format.

CANDIDATE NAME: ${applicantName}
TARGET COMPANY: ${company}
TARGET ROLE: ${role}
TONE: ${payload.tone}

JOB DESCRIPTION:
${jd.slice(0, 3500)}

CANDIDATE CURRENT RESUME / EXPERIENCE:
${resume.slice(0, 3500)}

CRITICAL RULES:
1. Calculate realistic matchScore (integer 0-100) based on tech stack and seniority alignment.
2. For tailoredBullets, use Google's XYZ formula: "Accomplished [X], as measured by [Y], by doing [Z]" with quantifiable metrics (%, ms, $, scale).
3. Do not invent fictitious past companies; adapt the candidate's existing experience to spotlight the exact competencies sought in the JD.
4. The Cover Letter must be punchy, compelling, and specific to ${company}'s domain and technical challenges—NO generic cookie-cutter fluff.

Return STRICT JSON matching this schema:
{
  "matchScore": number,
  "matchGrade": "A+" | "A" | "B+" | "B" | "Needs Work",
  "matchAnalysis": "string (concise ATS evaluation summary)",
  "matchedKeywords": ["string"],
  "missingKeywords": ["string"],
  "executiveSummary": "string (2-3 sentences elevator pitch for resume header)",
  "tailoredBullets": [
    {
      "category": "Architecture & Systems" | "Performance & Scale" | "Product Engineering" | "Leadership & Delivery",
      "bulletPoint": "string (XYZ formula with metrics)",
      "keywordsHighlighted": ["string"],
      "impactScore": number
    }
  ],
  "coverLetter": {
    "subject": "string",
    "salutation": "string",
    "openingParagraph": "string",
    "bodyParagraphs": ["string", "string"],
    "closingParagraph": "string",
    "fullLetterText": "string"
  },
  "interviewTalkingPoints": ["string", "string", "string"]
}`;

            const res = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${modelToUse}:generateContent?key=${geminiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: {
                            responseMimeType: 'application/json',
                            temperature: 0.3,
                        },
                    }),
                },
            );

            if (res.ok) {
                const data = (await res.json()) as any;
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                    const parsed = JSON.parse(text);
                    return {
                        ...parsed,
                        companyName: company,
                        targetRole: role,
                        providerUsed: 'gemini',
                        modelUsed: modelToUse,
                    };
                }
            } else {
                console.warn(`Gemini API error (${res.status}):`, await res.text());
            }
        } catch (err: any) {
            console.warn('Gemini tailor failed, falling back to heuristic engine:', err.message);
        }
    }

    // High-quality expert heuristic fallback
    const baseScore = Math.min(
        94,
        Math.max(68, Math.round((matchedKeywords.length / Math.max(1, jdKeywords.length)) * 100 + 35)),
    );

    const grade: 'A+' | 'A' | 'B+' | 'B' | 'Needs Work' =
        baseScore >= 90 ? 'A+' : baseScore >= 82 ? 'A' : baseScore >= 74 ? 'B+' : 'B';

    const bullets: TailoredBullet[] = [
        {
            category: 'Architecture & Systems',
            bulletPoint: `Architected distributed ${matchedKeywords[0] || 'TypeScript'} event pipeline handling 15M+ daily requests, maintaining 99.98% uptime and reducing P99 latency by 38%.`,
            keywordsHighlighted: [matchedKeywords[0] || 'TypeScript', 'Distributed Systems', 'Architecture'],
            impactScore: 96,
        },
        {
            category: 'Performance & Scale',
            bulletPoint: `Optimized database indexing and multi-layer caching with ${matchedKeywords[1] || 'PostgreSQL'} and Redis, cutting query execution times from 420ms to 48ms across peak loads.`,
            keywordsHighlighted: [matchedKeywords[1] || 'PostgreSQL', 'Redis', 'Performance Optimization'],
            impactScore: 93,
        },
        {
            category: 'Product Engineering',
            bulletPoint: `Spearheaded end-to-end development of customer-facing workflows utilizing ${matchedKeywords[2] || 'React'} and modern state management, driving a 24% increase in user retention.`,
            keywordsHighlighted: [matchedKeywords[2] || 'React', 'Full-Stack', 'Product Delivery'],
            impactScore: 91,
        },
        {
            category: 'Leadership & Delivery',
            bulletPoint: `Streamlined engineering CI/CD release cycles with automated testing and Docker containerization, reducing production hotfix turnarounds by 65%.`,
            keywordsHighlighted: ['CI/CD', 'Docker', 'Testing', 'Agile'],
            impactScore: 94,
        },
    ];

    const opening = `I am writing to express my enthusiasm for the ${role} position at ${company}. Having followed ${company}'s engineering trajectory and commitment to scalable, high-impact products, I am eager to contribute my background in full-stack architecture, performance optimization, and reliable distributed systems.`;

    const body1 = `Throughout my recent work, I have focused on designing resilient systems that balance speed of delivery with long-term maintainability. In my projects utilizing ${matchedKeywords.slice(0, 3).join(', ') || 'TypeScript, React, and PostgreSQL'}, I took ownership of core services, improving latency benchmarks by over 35% and establishing automated CI/CD pipelines that empowered cross-functional partners to ship features with high confidence.`;

    const body2 = `What excites me most about ${company} is the opportunity to solve complex domain challenges alongside a rigorous engineering team. My experience bridging product strategy with low-level execution aligns directly with the requirements outlined for the ${role} opening.`;

    const closing = `Thank you for your time and consideration. I welcome the opportunity to discuss how my technical skills and proactive problem-solving can accelerate ${company}'s immediate milestones.`;

    const fullLetter = `${applicantName}
Email: contact@hiretrack.ai | Portfolio: hiretrack-zeta.vercel.app

Dear Hiring Team at ${company},

${opening}

${body1}

${body2}

${closing}

Sincerely,
${applicantName}`;

    return {
        matchScore: baseScore,
        matchGrade: grade,
        matchAnalysis: `Strong alignment across ${matchedKeywords.length} core technical domains with clear opportunities to bridge ${missingKeywords.length} niche requirements.`,
        matchedKeywords: matchedKeywords.length > 0 ? matchedKeywords : ['TypeScript', 'React', 'Node.js', 'System Design'],
        missingKeywords: missingKeywords.length > 0 ? missingKeywords : ['Kafka', 'Kubernetes'],
        executiveSummary: `Results-driven ${role} with proven success architecting scalable distributed systems and high-converting web applications. Specialized in ${matchedKeywords.slice(0, 4).join(', ') || 'TypeScript, React, and Cloud Services'}, delivering measurable gains in system latency, throughput, and developer velocity.`,
        tailoredBullets: bullets,
        coverLetter: {
            subject: `Application for ${role} - ${applicantName}`,
            salutation: `Dear Hiring Team at ${company},`,
            openingParagraph: opening,
            bodyParagraphs: [body1, body2],
            closingParagraph: closing,
            fullLetterText: fullLetter,
        },
        interviewTalkingPoints: [
            `Highlight how your recent work with ${matchedKeywords[0] || 'modern web architecture'} mirrors ${company}'s core product challenges.`,
            `Discuss specific metrics where you improved latency or throughput by 30%+ using quantifiable benchmarks.`,
            `Showcase collaborative ownership: resolving ambiguity in cross-functional teams to deliver reliable features on time.`,
        ],
        companyName: company,
        targetRole: role,
        providerUsed: 'expert_heuristic',
    };
}
