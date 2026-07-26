import React, { useEffect, useState } from 'react';
import { CalendarClock, CalendarCheck, Clock, CheckCircle2, Layers } from 'lucide-react';
import api from '../api/client';
import StatCard from './StatCard';
import Skeleton from './Skeleton';

// Minimal, dependency-free bar chart for the weekday distribution.
const WeekdayChart = ({ data }) => {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-bold mb-5 text-text-main">Appointments by weekday</h3>
      <div className="flex items-end justify-between gap-2 h-40">
        {data.map((d) => (
          <div key={d.day} className="flex flex-col items-center gap-2 flex-1">
            <span className="text-xs font-bold text-text-muted">{d.count}</span>
            <div
              className="w-full rounded-t-lg bg-gradient-to-t from-primary to-secondary transition-all"
              style={{ height: `${(d.count / max) * 100}%`, minHeight: d.count ? '6px' : '2px', opacity: d.count ? 1 : 0.25 }}
              title={`${d.day}: ${d.count}`}
            />
            <span className="text-xs text-text-light">{d.day}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const StatsGrid = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api
      .get('/stats')
      .then(({ data }) => setStats(data))
      .catch(() => {});
  }, []);

  // Placeholder tiles while the analytics request is in flight.
  if (!stats) {
    return (
      <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[92px]" />
        ))}
      </div>
    );
  }

  const cards = [
    { icon: CalendarClock, label: 'Total appointments', value: stats.total, accent: 'primary' },
    { icon: CalendarCheck, label: 'Upcoming', value: stats.upcoming, accent: 'secondary' },
    { icon: CheckCircle2, label: 'Confirmed', value: stats.byStatus.confirmed, accent: 'success' },
    { icon: Clock, label: 'Pending', value: stats.byStatus.pending, accent: 'warning' },
  ];
  if (stats.role === 'faculty') {
    cards.push({ icon: Layers, label: 'Availability slots', value: stats.availabilitySlots ?? 0, accent: 'primary' });
  }

  return (
    <div className="mb-8 flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((c) => (
          <StatCard key={c.label} {...c} />
        ))}
      </div>
      {stats.byDay && stats.byDay.some((d) => d.count > 0) && <WeekdayChart data={stats.byDay} />}
    </div>
  );
};

export default StatsGrid;
