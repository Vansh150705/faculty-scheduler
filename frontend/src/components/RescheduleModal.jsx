import React, { useState, useEffect, useRef } from 'react';
import { X, CalendarDays } from 'lucide-react';
import api, { getErrorMessage } from '../api/client';
import { useToast } from '../context/ToastContext';

// Lightweight modal for a student to move an existing appointment to a new
// date/time. The backend re-runs the double-booking check.
const RescheduleModal = ({ appointment, onClose, onDone }) => {
  const toast = useToast();
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState(appointment.startTime);
  const [endTime, setEndTime] = useState(appointment.endTime);
  const [saving, setSaving] = useState(false);
  const dateRef = useRef(null);

  // Autofocus the first field and close on Escape.
  useEffect(() => {
    dateRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/appointments/${appointment._id}/reschedule`, { date, startTime, endTime });
      toast.success('Appointment rescheduled');
      onDone();
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md glass-card p-8 animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold m-0 text-text-main">Reschedule Appointment</h3>
          <button onClick={onClose} className="btn-icon text-text-muted hover:text-danger" aria-label="Close"><X size={20} /></button>
        </div>

        <p className="text-sm text-text-muted mb-6">
          With <span className="font-semibold text-text-main">{appointment.facultyId?.name}</span>. Rescheduling resets it to pending for re-confirmation.
        </p>

        <form onSubmit={submit} className="flex flex-col gap-4">
          <div>
            <label className="label">New Date</label>
            <div className="relative">
              <input ref={dateRef} type="date" required className="input-field pl-11" value={date} min={new Date().toISOString().split('T')[0]} onChange={(e) => setDate(e.target.value)} />
              <CalendarDays size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Start</label>
              <input type="time" required className="input-field" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div>
              <label className="label">End</label>
              <input type="time" required className="input-field" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
          </div>
          <div className="flex gap-3 mt-2">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn btn-primary flex-1">{saving ? 'Saving...' : 'Reschedule'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RescheduleModal;
