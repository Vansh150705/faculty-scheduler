import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const DOT = {
  pending: 'bg-warning',
  confirmed: 'bg-success',
  cancelled: 'bg-danger',
  completed: 'bg-secondary',
};

const dateKey = (d) => {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${dt.getMonth()}-${dt.getDate()}`;
};

// Month calendar that plots appointments as colour-coded dots. Pure date math,
// no calendar library.
const CalendarView = ({ appointments = [], counterpart = () => '' }) => {
  const [cursor, setCursor] = useState(() => new Date());

  const byDay = useMemo(() => {
    const map = {};
    appointments.forEach((a) => {
      const key = dateKey(a.date);
      (map[key] = map[key] || []).push(a);
    });
    return map;
  }, [appointments]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayKey = dateKey(new Date());

  const cells = [];
  for (let i = 0; i < firstWeekday; i += 1) cells.push(null);
  for (let d = 1; d <= daysInMonth; d += 1) cells.push(d);

  const shift = (delta) => setCursor(new Date(year, month + delta, 1));

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold m-0 text-text-main">{MONTHS[month]} {year}</h3>
        <div className="flex gap-2">
          <button onClick={() => shift(-1)} className="btn-icon text-text-muted hover:text-primary" aria-label="Previous month"><ChevronLeft size={18} /></button>
          <button onClick={() => setCursor(new Date())} className="text-xs font-semibold text-primary px-2 hover:underline">Today</button>
          <button onClick={() => shift(1)} className="btn-icon text-text-muted hover:text-primary" aria-label="Next month"><ChevronRight size={18} /></button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAYS.map((w) => (
          <div key={w} className="text-center text-xs font-bold text-text-light py-1">{w}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={`e${i}`} />;
          const key = `${year}-${month}-${day}`;
          const appts = byDay[key] || [];
          const isToday = key === todayKey;
          return (
            <div
              key={key}
              className={`min-h-[64px] rounded-lg border p-1.5 flex flex-col gap-1 transition-colors ${
                isToday ? 'border-primary bg-primary-light/40' : 'border-border-light hover:border-border'
              }`}
              title={appts.map((a) => `${a.startTime} ${counterpart(a)} (${a.status})`).join('\n')}
            >
              <span className={`text-xs font-bold ${isToday ? 'text-primary' : 'text-text-muted'}`}>{day}</span>
              <div className="flex flex-wrap gap-1">
                {appts.slice(0, 4).map((a) => (
                  <span key={a._id} className={`w-2 h-2 rounded-full ${DOT[a.status] || 'bg-primary'}`} />
                ))}
                {appts.length > 4 && <span className="text-[10px] text-text-light">+{appts.length - 4}</span>}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-4 mt-5 pt-4 border-t border-border-light">
        {Object.entries(DOT).map(([status, cls]) => (
          <div key={status} className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${cls}`} />
            <span className="text-xs text-text-muted capitalize">{status}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarView;
