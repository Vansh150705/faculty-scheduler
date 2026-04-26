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
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-primary-light text-primary p-2 rounded-lg">
              <Clock size={24} />
            </div>
            <h2 className="text-xl font-bold">Set Availability</h2>
          </div>
          
          <form onSubmit={handleAddAvailability} className="flex flex-col gap-4">
            <div>
              <label className="label">Day of Week</label>
              <select 
                className="input-field" 
                value={dayOfWeek} 
                onChange={(e) => setDayOfWeek(e.target.value)}
              >
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
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
            <button type="submit" disabled={loading} className="btn btn-primary w-full mt-2">
              <Plus size={18} />
              {loading ? 'Adding...' : 'Add Time Slot'}
            </button>
          </form>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-4">Your Time Slots</h2>
          {availabilities.length === 0 ? (
            <p className="text-text-muted text-sm">No availabilities set yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {availabilities.map(slot => (
                <div key={slot._id} className="flex justify-between items-center p-3 border border-border rounded-lg bg-background hover:border-primary transition">
                  <div>
                    <p className="font-semibold">{slot.dayOfWeek}</p>
                    <p className="text-sm text-text-muted">{slot.startTime} - {slot.endTime}</p>
                  </div>
                  <button 
                    onClick={() => handleDeleteAvailability(slot._id)}
                    className="text-text-muted hover:text-danger transition p-2 bg-white rounded-full shadow-sm hover:shadow"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Appointment Requests */}
      <div className="lg:col-span-2">
        <div className="glass-card p-6 h-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-secondary text-white p-2 rounded-lg">
              <CalendarIcon size={24} />
            </div>
            <h2 className="text-xl font-bold">Appointment Requests</h2>
          </div>

          {appointments.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-4">
                <CalendarIcon size={32} />
              </div>
              <h3 className="text-lg font-medium text-text-main">No appointments yet</h3>
              <p className="text-text-muted mt-1">When students book appointments, they will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {appointments.map(appt => (
                <div key={appt._id} className={`p-4 border rounded-xl transition ${appt.status === 'pending' ? 'border-warning bg-orange-50' : appt.status === 'confirmed' ? 'border-secondary bg-emerald-50' : 'border-danger bg-red-50'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-full ${appt.status === 'pending' ? 'bg-orange-200 text-orange-800' : appt.status === 'confirmed' ? 'bg-emerald-200 text-emerald-800' : 'bg-red-200 text-red-800'}`}>
                      {appt.status}
                    </span>
                    <span className="text-xs text-text-muted font-medium">{new Date(appt.date).toLocaleDateString()}</span>
                  </div>
                  <h3 className="font-bold text-lg">{appt.studentId?.name || 'Unknown Student'}</h3>
                  <p className="text-sm text-text-muted mb-4">{appt.startTime} - {appt.endTime}</p>
                  
                  {appt.status === 'pending' && (
                    <div className="flex gap-2 mt-4">
                      <button 
                        onClick={() => handleUpdateStatus(appt._id, 'confirmed')}
                        className="flex-1 btn btn-primary bg-secondary hover:bg-secondary-hover flex justify-center items-center gap-1 py-2"
                      >
                        <CheckCircle size={16} /> Confirm
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(appt._id, 'cancelled')}
                        className="flex-1 btn btn-secondary text-danger border-danger hover:bg-danger hover:text-white flex justify-center items-center gap-1 py-2"
                      >
                        <XCircle size={16} /> Cancel
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
