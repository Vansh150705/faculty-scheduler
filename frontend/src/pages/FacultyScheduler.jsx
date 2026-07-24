import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api, { getErrorMessage } from '../api/client';
import CalendarView from '../components/CalendarView';
import EmptyState from '../components/EmptyState';
import { exportCSV, exportICS } from '../utils/exportCalendar';
import {
  Clock, Plus, Trash2, Calendar as CalendarIcon, CheckCircle, XCircle,
  CheckCheck, List, LayoutGrid, Download, CalendarDays,
} from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const FILTERS = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];

const FacultyScheduler = () => {
  const { user } = useContext(AuthContext);
  const toast = useToast();

  const [availabilities, setAvailabilities] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [dayOfWeek, setDayOfWeek] = useState('Monday');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [slotDuration, setSlotDuration] = useState(30);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [view, setView] = useState('list');

  const studentName = (a) => a.studentId?.name || 'Student';

  const fetchAvailabilities = async () => {
    try {
      const { data } = await api.get(`/availability/${user.id}`);
      setAvailabilities(data);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const fetchAppointments = async () => {
    try {
      const { data } = await api.get('/appointments');
      setAppointments(data);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  useEffect(() => {
    fetchAvailabilities();
    fetchAppointments();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAddAvailability = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/availability', { dayOfWeek, startTime, endTime, slotDuration: Number(slotDuration) });
      toast.success('Time slot added');
      setStartTime('');
      setEndTime('');
      fetchAvailabilities();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAvailability = async (id) => {
    try {
      await api.delete(`/availability/${id}`);
      toast.success('Time slot removed');
      fetchAvailabilities();
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.put(`/appointments/${id}/status`, { status });
      toast.success(`Appointment ${status}`);
      fetchAppointments();
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const visible = filter === 'all' ? appointments : appointments.filter((a) => a.status === filter);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Availability Management */}
      <div className="lg:col-span-1 flex flex-col gap-8">
        <div className="glass-card p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary-light text-primary shadow-sm">
              <Clock size={24} />
            </div>
            <h2 className="text-2xl font-extrabold m-0 text-text-main">Set Availability</h2>
          </div>

          <form onSubmit={handleAddAvailability} className="flex flex-col gap-5">
            <div>
              <label className="label">Day of Week</label>
              <select className="input-field cursor-pointer" value={dayOfWeek} onChange={(e) => setDayOfWeek(e.target.value)}>
                {DAYS.map((day) => <option key={day} value={day}>{day}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Start Time</label>
                <input type="time" required className="input-field" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              </div>
              <div>
                <label className="label">End Time</label>
                <input type="time" required className="input-field" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="label">Slot length (minutes)</label>
              <select className="input-field cursor-pointer" value={slotDuration} onChange={(e) => setSlotDuration(e.target.value)}>
                {[15, 20, 30, 45, 60].map((m) => <option key={m} value={m}>{m} minutes</option>)}
              </select>
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary w-full mt-2 py-3">
              <Plus size={18} /> {loading ? 'Adding...' : 'Add Time Slot'}
            </button>
          </form>
        </div>

        <div className="glass-card p-8">
          <h2 className="text-xl font-bold mb-6 text-text-main">Your Time Slots</h2>
          {availabilities.length === 0 ? (
            <div className="text-center py-8 bg-surface-hover rounded-xl border border-dashed border-border">
              <p className="text-text-muted text-sm font-medium m-0">No availabilities set yet.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {availabilities.map((slot, index) => (
                <div key={slot._id} className="flex justify-between items-center p-4 border border-border rounded-xl bg-surface hover:shadow-md hover:border-primary/40 transition-all duration-300 animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                  <div>
                    <p className="font-bold text-text-main m-0">{slot.dayOfWeek}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock size={12} className="text-primary" />
                      <p className="text-sm font-medium text-text-muted m-0">{slot.startTime} - {slot.endTime} · {slot.slotDuration || 30}m</p>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteAvailability(slot._id)} className="btn-icon text-text-muted hover:text-danger"><Trash2 size={18} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Appointment Requests */}
      <div className="lg:col-span-2">
        <div className="glass-card p-8 h-full">
          <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-secondary text-white shadow-sm">
                <CalendarIcon size={24} />
              </div>
              <h2 className="text-2xl font-extrabold m-0 text-text-main">Appointments</h2>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setView(view === 'list' ? 'calendar' : 'list')} className="btn-icon text-text-muted hover:text-primary" title={view === 'list' ? 'Calendar view' : 'List view'}>
                {view === 'list' ? <LayoutGrid size={18} /> : <List size={18} />}
              </button>
              {appointments.length > 0 && (
                <>
                  <button onClick={() => exportCSV(appointments, studentName)} className="btn-icon text-text-muted hover:text-primary" title="Export CSV"><Download size={18} /></button>
                  <button onClick={() => exportICS(appointments, studentName)} className="btn-icon text-text-muted hover:text-primary" title="Export calendar (.ics)"><CalendarDays size={18} /></button>
                </>
              )}
            </div>
          </div>

          {view === 'list' && (
            <div className="flex flex-wrap gap-2 mb-6">
              {FILTERS.map((f) => (
                <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-all ${filter === f ? 'bg-primary text-white shadow-sm' : 'bg-surface-hover text-text-muted hover:text-primary'}`}>
                  {f}
                </button>
              ))}
            </div>
          )}

          {view === 'calendar' ? (
            <CalendarView appointments={appointments} counterpart={studentName} />
          ) : visible.length === 0 ? (
            <EmptyState
              icon={CalendarIcon}
              title={filter === 'all' ? 'No appointments yet' : `No ${filter} appointments`}
              message="When students book with you, they'll appear here."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {visible.map((appt, index) => (
                <div key={appt._id} className={`p-6 border rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg animate-slide-up bg-surface ${appt.status === 'pending' ? 'border-warning/30 hover:border-warning' : appt.status === 'confirmed' ? 'border-secondary/30 hover:border-secondary' : appt.status === 'completed' ? 'border-primary/30 hover:border-primary' : 'border-danger/30 hover:border-danger'}`} style={{ animationDelay: `${index * 80}ms` }}>
                  <div className="flex justify-between items-start mb-4">
                    <span className={`badge ${appt.status === 'pending' ? 'badge-warning' : appt.status === 'confirmed' ? 'badge-success' : appt.status === 'completed' ? 'badge-primary' : 'bg-red-100 text-red-700'}`}>{appt.status}</span>
                    <span className="text-xs font-bold text-text-light bg-border-light px-2 py-1 rounded-md">{new Date(appt.date).toLocaleDateString()}</span>
                  </div>
                  <h3 className="font-extrabold text-xl mb-1 text-text-main">{appt.studentId?.name || 'Unknown Student'}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={14} className="text-text-light" />
                    <p className="text-sm font-medium text-text-muted m-0">{appt.startTime} - {appt.endTime}</p>
                  </div>
                  {appt.reason && <p className="text-xs text-text-light italic m-0 mb-4">“{appt.reason}”</p>}

                  {appt.status === 'pending' && (
                    <div className="flex gap-3 mt-4 pt-4 border-t border-border-light">
                      <button onClick={() => handleUpdateStatus(appt._id, 'confirmed')} className="flex-1 btn py-2 px-0 bg-secondary hover:bg-secondary-hover text-white flex justify-center items-center gap-2 shadow-sm"><CheckCircle size={18} /> Confirm</button>
                      <button onClick={() => handleUpdateStatus(appt._id, 'cancelled')} className="flex-1 btn btn-secondary text-danger hover:bg-danger hover:text-white hover:border-danger flex justify-center items-center gap-2"><XCircle size={18} /> Decline</button>
                    </div>
                  )}
                  {appt.status === 'confirmed' && (
                    <div className="mt-4 pt-4 border-t border-border-light">
                      <button onClick={() => handleUpdateStatus(appt._id, 'completed')} className="w-full btn btn-secondary text-primary hover:bg-primary hover:text-white hover:border-primary flex justify-center items-center gap-2"><CheckCheck size={18} /> Mark completed</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacultyScheduler;
