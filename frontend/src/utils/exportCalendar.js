// Client-side export helpers — no server round-trip, no external services.
// `counterpart(appt)` returns the other party's name (faculty for a student's
// view, student for a faculty view).

const pad = (n) => String(n).padStart(2, '0');

const triggerDownload = (filename, content, mime) => {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

const csvCell = (value) => {
  let s = String(value ?? '');
  // Neutralise CSV formula injection: a value starting with = + - @ (or tab/CR)
  // can be executed as a formula by Excel/Sheets. Prefix a single quote.
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

// Escape a value for an iCalendar TEXT field (RFC 5545) and strip control chars
// so it cannot break out of the property or inject new ones (CRLF injection).
const icsText = (value) =>
  String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/[;,]/g, (m) => `\\${m}`)
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, '');

export const exportCSV = (appointments, counterpart) => {
  const header = ['With', 'Date', 'Start', 'End', 'Status', 'Reason'];
  const rows = appointments.map((a) =>
    [
      counterpart(a),
      new Date(a.date).toLocaleDateString(),
      a.startTime,
      a.endTime,
      a.status,
      a.reason || '',
    ]
      .map(csvCell)
      .join(',')
  );
  triggerDownload('appointments.csv', [header.join(','), ...rows].join('\n'), 'text/csv');
};

// Build an iCalendar file so appointments can be imported into Google/Apple/Outlook.
const toICSDate = (date, time) => {
  const d = new Date(date);
  const [h, m] = time.split(':').map(Number);
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(h)}${pad(m)}00`;
};

export const exportICS = (appointments, counterpart) => {
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//FacultyScheduler//EN', 'CALSCALE:GREGORIAN'];
  appointments.forEach((a, i) => {
    lines.push(
      'BEGIN:VEVENT',
      `UID:${a._id || i}@facultyscheduler`,
      `DTSTART:${toICSDate(a.date, a.startTime)}`,
      `DTEND:${toICSDate(a.date, a.endTime)}`,
      `SUMMARY:Appointment with ${icsText(counterpart(a))}`,
      `DESCRIPTION:${icsText(a.reason || 'Faculty appointment')} (status: ${icsText(a.status)})`,
      'END:VEVENT'
    );
  });
  lines.push('END:VCALENDAR');
  triggerDownload('appointments.ics', lines.join('\r\n'), 'text/calendar');
};
