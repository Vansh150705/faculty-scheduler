import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Search, Calendar as CalendarIcon, Clock, User as UserIcon, CalendarDays } from 'lucide-react';

const StudentBooking = () => {
  const { user } = useContext(AuthContext);
  const [faculties, setFaculties] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [availabilities, setAvailabilities] = useState([]);
  const [myAppointments, setMyAppointments] = useState([]);
  const [bookingDate, setBookingDate] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchAllAvailabilities = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/availability', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      const allAvailabilities = res.data;
      
      const uniqueFacultiesMap = new Map();
      allAvailabilities.forEach(avail => {
        if (avail.facultyId) {
          uniqueFacultiesMap.set(avail.facultyId._id, avail.facultyId);
        }
      });
      
      setFaculties(Array.from(uniqueFacultiesMap.values()));
      
      if (selectedFaculty) {
        setAvailabilities(allAvailabilities.filter(a => a.facultyId._id === selectedFaculty._id));
      }
    } catch (error) {
      console.error('Error fetching data', error);
    }
  };

  const fetchMyAppointments = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/appointments', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setMyAppointments(res.data);
    } catch (error) {
      console.error('Error fetching appointments', error);
    }
  };

  useEffect(() => {
    fetchAllAvailabilities();
    fetchMyAppointments();
  }, [selectedFaculty]);

  const handleBook = async (slot) => {
    if (!bookingDate) {
      alert("Please select a date first");
      return;
    }
    
    const dateObj = new Date(bookingDate);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const selectedDayName = dayNames[dateObj.getDay()];
    
    if (selectedDayName !== slot.dayOfWeek) {
      alert(`Please select a ${slot.dayOfWeek} for this time slot.`);
      return;
    }

    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/appointments', {
        facultyId: slot.facultyId._id,
        date: bookingDate,
        startTime: slot.startTime,
        endTime: slot.endTime
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      alert('Appointment booked successfully!');
      fetchMyAppointments();
      setBookingDate('');
    } catch (error) {
      console.error('Error booking appointment', error);
      alert('Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Booking Interface */}
      <div className="lg:col-span-2 flex flex-col gap-8">
        <div className="glass-card p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary-light text-primary shadow-sm">
              <Search size={24} />
            </div>
            <h2 className="text-2xl font-bold m-0">Find Faculty</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {faculties.map((faculty, index) => (
              <div 
                key={faculty._id}
                onClick={() => setSelectedFaculty(faculty)}
                className={`p-5 rounded-2xl cursor-pointer transition-all duration-300 animate-slide-up border-2 ${selectedFaculty?._id === faculty._id ? 'border-primary bg-primary-light shadow-md transform -translate-y-1' : 'border-border bg-surface hover:border-primary-light hover:shadow-sm'}`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-4">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${selectedFaculty?._id === faculty._id ? 'bg-primary text-white shadow-sm' : 'bg-surface-hover border border-border text-text-muted'}`}>
                    <UserIcon size={20} />
                  </div>
                  <div>
                    <h3 className={`font-bold text-sm ${selectedFaculty?._id === faculty._id ? 'text-primary' : 'text-text-main'}`}>{faculty.name}</h3>
                    <p className={`text-xs ${selectedFaculty?._id === faculty._id ? 'text-primary opacity-80' : 'text-text-muted'}`}>Faculty</p>
                  </div>
                </div>
              </div>
            ))}
            {faculties.length === 0 && (
              <div className="col-span-3 text-center py-10 border-2 border-dashed border-border rounded-xl bg-surface-hover">
                <p className="text-text-muted text-sm font-medium">No faculty available at the moment.</p>
              </div>
            )}
          </div>

          {selectedFaculty && (
            <div className="mt-10 pt-10 border-t border-border animate-slide-up">
              <h3 className="text-xl font-bold mb-6 text-text-main">Book an appointment with {selectedFaculty.name}</h3>
              
              <div className="mb-8 p-6 bg-surface-hover rounded-xl border border-border-light">
                <label className="label text-primary">1. Select Date</label>
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
                  <label className="label text-primary mb-4">2. Select Available Slot</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {availabilities.map((slot, index) => (
                      <div key={slot._id} className="p-5 border border-border rounded-xl flex flex-col gap-4 hover:border-primary-light hover:shadow-md transition-all duration-300 bg-surface" style={{ animationDelay: `${index * 50}ms` }}>
                        <div className="flex justify-between items-start">
                          <div className="flex flex-col">
                            <span className="font-bold text-text-main">{slot.dayOfWeek}</span>
                            <div className="flex items-center gap-2 mt-1">
                              <Clock size={14} className="text-primary" />
                              <span className="text-text-muted text-sm font-medium">{slot.startTime} - {slot.endTime}</span>
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleBook(slot)}
                          disabled={loading}
                          className="btn btn-primary w-full py-2.5 text-sm font-bold shadow-sm"
                        >
                          Book This Slot
                        </button>
                      </div>
                    ))}
                    {availabilities.length === 0 && (
                      <div className="col-span-2 text-center py-8 border-2 border-dashed border-border rounded-xl bg-surface-hover">
                        <p className="text-text-muted text-sm font-medium">No slots available for this faculty.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* My Appointments */}
      <div className="lg:col-span-1">
        <div className="glass-card p-8 h-full">
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-secondary text-white shadow-sm">
              <CalendarIcon size={24} />
            </div>
            <h2 className="text-2xl font-bold m-0">My Bookings</h2>
          </div>

          <div className="flex flex-col gap-4">
            {myAppointments.map((appt, index) => (
              <div key={appt._id} className="p-5 border border-border rounded-2xl bg-surface relative overflow-hidden group hover:shadow-md transition-all duration-300 animate-slide-up hover:-translate-y-1" style={{ animationDelay: `${index * 100}ms` }}>
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${appt.status === 'pending' ? 'bg-warning' : appt.status === 'confirmed' ? 'bg-secondary' : 'bg-danger'}`}></div>
                
                <div className="flex justify-between items-start mb-3 pl-2">
                  <span className={`badge ${appt.status === 'pending' ? 'badge-warning' : appt.status === 'confirmed' ? 'badge-success' : 'bg-red-100 text-red-700'}`}>
                    {appt.status}
                  </span>
                </div>
                
                <div className="pl-2">
                  <h3 className="font-bold text-lg mb-2 text-text-main">{appt.facultyId?.name || 'Faculty'}</h3>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-text-muted flex items-center gap-2">
                      <CalendarDays size={16} className="text-text-light" /> {new Date(appt.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                    <p className="text-sm font-medium text-text-muted flex items-center gap-2">
                      <Clock size={16} className="text-text-light" /> {appt.startTime} - {appt.endTime}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {myAppointments.length === 0 && (
              <div className="text-center py-16 border-2 border-dashed border-border rounded-2xl bg-surface-hover">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white text-gray-300 shadow-sm mb-4">
                  <CalendarDays size={32} />
                </div>
                <p className="text-text-main font-bold mb-1">No upcoming bookings</p>
                <p className="text-text-muted text-sm">You haven't booked any appointments yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentBooking;
