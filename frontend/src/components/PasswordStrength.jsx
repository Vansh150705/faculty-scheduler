import React, { useMemo } from 'react';

// Lightweight password strength indicator. Scores length + character variety
// and renders four segments with a label. Purely a UX aid — the backend still
// enforces its own minimum.
const LEVELS = [
  { label: 'Weak', color: 'var(--danger)' },
  { label: 'Fair', color: 'var(--warning)' },
  { label: 'Good', color: 'var(--secondary)' },
  { label: 'Strong', color: 'var(--success)' },
];

const scorePassword = (pwd) => {
  if (!pwd) return 0;
  let score = 0;
  if (pwd.length >= 6) score += 1;
  if (pwd.length >= 10) score += 1;
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score += 1;
  if (/\d/.test(pwd)) score += 1;
  if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
  return Math.min(score, 4);
};

const PasswordStrength = ({ password }) => {
  const score = useMemo(() => scorePassword(password), [password]);
  if (!password) return null;

  const level = LEVELS[Math.max(0, score - 1)];

  return (
    <div className="mt-2">
      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="h-1.5 flex-1 rounded-full transition-colors"
            style={{ background: i < score ? level.color : 'var(--border-light)' }}
          />
        ))}
      </div>
      <p className="text-xs mt-1 m-0 font-semibold" style={{ color: level.color }}>
        {level.label} password
      </p>
    </div>
  );
};

export default PasswordStrength;
