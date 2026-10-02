/**
 * calendarExporter.js
 * Generates standard RFC 5545 .ics iCalendar files for Google Calendar, Apple Calendar, and Outlook.
 * 100% free, purely client-side browser download.
 */

export function downloadCalendarInvite({
  title = 'Celebration Wish',
  description = 'Open your special Boltwish celebration card',
  eventDate,
  url = window.location.href,
}) {
  const safeDate = eventDate ? new Date(eventDate) : new Date();
  const year = safeDate.getFullYear();
  const month = String(safeDate.getMonth() + 1).padStart(2, '0');
  const day = String(safeDate.getDate()).padStart(2, '0');

  const dtStart = `${year}${month}${day}`;
  const dtEnd = `${year}${month}${day}`;
  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const cleanTitle = title.replace(/[^\w\s.,!?-]/g, '').trim() || 'Celebration Event';
  const cleanDesc = `${description}\n\nOpen your card: ${url}`.replace(/\n/g, '\\n');

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Boltwish//Celebration Card//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:boltwish-${Date.now()}@boltwish.vercel.app`,
    `DTSTAMP:${now}`,
    `DTSTART;VALUE=DATE:${dtStart}`,
    `DTEND;VALUE=DATE:${dtEnd}`,
    `SUMMARY:🎉 ${cleanTitle}`,
    `DESCRIPTION:${cleanDesc}`,
    `URL:${url}`,
    'STATUS:CONFIRMED',
    'TRANSP:TRANSPARENT',
    'BEGIN:VALARM',
    'TRIGGER:-PT15M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder: Celebration card today!',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const downloadUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = `${cleanTitle.toLowerCase().replace(/\s+/g, '-')}-boltwish.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(downloadUrl);
}

export function getGoogleCalendarUrl({
  title = 'Celebration Wish',
  description = 'Open your special Boltwish celebration card',
  eventDate,
  url = window.location.href,
}) {
  const safeDate = eventDate ? new Date(eventDate) : new Date();
  const year = safeDate.getFullYear();
  const month = String(safeDate.getMonth() + 1).padStart(2, '0');
  const day = String(safeDate.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;
  const text = encodeURIComponent(`🎉 ${title}`);
  const details = encodeURIComponent(`${description}\n\nOpen your card: ${url}`);
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dateStr}/${dateStr}&details=${details}`;
}

