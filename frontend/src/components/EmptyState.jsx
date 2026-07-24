import React from 'react';

// Consistent empty-state block used wherever a list has no items yet.
const EmptyState = ({ icon: Icon, title, message }) => (
  <div className="text-center py-14 border-2 border-dashed border-border rounded-2xl bg-surface-hover">
    {Icon && (
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-surface-solid text-text-light shadow-sm mb-4">
        <Icon size={30} />
      </div>
    )}
    <p className="text-text-main font-bold mb-1">{title}</p>
    {message && <p className="text-text-muted text-sm m-0 max-w-sm mx-auto">{message}</p>}
  </div>
);

export default EmptyState;
