import React, { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

// Global, non-blocking toast notifications — a drop-in replacement for the
// browser's alert(). Access via the useToast() hook.
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (message, type = 'info', duration = 4000) => {
      const id = Date.now() + Math.random();
      setToasts((current) => [...current, { id, message, type }]);
      if (duration) setTimeout(() => dismiss(id), duration);
    },
    [dismiss]
  );

  const toast = {
    success: (m) => push(m, 'success'),
    error: (m) => push(m, 'error'),
    info: (m) => push(m, 'info'),
  };

  const icons = { success: CheckCircle, error: XCircle, info: Info };
  const accents = {
    success: 'border-l-success text-success',
    error: 'border-l-danger text-danger',
    info: 'border-l-primary text-primary',
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        {toasts.map(({ id, message, type }) => {
          const Icon = icons[type] || Info;
          return (
            <div
              key={id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl bg-surface-solid border border-border border-l-4 shadow-lg animate-slide-up ${accents[type]}`}
              role="alert"
            >
              <Icon size={20} className="mt-0.5 shrink-0" />
              <p className="flex-1 text-sm font-medium text-text-main m-0">{message}</p>
              <button
                onClick={() => dismiss(id)}
                className="text-text-light hover:text-text-main transition-colors"
                aria-label="Dismiss"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
};
