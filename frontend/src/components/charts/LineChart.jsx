import React, { useId } from 'react';

// Area + line chart drawn in a fixed 320x170 coordinate space that scales to fit.
// `data` is [{ label, count }].
const LineChart = ({ data = [] }) => {
  const gradientId = useId();
  const W = 320;
  const H = 170;
  const pad = { top: 14, right: 12, bottom: 24, left: 26 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;
  const max = Math.max(1, ...data.map((d) => d.count));
  const n = data.length;

  const x = (i) => pad.left + (n <= 1 ? innerW / 2 : (i * innerW) / (n - 1));
  const y = (v) => pad.top + innerH - (v / max) * innerH;

  const points = data.map((d, i) => [x(i), y(d.count)]);
  const line = points.map((p) => p.join(',')).join(' ');
  const area =
    points.length > 0
      ? `M ${points[0][0]},${pad.top + innerH} L ${line.split(' ').join(' L ')} L ${points[points.length - 1][0]},${pad.top + innerH} Z`
      : '';

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* horizontal gridlines */}
      {[0, 0.5, 1].map((t) => (
        <line key={t} x1={pad.left} x2={W - pad.right} y1={pad.top + innerH * t} y2={pad.top + innerH * t} stroke="var(--border-light)" strokeWidth="1" />
      ))}

      {area && <path d={area} fill={`url(#${gradientId})`} />}
      {line && <polyline points={line} fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />}

      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p[0]} cy={p[1]} r="3.5" fill="var(--surface-solid)" stroke="var(--primary)" strokeWidth="2" />
          <text x={p[0]} y={H - 8} textAnchor="middle" style={{ fill: 'var(--text-light)', fontSize: 10 }}>
            {data[i].label}
          </text>
        </g>
      ))}
    </svg>
  );
};

export default LineChart;
