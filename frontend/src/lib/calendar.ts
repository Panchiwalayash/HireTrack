import type { Job } from '../models';

export function buildGoogleCalendarUrl(job: Job, eventType: 'deadline' | 'interview' = 'deadline'): string {
  const deadline = new Date(job.application_deadline);

  const title =
    eventType === 'interview'
      ? `🎯 Interview: ${job.company} — ${job.role}`
      : `📋 Application Deadline: ${job.company} — ${job.role}`;

  const details = [
    `Company: ${job.company}`,
    `Role: ${job.role}`,
    `Location: ${job.location} (${job.work_model})`,
    job.salary_min && job.salary_max
      ? `Salary Range: $${job.salary_min.toLocaleString()} – $${job.salary_max.toLocaleString()}`
      : '',
    job.job_url ? `Job Posting: ${job.job_url}` : '',
    job.notes ? `Notes: ${job.notes}` : '',
    '',
    '— Synced from HireTrack AI',
  ]
    .filter(Boolean)
    .join('\n');

  const formatDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('T')[0];
  const nextDay = new Date(deadline);
  nextDay.setDate(nextDay.getDate() + 1);

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${formatDate(deadline)}/${formatDate(nextDay)}`,
    details,
    location: job.location || '',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function downloadIcsCalendar(jobs: Job[]): void {
  const now = new Date();
  const activeJobs = jobs.filter((j) => {
    const deadline = new Date(j.application_deadline);
    return deadline >= now && j.status !== 'rejected' && j.status !== 'withdrawn' && j.status !== 'ghosted';
  });

  if (activeJobs.length === 0) {
    alert('No active deadlines to export.');
    return;
  }

  const formatIcsDate = (d: Date) =>
    d
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}/, '');

  const events = activeJobs.map((job) => {
    const deadline = new Date(job.application_deadline);
    const endDate = new Date(deadline);
    endDate.setHours(endDate.getHours() + 1);

    const salaryInfo =
      job.salary_min && job.salary_max
        ? `\\nSalary: $${job.salary_min.toLocaleString()} – $${job.salary_max.toLocaleString()}`
        : '';

    return [
      'BEGIN:VEVENT',
      `DTSTART:${formatIcsDate(deadline)}`,
      `DTEND:${formatIcsDate(endDate)}`,
      `SUMMARY:📋 ${job.company} — ${job.role} Deadline`,
      `DESCRIPTION:Company: ${job.company}\\nRole: ${job.role}\\nLocation: ${job.location} (${job.work_model})${salaryInfo}${job.job_url ? `\\nJob URL: ${job.job_url}` : ''}\\n\\n— HireTrack AI`,
      `LOCATION:${job.location || ''}`,
      `STATUS:CONFIRMED`,
      `BEGIN:VALARM`,
      `TRIGGER:-P1D`,
      `ACTION:DISPLAY`,
      `DESCRIPTION:Application deadline tomorrow: ${job.company} — ${job.role}`,
      `END:VALARM`,
      'END:VEVENT',
    ].join('\r\n');
  });

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//HireTrack AI//Job Hunt Command Center//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:HireTrack AI Deadlines`,
    ...events,
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'hiretrack-deadlines.ics';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
