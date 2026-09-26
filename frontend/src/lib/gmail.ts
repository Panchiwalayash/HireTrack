import type { Job, Contact } from '../models';

export function buildFollowUpEmailUrl(
  contact: Contact,
  job: Job,
  type: 'follow_up' | 'thank_you' | 'referral_request' = 'follow_up',
): string {
  const templates: Record<string, { subject: string; body: string }> = {
    follow_up: {
      subject: `Following Up — ${job.role} Application at ${job.company}`,
      body: `Dear ${contact.name},\n\nI hope this message finds you well. I wanted to follow up on my application for the ${job.role} position at ${job.company}.\n\nI remain very interested in this opportunity and would love to discuss how my experience aligns with the team's needs. Please let me know if there are any updates or if additional information would be helpful.\n\nBest regards`,
    },
    thank_you: {
      subject: `Thank You — ${job.role} Interview at ${job.company}`,
      body: `Dear ${contact.name},\n\nThank you so much for taking the time to speak with me about the ${job.role} position at ${job.company}. I really enjoyed learning more about the team and the exciting challenges ahead.\n\nOur conversation reinforced my enthusiasm for this role, and I'm confident my experience would allow me to make a meaningful contribution.\n\nPlease don't hesitate to reach out if you need any additional information. I look forward to hearing from you.\n\nBest regards`,
    },
    referral_request: {
      subject: `Referral Request — ${job.role} at ${job.company}`,
      body: `Hi ${contact.name},\n\nI hope you're doing well! I noticed that ${job.company} is hiring for a ${job.role} position, and given your experience there, I wanted to reach out.\n\nWould you be open to referring me for this role? I've attached my resume for your reference. I'd really appreciate any guidance or support you can offer.\n\nThe job posting is here: ${job.job_url || '[Job URL]'}\n\nThanks so much for considering this!\n\nBest regards`,
    },
  };

  const template = templates[type];

  const params = new URLSearchParams({
    to: contact.email || '',
    su: template.subject,
    body: template.body,
  });

  return `https://mail.google.com/mail/?view=cm&${params.toString()}`;
}

export function buildMailtoUrl(
  contact: Contact,
  job: Job,
  type: 'follow_up' | 'thank_you' | 'referral_request' = 'follow_up',
): string {
  const templates: Record<string, { subject: string; body: string }> = {
    follow_up: {
      subject: `Following Up — ${job.role} at ${job.company}`,
      body: `Dear ${contact.name},\n\nI wanted to follow up on my application for the ${job.role} position at ${job.company}.\n\nBest regards`,
    },
    thank_you: {
      subject: `Thank You — ${job.role} Interview at ${job.company}`,
      body: `Dear ${contact.name},\n\nThank you for the interview for the ${job.role} role at ${job.company}.\n\nBest regards`,
    },
    referral_request: {
      subject: `Referral Request — ${job.role} at ${job.company}`,
      body: `Hi ${contact.name},\n\nWould you be open to referring me for the ${job.role} position at ${job.company}?\n\nBest regards`,
    },
  };

  const template = templates[type];

  return `mailto:${contact.email || ''}?subject=${encodeURIComponent(template.subject)}&body=${encodeURIComponent(template.body)}`;
}
