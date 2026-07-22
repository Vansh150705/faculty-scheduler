import React, { useEffect, useRef, useState } from 'react';
import { Bell, Check, CheckCheck } from 'lucide-react';
import api from '../api/client';

// Relative "time ago" label without pulling in a date library.
const timeAgo = (date) => {
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef(null);

  const load = async () => {
    try {
      const { data } = await api.get('/notifications');
      setItems(data.notifications);
      setUnread(data.unread);
    } catch {
      /* silent — the bell is non-critical */
    }
  };

  useEffect(() => {
    load();
    const timer = setInterval(load, 30000); // light polling
    return () => clearInterval(timer);
  }, []);

  // Close the dropdown when clicking outside of it.
  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const markOne = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setItems((cur) => cur.map((n) => (n._id === id ? { ...n, read: true } : n)));
      setUnread((u) => Math.max(0, u - 1));
    } catch {
      /* ignore */
    }
  };

  const markAll = async () => {
    try {
      await api.put('/notifications/read-all');
      setItems((cur) => cur.map((n) => ({ ...n, read: true })));
      setUnread(0);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="btn-icon relative text-text-muted hover:text-primary"
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-danger text-white text-[10px] font-bold flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-80 max-w-[90vw] bg-surface-solid border border-border rounded-2xl shadow-xl overflow-hidden z-50 animate-slide-up">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="font-bold text-text-main">Notifications</span>
            {unread > 0 && (
              <button
                onClick={markAll}
                className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline"
              >
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <p className="text-center text-text-muted text-sm py-10 m-0">You're all caught up 🎉</p>
            ) : (
              items.map((n) => (
                <div
                  key={n._id}
                  className={`flex items-start gap-3 px-4 py-3 border-b border-border-light transition-colors ${
                    n.read ? 'opacity-60' : 'bg-primary-light/40'
                  }`}
                >
                  <div className="flex-1">
                    <p className="text-sm text-text-main m-0">{n.message}</p>
                    <span className="text-xs text-text-light">{timeAgo(n.createdAt)}</span>
                  </div>
                  {!n.read && (
                    <button
                      onClick={() => markOne(n._id)}
                      className="text-text-light hover:text-primary shrink-0"
                      title="Mark as read"
                    >
                      <Check size={16} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
