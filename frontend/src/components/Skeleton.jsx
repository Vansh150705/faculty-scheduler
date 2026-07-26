import React from 'react';

// Simple shimmer placeholder used while data is loading. Keeps layouts from
// jumping and reads better than a bare spinner for content-heavy sections.
const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse rounded-lg bg-border-light ${className}`} />
);

export default Skeleton;
