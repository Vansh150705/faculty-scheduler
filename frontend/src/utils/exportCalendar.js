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
  const s = String(value ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

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
      `SUMMARY:Appointment with ${counterpart(a)}`,
      `DESCRIPTION:${(a.reason || 'Faculty appointment').replace(/\n/g, ' ')} (status: ${a.status})`,
      'END:VEVENT'
    );
  });
  lines.push('END:VCALENDAR');
  triggerDownload('appointments.ics', lines.join('\r\n'), 'text/calendar');
};
