import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Search, Calendar as CalendarIcon, Clock, User as UserIcon } from 'lucide-react';

const StudentBooking = () => {
  const { user } = useContext(AuthContext);
  const [faculties, setFaculties] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [availabilities, setAvailabilities] = useState([]);
  const [myAppointments, setMyAppointments] = useState([]);
  const [bookingDate, setBookingDate] = useState('');
  const [loading, setLoading] = useState(false);

  // For this demo, let's fetch all availabilities and group by faculty,
  // or fetch a list of faculty users.
  // We'll just fetch all availabilities and derive faculty list from it.
  const fetchAllAvailabilities = async () => {
    try {
      // Empty facultyId gets all
      const res = await axios.get('http://localhost:5000/api/availability', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      const allAvailabilities = res.data;
      
      // Extract unique faculties
      const uniqueFacultiesMap = new Map();
      allAvailabilities.forEach(avail => {
        if (avail.facultyId) {
          uniqueFacultiesMap.set(avail.facultyId._id, avail.facultyId);
        }
      });
      
      setFaculties(Array.from(uniqueFacultiesMap.values()));
      
      // If a faculty is selected, filter their availabilities
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
    
    // Check if the selected date matches the dayOfWeek of the slot
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
      <div className="lg:col-span-2 flex flex-col gap-6">
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Search size={20} className="text-primary" /> 
            Find Faculty
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {faculties.map(faculty => (
              <div 
                key={faculty._id}
                onClick={() => setSelectedFaculty(faculty)}
                className={`p-4 border rounded-xl cursor-pointer transition ${selectedFaculty?._id === faculty._id ? 'border-primary bg-primary-light shadow-md' : 'border-border bg-surface hover:border-primary-light'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${selectedFaculty?._id === faculty._id ? 'bg-primary text-white' : 'bg-gray-100 text-text-muted'}`}>
                    <UserIcon size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{faculty.name}</h3>
                    <p className="text-xs text-text-muted">Faculty</p>
                  </div>
                </div>
              </div>
            ))}
            {faculties.length === 0 && (
              <p className="text-text-muted col-span-3 text-sm">No faculty available at the moment.</p>
            )}
          </div>

          {selectedFaculty && (
            <div className="mt-8 pt-8 border-t border-border animate-fade-in">
              <h3 className="text-lg font-bold mb-4">Book with {selectedFaculty.name}</h3>
              
              <div className="mb-6">
                <label className="label">Select Date</label>
                <input 
                  type="date" 
                  className="input-field max-w-xs"
                  value={bookingDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setBookingDate(e.target.value)}
                />
              </div>

              {bookingDate && (
                <div>
                  <label className="label mb-3">Available Slots</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {availabilities.map(slot => (
                      <div key={slot._id} className="p-4 border rounded-lg flex flex-col gap-3 hover:border-primary-light transition bg-surface">
                        <div className="flex justify-between items-start">
                          <div className="flex flex-col">
                            <span className="font-semibold text-primary">{slot.dayOfWeek}</span>
                            <span className="text-text-muted text-sm">{slot.startTime} - {slot.endTime}</span>
                          </div>
                          <Clock size={18} className="text-text-muted" />
                        </div>
                        <button 
                          onClick={() => handleBook(slot)}
                          disabled={loading}
                          className="btn btn-primary w-full py-2 text-sm mt-1"
                        >
                          Book Slot
                        </button>
                      </div>
                    ))}
                    {availabilities.length === 0 && (
                      <p className="text-text-muted text-sm col-span-2">No slots available for this faculty.</p>
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
        <div className="glass-card p-6 h-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-primary text-white p-2 rounded-lg">
              <CalendarIcon size={20} />
            </div>
            <h2 className="text-xl font-bold">My Bookings</h2>
          </div>

          <div className="flex flex-col gap-4">
            {myAppointments.map(appt => (
              <div key={appt._id} className="p-4 border border-border rounded-xl bg-surface relative overflow-hidden group">
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${appt.status === 'pending' ? 'bg-warning' : appt.status === 'confirmed' ? 'bg-secondary' : 'bg-danger'}`}></div>
                
                <div className="flex justify-between items-start mb-2 pl-2">
                  <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-full ${appt.status === 'pending' ? 'bg-orange-100 text-orange-800' : appt.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                    {appt.status}
                  </span>
                </div>
                
                <div className="pl-2">
                  <h3 className="font-bold">{appt.facultyId?.name || 'Faculty'}</h3>
                  <p className="text-sm text-text-muted mt-1 flex items-center gap-2">
                    <CalendarIcon size={14} /> {new Date(appt.date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-text-muted mt-1 flex items-center gap-2">
                    <Clock size={14} /> {appt.startTime} - {appt.endTime}
                  </p>
                </div>
              </div>
            ))}
            
            {myAppointments.length === 0 && (
              <div className="text-center py-8">
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
