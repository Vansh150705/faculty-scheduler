import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Clock, Plus, Trash2, Calendar as CalendarIcon, CheckCircle, XCircle } from 'lucide-react';

const FacultyScheduler = () => {
  const { user } = useContext(AuthContext);
  const [availabilities, setAvailabilities] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [dayOfWeek, setDayOfWeek] = useState('Monday');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchAvailabilities = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/availability/${user.id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setAvailabilities(res.data);
    } catch (error) {
      console.error('Error fetching availabilities', error);
    }
  };

  const fetchAppointments = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/appointments', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setAppointments(res.data);
    } catch (error) {
      console.error('Error fetching appointments', error);
    }
  };

  useEffect(() => {
    fetchAvailabilities();
    fetchAppointments();
  }, []);

  const handleAddAvailability = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/availability', 
        { dayOfWeek, startTime, endTime },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setStartTime('');
      setEndTime('');
      fetchAvailabilities();
    } catch (error) {
      console.error('Error adding availability', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAvailability = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/availability/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      fetchAvailabilities();
    } catch (error) {
      console.error('Error deleting availability', error);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/appointments/${id}/status`, 
        { status },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      fetchAppointments();
    } catch (error) {
      console.error('Error updating status', error);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Availability Management */}
      <div className="lg:col-span-1 flex flex-col gap-8">
        <div className="glass-card p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary-light text-primary shadow-sm">
              <Clock size={24} />
            </div>
            <h2 className="text-2xl font-bold m-0">Set Availability</h2>
          </div>
          
          <form onSubmit={handleAddAvailability} className="flex flex-col gap-5">
            <div>
              <label className="label">Day of Week</label>
              <div className="relative">
                <select 
                  className="input-field appearance-none cursor-pointer" 
                  value={dayOfWeek} 
                  onChange={(e) => setDayOfWeek(e.target.value)}
                >
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Start Time</label>
                <input 
                  type="time" 
                  required 
                  className="input-field" 
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div>
                <label className="label">End Time</label>
                <input 
                  type="time" 
                  required 
                  className="input-field" 
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary w-full mt-4 py-3">
              <Plus size={18} />
              {loading ? 'Adding...' : 'Add Time Slot'}
            </button>
          </form>
        </div>

        <div className="glass-card p-8">
          <h2 className="text-xl font-bold mb-6">Your Time Slots</h2>
          {availabilities.length === 0 ? (
            <div className="text-center py-8 bg-surface-hover rounded-xl border border-dashed border-border">
              <p className="text-text-muted text-sm font-medium">No availabilities set yet.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {availabilities.map((slot, index) => (
                <div key={slot._id} className="flex justify-between items-center p-4 border border-border rounded-xl bg-surface hover:shadow-md hover:border-primary-light transition-all duration-300 animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                  <div>
                    <p className="font-bold text-text-main">{slot.dayOfWeek}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock size={12} className="text-primary" />
                      <p className="text-sm font-medium text-text-muted">{slot.startTime} - {slot.endTime}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDeleteAvailability(slot._id)}
                    className="btn-icon text-text-muted hover:text-danger hover:bg-red-50"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Appointment Requests */}
      <div className="lg:col-span-2">
        <div className="glass-card p-8 h-full">
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-secondary text-white shadow-sm">
              <CalendarIcon size={24} />
            </div>
            <h2 className="text-2xl font-bold m-0">Appointment Requests</h2>
          </div>

          {appointments.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-border rounded-2xl bg-surface-hover">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white text-gray-300 shadow-sm mb-6">
                <CalendarIcon size={40} />
              </div>
              <h3 className="text-xl font-bold text-text-main">No appointments yet</h3>
              <p className="text-text-muted mt-2 max-w-sm mx-auto">When students book appointments with you, they will appear right here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {appointments.map((appt, index) => (
                <div key={appt._id} className={`p-6 border rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg animate-slide-up bg-surface ${appt.status === 'pending' ? 'border-warning/30 hover:border-warning' : appt.status === 'confirmed' ? 'border-secondary/30 hover:border-secondary' : 'border-danger/30 hover:border-danger'}`} style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="flex justify-between items-start mb-4">
                    <span className={`badge ${appt.status === 'pending' ? 'badge-warning' : appt.status === 'confirmed' ? 'badge-success' : 'bg-red-100 text-red-700'}`}>
                      {appt.status}
                    </span>
                    <span className="text-xs font-bold text-text-light bg-border-light px-2 py-1 rounded-md">{new Date(appt.date).toLocaleDateString()}</span>
                  </div>
                  <h3 className="font-extrabold text-xl mb-1 text-text-main">{appt.studentId?.name || 'Unknown Student'}</h3>
                  <div className="flex items-center gap-2 mb-6">
                    <Clock size={14} className="text-text-light" />
                    <p className="text-sm font-medium text-text-muted">{appt.startTime} - {appt.endTime}</p>
                  </div>
                  
                  {appt.status === 'pending' && (
                    <div className="flex gap-3 mt-4 pt-4 border-t border-border-light">
                      <button 
                        onClick={() => handleUpdateStatus(appt._id, 'confirmed')}
                        className="flex-1 btn py-2 px-0 bg-secondary hover:bg-secondary-hover text-white flex justify-center items-center gap-2 shadow-sm hover:shadow"
                      >
                        <CheckCircle size={18} /> Confirm
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(appt._id, 'cancelled')}
                        className="flex-1 btn btn-secondary text-danger hover:bg-danger hover:text-white hover:border-danger flex justify-center items-center gap-2 shadow-sm hover:shadow"
                      >
                        <XCircle size={18} /> Cancel
                      </button>
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
