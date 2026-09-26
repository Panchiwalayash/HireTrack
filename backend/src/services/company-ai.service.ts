import dotenv from 'dotenv';
import type { CandidateProfileContext, CustomCompanyFitRequest, CustomCompanyFitResult } from '../models/index.js';
import { assertPublicHttpUrl } from '../core/utils/url-guard.util.js';

dotenv.config();

export type { CandidateProfileContext, CustomCompanyFitRequest, CustomCompanyFitResult };

const SITE_FETCH_TIMEOUT_MS = 3500;
const MAX_REDIRECTS = 5;
const REDIRECT_STATUS_CODES = [301, 302, 303, 307, 308];

const BROWSER_HEADERS = {
    'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 HireTrackBot/1.0',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
};

async function fetchFollowingSafeRedirects(startUrl: string, signal: AbortSignal): Promise<Response> {
    let target = startUrl;

    for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
        const validated = await assertPublicHttpUrl(target);
        const res = await fetch(validated, {
            headers: BROWSER_HEADERS,
            signal,
            redirect: 'manual',
        });

        if (!REDIRECT_STATUS_CODES.includes(res.status)) {
            return res;
        }

        const location = res.headers.get('location');
        if (!location) {
            return res;
        }
        target = new URL(location, validated).toString();
    }

    throw new Error('Too many redirects');
}

export async function fetchCompanyWebsiteText(rawUrl: string): Promise<string> {
    if (!rawUrl || typeof rawUrl !== 'string') return '';
    let url = rawUrl.trim();
    if (!url) return '';
    if (!/^https?:\/\//i.test(url)) {
        url = `https://${url}`;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), SITE_FETCH_TIMEOUT_MS);

    try {
        const res = await fetchFollowingSafeRedirects(url, controller.signal);

        clearTimeout(timer);

        if (!res.ok) {
            return `[Failed to fetch URL: HTTP ${res.status}]`;
        }

        const html = await res.text();

        let metaDesc = '';
        const descMatch = html.match(
            /<meta\s+(?:name|property)=["'](?:description|og:description)["']\s+content=["'](.*?)["']/i,
        );
        if (descMatch && descMatch[1]) {
            metaDesc = `Company Meta Description: ${descMatch[1].trim()}\n\n`;
        }

        let title = '';
        const titleMatch = html.match(/<title>(.*?)<\/title>/i);
        if (titleMatch && titleMatch[1]) {
            title = `Page Title: ${titleMatch[1].trim()}\n\n`;
        }

        const cleaned = html
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
            .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, ' ')
            .replace(/<!--[\s\S]*?-->/g, ' ')
            .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, ' ')
            .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, ' ')
            .replace(/<[^>]+>/g, ' ')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/\s+/g, ' ')
            .trim();

        const fullSnippet = `${title}${metaDesc}${cleaned}`.slice(0, 3500);
        return fullSnippet;
    } catch (err: any) {
        clearTimeout(timer);
        console.warn(`[fetchCompanyWebsiteText] Could not fetch ${url}:`, err.message);
        return '';
    }
}

function evaluateCompanyHeuristic(req: CustomCompanyFitRequest, websiteText: string): CustomCompanyFitResult {
    const {
        companyName,
        targetRole,
        jobDescription = '',
        industry = 'Technology / Software',
        companyStage = 'Growth Series B/C',
        workModel = 'hybrid',
        profile,
    } = req;

    const combinedContext = `${jobDescription} ${websiteText}`.toLowerCase();

    const standardSkills = [
        'typescript',
        'javascript',
        'react',
        'node',
        'python',
        'go',
        'golang',
        'java',
        'c++',
        'c#',
        '.net',
        'rust',
        'kubernetes',
        'docker',
        'aws',
        'gcp',
        'azure',
        'postgresql',
        'postgres',
        'mysql',
        'mongodb',
        'redis',
        'kafka',
        'graphql',
        'rest',
        'system design',
        'distributed systems',
        'machine learning',
        'pytorch',
        'tensorflow',
        'ci/cd',
        'terraform',
    ];

    const candidateSkillsLower = profile.skills.map((s) => s.toLowerCase());

    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];

    for (const skill of standardSkills) {
        const isDemanded = combinedContext.includes(skill);
        const candidateHas = candidateSkillsLower.some((cs) => cs.includes(skill) || skill.includes(cs));

        if (isDemanded) {
            if (candidateHas) {
                matchedSkills.push(skill.toUpperCase());
            } else {
                missingSkills.push(skill.toUpperCase());
            }
        }
    }

    if (matchedSkills.length === 0) {
        matchedSkills.push(...profile.skills.slice(0, 3));
    }

    const techScore = Math.min(
        95,
        Math.max(
            55,
            Math.round((matchedSkills.length / Math.max(1, matchedSkills.length + missingSkills.length)) * 100),
        ),
    );

    const expScore = Math.min(
        98,
        Math.max(
            50,
            Math.round(
                (profile.yearsOfExperience /
                    (profile.targetRoleLevel === 'senior' ? 5 : profile.targetRoleLevel === 'staff' ? 8 : 3)) *
                    85,
            ),
        ),
    );

    const scopeScore = 82;
    const cultureScore = 86;

    const fitScore = Math.round(techScore * 0.45 + expScore * 0.3 + scopeScore * 0.15 + cultureScore * 0.1);

    const category: 'Dream' | 'Target' | 'Safe' = fitScore >= 82 ? (fitScore >= 90 ? 'Safe' : 'Target') : 'Dream';

    const difficulty =
        companyStage.toLowerCase().includes('enterprise') || companyStage.toLowerCase().includes('public')
            ? 'High-Bar Elite'
            : fitScore < 75
              ? 'Challenging'
              : 'Moderate';

    const defaultComp =
        profile.targetRoleLevel === 'senior' || profile.targetRoleLevel === 'staff'
            ? { min: 170000, max: 240000 }
            : { min: 130000, max: 180000 };

    return {
        companyName,
        targetRole,
        fitScore,
        category,
        verdict: `Strong ${category.toLowerCase()} tier match (${fitScore}% fit) for ${targetRole} at ${companyName}. Your background in ${matchedSkills.slice(0, 3).join(', ')} aligns well with their architecture.`,
        scoreBreakdown: {
            techStackMatch: techScore,
            experienceMatch: expScore,
            roleScopeMatch: scopeScore,
            cultureStageFit: cultureScore,
        },
        matchedSkills: matchedSkills.slice(0, 6),
        missingSkills: missingSkills.slice(0, 4),
        transferableStrengths: [
            `Hands-on experience with ${profile.skills.slice(0, 2).join(' & ')}`,
            `${profile.yearsOfExperience}+ years building production software`,
            'Proven adaptability across distributed engineering workflows',
        ],
        interviewInsights: {
            estimatedDifficulty: difficulty,
            expectedRounds: [
                'Recruiter Initial Screen (30m)',
                'Technical Deep Dive / Live Coding (LeetCode & Data Structures, 60m)',
                'Practical System Architecture / Domain Design (60m)',
                'Engineering Values & Past Projects Behavioral (45m)',
            ],
            keyTechnicalTopics: [
                matchedSkills[0] || 'Core Language Internals',
                'Scalability & Concurrency Patterns',
                'API Design & Data Modeling',
            ],
            behavioralFocus: `Emphasize ownership, cross-functional communication, and engineering rigor suitable for a ${companyStage} organization.`,
        },
        tailoredApplicationKit: {
            resumeHighlights: [
                `Spearheaded critical services utilizing ${matchedSkills.slice(0, 2).join(', ')}, improving throughput and reducing latency.`,
                `Architected fault-tolerant systems in production, collaborating with cross-functional teams to deliver on ambitious product roadmaps.`,
                `Championed testing automation, CI/CD observability, and code review standards across active codebases.`,
            ],
            recruiterOutreachPitch: `Hi [Recruiter Name], I came across the ${targetRole} opening at ${companyName}. Given my background in ${profile.skills.slice(0, 3).join(', ')} and ${profile.yearsOfExperience} years of experience building scalable applications, I believe my skill set aligns directly with what ${companyName} is building. Would love to connect briefly regarding the team's roadmap!`,
            strategicInterviewQuestions: [
                `What are the most demanding scalability bottlenecks ${companyName}'s engineering team is actively refactoring this quarter?`,
                `How does the team balance shipping fast vs paying down technical debt for this ${targetRole} role?`,
                `What does a 10x high performer look like in their first 90 days on this team?`,
            ],
        },
        estimatedCompRange: {
            min: req.profile.desiredSalaryMin || defaultComp.min,
            max: req.profile.desiredSalaryMax || defaultComp.max,
            currency: 'USD',
        },
        workModel: workModel === 'any' ? 'hybrid' : workModel,
        industry,
        websiteSnippetUsed: websiteText ? websiteText.slice(0, 300) + '...' : undefined,
        providerUsed: 'expert_heuristic',
        modelUsed: 'rule-based-career-evaluator',
    };
}

export async function assessCompanyFitWithAI(req: CustomCompanyFitRequest): Promise<CustomCompanyFitResult> {
    const geminiKey = req.modelConfig?.apiKey || process.env.GEMINI_API_KEY;
    const openaiKey = req.modelConfig?.apiKey || process.env.OPENAI_API_KEY;

    const targetUrl = req.careerUrl || req.companyWebsite || '';
    let liveWebsiteText = '';
    if (targetUrl) {
        try {
            liveWebsiteText = await fetchCompanyWebsiteText(targetUrl);
        } catch (err) {
            console.warn('Could not scrape career URL:', err);
        }
    }

    const candidateSummary = `
CANDIDATE PROFILE:
- Skills / Technologies: ${req.profile.skills.join(', ')}
- Years of Experience: ${req.profile.yearsOfExperience} years
- Target Role Level: ${req.profile.targetRoleLevel}
- Desired Salary: $${req.profile.desiredSalaryMin || 130000} - $${req.profile.desiredSalaryMax || 200000} USD
- Work Preference: ${req.profile.workPreference || 'hybrid'}
- Education / Background: ${req.profile.educationOrBackground || 'Computer Science / Engineering Degree'}
- Notable Projects / Highlights: ${req.profile.keyProjectsOrAchievements || 'Built distributed systems, scalable web apps, and automated workflows.'}
`;

    const companySummary = `
TARGET COMPANY & ROLE:
- Company Name: ${req.companyName}
- Target Job Title: ${req.targetRole}
- Company Website / Careers URL: ${targetUrl || 'Not provided'}
- Industry / Sector: ${req.industry || 'Technology / Software'}
- Company Stage: ${req.companyStage || 'Growth Stage Tech'}
- Work Model: ${req.workModel || 'hybrid'}
- Provided Job Description / Requirements:
${req.jobDescription ? req.jobDescription : 'Not provided by user; use live website context and typical industry requirements for this role.'}

LIVE WEBSITE / CAREER SITE SNIPPET (Extracted from official site):
${liveWebsiteText || 'Site snippet unavailable; infer from company name and industry reputation.'}
`;

    const systemInstruction = `You are an elite Silicon Valley Tech Recruiter and Senior Engineering Hiring Bar Raiser.
Assess the exact fit between the candidate and this target company & role.
Be realistic, accurate, and rigorous.
Do NOT give generic praise. Provide specific technology matches, gap analyses, and actionable interview strategies.
Return ONLY valid JSON matching this exact structure:
{
  "companyName": "${req.companyName}",
  "targetRole": "${req.targetRole}",
  "fitScore": number (integer 0-100),
  "category": "Dream" | "Target" | "Safe",
  "verdict": "2-3 concise, high-value sentences summarizing their fit, strengths, and primary hurdle.",
  "scoreBreakdown": {
    "techStackMatch": number (0-100),
    "experienceMatch": number (0-100),
    "roleScopeMatch": number (0-100),
    "cultureStageFit": number (0-100)
  },
  "matchedSkills": ["skill1", "skill2"],
  "missingSkills": ["gapSkill1", "gapSkill2"],
  "transferableStrengths": ["strength1", "strength2", "strength3"],
  "interviewInsights": {
    "estimatedDifficulty": "Moderate" | "Challenging" | "High-Bar Elite",
    "expectedRounds": ["Round 1: ...", "Round 2: ...", "Round 3: ...", "Round 4: ..."],
    "keyTechnicalTopics": ["Topic 1", "Topic 2", "Topic 3"],
    "behavioralFocus": "Key behavioral themes this company cares about."
  },
  "tailoredApplicationKit": {
    "resumeHighlights": [
      "Tailored accomplishment bullet point #1 emphasizing company tech",
      "Tailored accomplishment bullet point #2 with metrics",
      "Tailored accomplishment bullet point #3"
    ],
    "recruiterOutreachPitch": "A high-conversion cold message for LinkedIn or email (100-140 words)",
    "strategicInterviewQuestions": [
      "Incisive question #1 to ask the engineering team",
      "Incisive question #2 about architectural challenges",
      "Incisive question #3 about roadmap/success metrics"
    ]
  },
  "estimatedCompRange": {
    "min": number (e.g. 140000),
    "max": number (e.g. 210000),
    "currency": "USD"
  },
  "workModel": "remote" | "hybrid" | "onsite",
  "industry": "${req.industry || 'Technology'}"
}`;

    if (geminiKey && (!req.modelConfig?.provider || req.modelConfig?.provider === 'gemini')) {
        try {
            const modelToUse = req.modelConfig?.model || 'gemini-3.6-flash';
            const promptText = `${systemInstruction}\n\n${candidateSummary}\n\n${companySummary}`;

            const res = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${modelToUse}:generateContent?key=${geminiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: promptText }] }],
                        generationConfig: {
                            responseMimeType: 'application/json',
                            temperature: 0.2,
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
                        companyName: req.companyName,
                        targetRole: req.targetRole,
                        websiteSnippetUsed: liveWebsiteText ? liveWebsiteText.slice(0, 300) + '...' : undefined,
                        providerUsed: 'gemini',
                        modelUsed: modelToUse,
                    };
                }
            } else {
                const errText = await res.text();
                console.warn(`Gemini API error (${res.status}):`, errText);
            }
        } catch (err: any) {
            console.warn('Gemini custom company fit failed, attempting OpenAI or fallback:', err.message);
        }
    }

    if (openaiKey && (!req.modelConfig?.provider || req.modelConfig?.provider === 'openai')) {
        try {
            const modelToUse = req.modelConfig?.model || 'gpt-4o-mini';
            const promptText = `${candidateSummary}\n\n${companySummary}`;

            const res = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${openaiKey}`,
                },
                body: JSON.stringify({
                    model: modelToUse,
                    messages: [
                        { role: 'system', content: systemInstruction },
                        { role: 'user', content: promptText },
                    ],
                    response_format: { type: 'json_object' },
                    temperature: 0.2,
                }),
            });

            if (res.ok) {
                const data = (await res.json()) as any;
                const content = data.choices?.[0]?.message?.content;
                if (content) {
                    const parsed = JSON.parse(content);
                    return {
                        ...parsed,
                        companyName: req.companyName,
                        targetRole: req.targetRole,
                        websiteSnippetUsed: liveWebsiteText ? liveWebsiteText.slice(0, 300) + '...' : undefined,
                        providerUsed: 'openai',
                        modelUsed: modelToUse,
                    };
                }
            }
        } catch (err: any) {
            console.warn('OpenAI custom company fit failed, falling back to heuristic engine:', err.message);
        }
    }

    return evaluateCompanyHeuristic(req, liveWebsiteText);
}
