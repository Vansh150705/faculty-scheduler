import React, { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../api/client';
import { useToast } from '../context/ToastContext';
import useDocumentTitle from '../hooks/useDocumentTitle';
import DonutChart from '../components/charts/DonutChart';
import LineChart from '../components/charts/LineChart';
import BarChart from '../components/charts/BarChart';
import Skeleton from '../components/Skeleton';
import { BarChart3, TrendingUp, Clock, CalendarRange, Trophy } from 'lucide-react';

const ChartCard = ({ icon: Icon, title, children }) => (
  <div className="glass-card p-6">
    <div className="flex items-center gap-2 mb-5">
      {Icon && <Icon size={18} className="text-primary" />}
      <h3 className="text-base font-bold m-0 text-text-main">{title}</h3>
    </div>
    {children}
  </div>
);

const Analytics = () => {
  const toast = useToast();
  useDocumentTitle('Analytics');
  const [data, setData] = useState(null);

  useEffect(() => {
    api
      .get('/stats/analytics')
      .then(({ data }) => setData(data))
      .catch((e) => toast.error(getErrorMessage(e)));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const statusData = data
    ? [
        { label: 'confirmed', value: data.byStatus.confirmed, color: 'var(--success)' },
        { label: 'pending', value: data.byStatus.pending, color: 'var(--warning)' },
        { label: 'completed', value: data.byStatus.completed, color: 'var(--primary)' },
        { label: 'cancelled', value: data.byStatus.cancelled, color: 'var(--danger)' },
      ]
    : [];

  return (
    <div className="container animate-slide-up">
      <div className="mb-8 p-8 glass-panel rounded-2xl flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center shrink-0">
          <BarChart3 size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold m-0 text-text-main">Analytics</h1>
          <p className="text-text-muted m-0">
            {data?.role === 'admin' ? 'System-wide' : data?.role === 'faculty' ? 'Your appointment' : 'Your booking'} insights and trends.
          </p>
        </div>
      </div>

      {!data ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-64" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard icon={BarChart3} title="Status breakdown">
            <div className="py-2">
              <DonutChart data={statusData} />
            </div>
          </ChartCard>

          <ChartCard icon={TrendingUp} title="Last 6 months">
            <LineChart data={data.monthly} />
          </ChartCard>

          <ChartCard icon={Clock} title="Busiest hours">
            <BarChart data={data.hourly} />
          </ChartCard>

          <ChartCard icon={CalendarRange} title="By weekday">
            <BarChart data={data.byDay.map((d) => ({ label: d.day, count: d.count }))} />
          </ChartCard>

          {data.role === 'admin' && data.topFaculty?.length > 0 && (
            <div className="lg:col-span-2">
              <ChartCard icon={Trophy} title="Most booked faculty">
                <BarChart data={data.topFaculty.map((f) => ({ label: f.name.split(' ').slice(-1)[0], count: f.count }))} />
              </ChartCard>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Analytics;
