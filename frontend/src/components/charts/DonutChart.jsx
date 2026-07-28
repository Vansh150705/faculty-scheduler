import React from 'react';

// Dependency-free SVG donut chart. `data` is [{ label, value, color }].
const DonutChart = ({ data = [], size = 180, thickness = 26 }) => {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const radius = (size - thickness) / 2;
  const cx = size / 2;
  const circ = 2 * Math.PI * radius;

  let offset = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
        <g transform={`rotate(-90 ${cx} ${cx})`}>
          {/* Track */}
          <circle cx={cx} cy={cx} r={radius} fill="none" stroke="var(--border-light)" strokeWidth={thickness} />
          {total > 0 &&
            data.map((d, i) => {
              const len = (d.value / total) * circ;
              const seg = (
                <circle
                  key={i}
                  cx={cx}
                  cy={cx}
                  r={radius}
                  fill="none"
                  stroke={d.color}
                  strokeWidth={thickness}
                  strokeDasharray={`${len} ${circ - len}`}
                  strokeDashoffset={-offset}
                  strokeLinecap="butt"
                />
              );
              offset += len;
              return seg;
            })}
        </g>
        <text x="50%" y="47%" textAnchor="middle" style={{ fill: 'var(--text-main)', fontSize: 30, fontWeight: 800 }}>
          {total}
        </text>
        <text x="50%" y="60%" textAnchor="middle" style={{ fill: 'var(--text-muted)', fontSize: 12 }}>
          total
        </text>
      </svg>

      <div className="flex flex-col gap-2">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm" style={{ background: d.color }} />
            <span className="text-sm text-text-muted capitalize">{d.label}</span>
            <span className="text-sm font-bold text-text-main ml-auto">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DonutChart;
