import React from 'react';

// Vertical bar chart. `data` is [{ label, count }].
const BarChart = ({ data = [], height = 180 }) => {
  const max = Math.max(1, ...data.map((d) => d.count));

  return (
    <div className="flex items-end justify-between gap-1.5" style={{ height }}>
      {data.map((d) => (
        <div key={d.label} className="flex flex-col items-center gap-1.5 flex-1 h-full justify-end">
          <span className="text-[10px] font-bold text-text-muted">{d.count || ''}</span>
          <div
            className="w-full rounded-t-md bg-gradient-to-t from-primary to-secondary transition-all"
            style={{
              height: `${(d.count / max) * 100}%`,
              minHeight: d.count ? 4 : 2,
              opacity: d.count ? 1 : 0.2,
            }}
            title={`${d.label}: ${d.count}`}
          />
          <span className="text-[9px] text-text-light whitespace-nowrap">{d.label}</span>
        </div>
      ))}
    </div>
  );
};

export default BarChart;
