import React from 'react';

// Compact metric tile used across the dashboards. `accent` maps to a themed
// colour so a row of cards reads as one system.
const ACCENTS = {
  primary: 'bg-primary-light text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-danger/10 text-danger',
  secondary: 'bg-secondary/10 text-secondary',
};

const StatCard = ({ icon: Icon, label, value, accent = 'primary' }) => (
  <div className="glass-card p-6 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${ACCENTS[accent]}`}>
      {Icon && <Icon size={24} />}
    </div>
    <div>
      <p className="text-3xl font-extrabold m-0 text-text-main leading-none">{value}</p>
      <p className="text-sm text-text-muted m-0 mt-1">{label}</p>
    </div>
  </div>
);

export default StatCard;
