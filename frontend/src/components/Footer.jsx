import React from 'react';
import { Calendar } from 'lucide-react';

const Footer = () => (
  <footer className="relative z-10 mt-16 border-t border-border">
    <div className="container max-w-6xl py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2 text-text-muted">
        <Calendar size={16} className="text-primary" />
        <span className="font-semibold text-sm text-text-main">FacultyScheduler</span>
      </div>
      <p className="text-xs text-text-light m-0">
        © {new Date().getFullYear()} FacultyScheduler · Built with React &amp; Express
      </p>
    </div>
  </footer>
);

export default Footer;
