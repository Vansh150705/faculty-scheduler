import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api, { getErrorMessage } from '../api/client';
import CalendarView from '../components/CalendarView';
import RescheduleModal from '../components/RescheduleModal';
import EmptyState from '../components/EmptyState';
import Skeleton from '../components/Skeleton';
import { exportCSV, exportICS } from '../utils/exportCalendar';
import {
  Search, Calendar as CalendarIcon, Clock, User as UserIcon, CalendarDays,
  Building2, MapPin, List, LayoutGrid, Download, X, RefreshCw, Hourglass, BellPlus, Trash2,
} from 'lucide-react';

const StudentBooking = () => {
  const { user } = useContext(AuthContext);
  const toast = useToast();

  const [faculties, setFaculties] = useState([]);
  const [loadingFaculty, setLoadingFaculty] = useState(true);
  const [facultySearch, setFacultySearch] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [reason, setReason] = useState('');
  const [myAppointments, setMyAppointments] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(null); // startTime being booked
  const [view, setView] = useState('list');
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [myWaitlist, setMyWaitlist] = useState([]);
  const [waitlisting, setWaitlisting] = useState(null); // startTime being waitlisted
  const [bookingFilter, setBookingFilter] = useState('upcoming');

  const facultyName = (a) => a.facultyId?.name || 'Faculty';

  // Split bookings into upcoming vs past relative to the start of today.
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const visibleBookings = myAppointments.filter((a) => {
    if (bookingFilter === 'all') return true;
    const isPast = new Date(a.date) < startOfDay;
    return bookingFilter === 'past' ? isPast : !isPast;
  });

  const fetchWaitlist = async () => {
    try {
      const { data } = await api.get('/waitlist/mine');
      setMyWaitlist(data);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const fetchFaculty = async () => {
    setLoadingFaculty(true);
    try {
      const { data } = await api.get('/auth/faculty', { params: facultySearch ? { search: facultySearch } : {} });
      setFaculties(data);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoadingFaculty(false);
    }
  };

  const fetchMyAppointments = async () => {
    try {
      const { data } = await api.get('/appointments');
      setMyAppointments(data);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  useEffect(() => {
    const t = setTimeout(fetchFaculty, 250);
    return () => clearTimeout(t);
  }, [facultySearch]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchMyAppointments();
    fetchWaitlist();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Load bookable slots whenever a faculty + date are chosen.
  useEffect(() => {
    if (!selectedFaculty || !bookingDate) {
      setSlots([]);
      return;
    }
    setLoadingSlots(true);
    api
      .get(`/availability/${selectedFaculty._id}/slots`, { params: { date: bookingDate } })
      .then(({ data }) => setSlots(data.slots))
      .catch((e) => toast.error(getErrorMessage(e)))
      .finally(() => setLoadingSlots(false));
  }, [selectedFaculty, bookingDate]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleBook = async (slot) => {
    setBooking(slot.startTime);
    try {
      await api.post('/appointments', {
        facultyId: selectedFaculty._id,
        date: bookingDate,
        startTime: slot.startTime,
        endTime: slot.endTime,
        reason,
      });
      toast.success('Appointment booked!');
      setReason('');
      fetchMyAppointments();
      // refresh slots so the just-booked one shows as taken
      const { data } = await api.get(`/availability/${selectedFaculty._id}/slots`, { params: { date: bookingDate } });
      setSlots(data.slots);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setBooking(null);
    }
  };

  const handleCancel = async (id) => {
    try {
      await api.delete(`/appointments/${id}`);
      toast.success('Appointment cancelled');
      fetchMyAppointments();
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const handleJoinWaitlist = async (slot) => {
    setWaitlisting(slot.startTime);
    try {
      await api.post('/waitlist', {
        facultyId: selectedFaculty._id,
        date: bookingDate,
        startTime: slot.startTime,
        endTime: slot.endTime,
        reason,
      });
      toast.success("Added to waitlist — we'll notify you if it opens up");
      fetchWaitlist();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setWaitlisting(null);
    }
  };

  const handleLeaveWaitlist = async (id) => {
    try {
      await api.delete(`/waitlist/${id}`);
      toast.success('Removed from waitlist');
      fetchWaitlist();
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Booking Interface */}
      <div className="lg:col-span-2 flex flex-col gap-8">
        <div className="glass-card p-8">
          <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary-light text-primary shadow-sm">
                <Search size={24} />
              </div>
              <h2 className="text-2xl font-extrabold m-0 text-text-main">Find Faculty</h2>
            </div>
            <div className="relative">
              <input
                className="input-field pl-10 py-2.5"
                placeholder="Search name or department"
                value={facultySearch}
                onChange={(e) => setFacultySearch(e.target.value)}
              />
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {loadingFaculty &&
              faculties.length === 0 &&
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={`s${i}`} className="h-[76px]" />)}
            {!loadingFaculty &&
              faculties.map((faculty, index) => (
              <div
                key={faculty._id}
                onClick={() => setSelectedFaculty(faculty)}
                className={`p-5 rounded-2xl cursor-pointer transition-all duration-300 animate-slide-up border-2 ${selectedFaculty?._id === faculty._id ? 'border-primary bg-primary-light shadow-md -translate-y-1' : 'border-border bg-surface hover:border-primary/40 hover:shadow-sm'}`}
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <div className="flex items-center gap-4">
                  <div className={`flex items-center justify-center w-11 h-11 rounded-full shrink-0 ${selectedFaculty?._id === faculty._id ? 'bg-primary text-white' : 'bg-surface-hover border border-border text-text-muted'}`}>
                    <UserIcon size={20} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-text-main truncate m-0">{faculty.name}</h3>
                    {faculty.title || faculty.department ? (
                      <p className="text-xs text-text-muted m-0 flex items-center gap-1 truncate">
                        <Building2 size={12} /> {[faculty.title, faculty.department].filter(Boolean).join(' · ')}
                      </p>
                    ) : (
                      <p className="text-xs text-text-muted m-0">Faculty</p>
                    )}
                    {faculty.officeLocation && (
                      <p className="text-xs text-text-light m-0 flex items-center gap-1 truncate"><MapPin size={12} /> {faculty.officeLocation}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {!loadingFaculty && faculties.length === 0 && (
              <div className="col-span-2 text-center py-10 border-2 border-dashed border-border rounded-xl bg-surface-hover">
                <p className="text-text-muted text-sm font-medium m-0">No faculty found.</p>
              </div>
            )}
          </div>

          {selectedFaculty && (
            <div className="mt-8 pt-8 border-t border-border animate-slide-up">
              <h3 className="text-xl font-bold mb-6 text-text-main">Book with {selectedFaculty.name}</h3>

              <div className="mb-6 p-6 bg-surface-hover rounded-xl border border-border-light">
                <label className="label text-primary">1. Select a date</label>
                <div className="relative max-w-sm mt-2">
                  <input
                    type="date"
                    className="input-field w-full pl-12"
                    value={bookingDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setBookingDate(e.target.value)}
                  />
                  <CalendarDays size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                </div>
              </div>

              {bookingDate && (
                <div className="animate-slide-up">
                  <div className="mb-5">
                    <label className="label text-primary">2. Reason (optional)</label>
                    <input
                      className="input-field mt-1"
                      placeholder="e.g. Project proposal review"
                      value={reason}
                      maxLength={300}
                      onChange={(e) => setReason(e.target.value)}
                    />
                  </div>

                  <label className="label text-primary mb-3">3. Pick an available slot</label>
                  {loadingSlots ? (
                    <p className="text-text-muted text-sm">Loading slots…</p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {slots.map((slot) =>
                        slot.booked ? (
                          <button
                            key={slot.startTime}
                            onClick={() => handleJoinWaitlist(slot)}
                            disabled={waitlisting === slot.startTime}
                            title="This slot is taken — join the waitlist to be notified if it opens up"
                            className="p-3 rounded-xl border border-dashed border-warning/50 bg-warning/5 text-text-muted text-sm font-semibold transition-all hover:bg-warning/10 hover:text-warning"
                          >
                            <span className="line-through opacity-70">{slot.startTime}</span>
                            <span className="flex items-center justify-center gap-1 text-[10px] font-bold mt-0.5">
                              <BellPlus size={11} /> {waitlisting === slot.startTime ? 'adding…' : 'waitlist'}
                            </span>
                          </button>
                        ) : (
                          <button
                            key={slot.startTime}
                            onClick={() => handleBook(slot)}
                            disabled={booking === slot.startTime}
                            className="p-3 rounded-xl border border-border bg-surface text-text-main text-sm font-semibold transition-all hover:border-primary hover:text-primary hover:shadow-sm"
                          >
                            {slot.startTime}
                            {booking === slot.startTime && <span className="block text-[10px] font-normal">booking…</span>}
                          </button>
                        )
                      )}
                      {slots.length === 0 && (
                        <div className="col-span-full text-center py-8 border-2 border-dashed border-border rounded-xl bg-surface-hover">
                          <p className="text-text-muted text-sm font-medium m-0">No slots on this day. Try another date.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Waitlist */}
        {myWaitlist.length > 0 && (
          <div className="glass-card p-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-warning/10 text-warning shadow-sm">
                <Hourglass size={22} />
              </div>
              <h2 className="text-xl font-extrabold m-0 text-text-main">On the Waitlist</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {myWaitlist.map((w) => (
                <div key={w._id} className="flex items-center justify-between p-4 border border-border rounded-xl bg-surface">
                  <div>
                    <p className="font-bold text-text-main m-0">{w.facultyId?.name || 'Faculty'}</p>
                    <p className="text-xs text-text-muted m-0 flex items-center gap-1 mt-0.5">
                      <CalendarDays size={12} /> {new Date(w.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · {w.startTime}
                    </p>
                    {w.status === 'notified' && (
                      <span className="badge badge-success mt-2 inline-block">slot opened!</span>
                    )}
                  </div>
                  <button onClick={() => handleLeaveWaitlist(w._id)} className="btn-icon text-text-muted hover:text-danger" title="Leave waitlist">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* My Appointments */}
      <div className="lg:col-span-1">
        <div className="glass-card p-6 md:p-8 h-full">
          <div className="flex items-center justify-between mb-6 gap-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-secondary text-white shadow-sm">
                <CalendarIcon size={22} />
              </div>
              <h2 className="text-xl font-extrabold m-0 text-text-main">My Bookings</h2>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setView(view === 'list' ? 'calendar' : 'list')} className="btn-icon text-text-muted hover:text-primary" title={view === 'list' ? 'Calendar view' : 'List view'}>
                {view === 'list' ? <LayoutGrid size={18} /> : <List size={18} />}
              </button>
              {myAppointments.length > 0 && (
                <>
                  <button onClick={() => exportCSV(myAppointments, facultyName)} className="btn-icon text-text-muted hover:text-primary" title="Export CSV"><Download size={18} /></button>
                  <button onClick={() => exportICS(myAppointments, facultyName)} className="btn-icon text-text-muted hover:text-primary" title="Export calendar (.ics)"><CalendarDays size={18} /></button>
                </>
              )}
            </div>
          </div>

          {view === 'list' && myAppointments.length > 0 && (
            <div className="flex gap-1 mb-5 p-1 bg-surface-hover rounded-full">
              {['upcoming', 'past', 'all'].map((f) => (
                <button
                  key={f}
                  onClick={() => setBookingFilter(f)}
                  className={`flex-1 px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-all ${bookingFilter === f ? 'bg-surface-solid text-primary shadow-sm' : 'text-text-muted hover:text-primary'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          )}

          {view === 'calendar' ? (
            <CalendarView appointments={myAppointments} counterpart={facultyName} />
          ) : (
            <div className="flex flex-col gap-4">
              {visibleBookings.map((appt, index) => (
                <div key={appt._id} className="p-5 border border-border rounded-2xl bg-surface relative overflow-hidden hover:shadow-md transition-all duration-300 animate-slide-up" style={{ animationDelay: `${index * 80}ms` }}>
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${appt.status === 'pending' ? 'bg-warning' : appt.status === 'confirmed' ? 'bg-secondary' : appt.status === 'completed' ? 'bg-primary' : 'bg-danger'}`}></div>
                  <div className="flex justify-between items-start mb-3 pl-2">
                    <span className={`badge ${appt.status === 'pending' ? 'badge-warning' : appt.status === 'confirmed' ? 'badge-success' : appt.status === 'completed' ? 'badge-primary' : 'bg-red-100 text-red-700'}`}>{appt.status}</span>
                  </div>
                  <div className="pl-2">
                    <h3 className="font-bold text-lg mb-2 text-text-main">{appt.facultyId?.name || 'Faculty'}</h3>
                    <div className="space-y-1.5">
                      <p className="text-sm font-medium text-text-muted flex items-center gap-2 m-0"><CalendarDays size={16} className="text-text-light" /> {new Date(appt.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                      <p className="text-sm font-medium text-text-muted flex items-center gap-2 m-0"><Clock size={16} className="text-text-light" /> {appt.startTime} - {appt.endTime}</p>
                      {appt.reason && <p className="text-xs text-text-light italic m-0 pt-1">“{appt.reason}”</p>}
                    </div>
                    {appt.status !== 'cancelled' && appt.status !== 'completed' && (
                      <div className="flex gap-2 mt-4 pt-3 border-t border-border-light">
                        <button onClick={() => setRescheduleTarget(appt)} className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline"><RefreshCw size={13} /> Reschedule</button>
                        <button onClick={() => handleCancel(appt._id)} className="text-xs font-semibold text-danger flex items-center gap-1 hover:underline ml-auto"><X size={13} /> Cancel</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {myAppointments.length === 0 && (
                <EmptyState icon={CalendarDays} title="No bookings yet" message="Pick a faculty member to get started." />
              )}
              {myAppointments.length > 0 && visibleBookings.length === 0 && (
                <EmptyState icon={CalendarDays} title={`No ${bookingFilter} bookings`} message="Try a different filter." />
              )}
            </div>
          )}
        </div>
      </div>

      {rescheduleTarget && (
        <RescheduleModal appointment={rescheduleTarget} onClose={() => setRescheduleTarget(null)} onDone={fetchMyAppointments} />
      )}
    </div>
  );
};

export default StudentBooking;
