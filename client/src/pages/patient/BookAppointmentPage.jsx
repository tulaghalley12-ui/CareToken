import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Calendar, Clock, Stethoscope, Building2, CheckCircle2, AlertCircle } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { departmentService } from '../../services/departmentService';
import { doctorService } from '../../services/doctorService';
import { appointmentService } from '../../services/appointmentService';

const BookAppointmentPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);

  const [selectedDept, setSelectedDept] = useState(searchParams.get('departmentId') || '');
  const [selectedDoctor, setSelectedDoctor] = useState(searchParams.get('doctorId') || '');

  // Default to tomorrow or today
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedTime, setSelectedTime] = useState('');
  const [appointmentType, setAppointmentType] = useState('ROUTINE');
  const [reasonForVisit, setReasonForVisit] = useState('');

  const [loadingDepts, setLoadingDepts] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. Fetch departments
  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const res = await departmentService.getDepartments();
        if (res.success) setDepartments(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingDepts(false);
      }
    };
    fetchDepts();
  }, []);

  // 2. Fetch doctors when department changes
  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await doctorService.getDoctors({ departmentId: selectedDept });
        if (res.success) {
          setDoctors(res.data);
          if (res.data.length > 0 && !selectedDoctor) {
            setSelectedDoctor(res.data[0]._id);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    if (selectedDept) {
      fetchDocs();
    } else {
      setDoctors([]);
    }
  }, [selectedDept]);

  // 3. Fetch available slots when doctor and date change
  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedDoctor || !selectedDate) return;
      setLoadingSlots(true);
      setError('');
      try {
        const res = await appointmentService.getAvailableSlots(selectedDoctor, selectedDate);
        if (res.success) {
          setAvailableSlots(res.data.slots || []);
          setSelectedTime('');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load available slots.');
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [selectedDoctor, selectedDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDept || !selectedDoctor || !selectedDate || !selectedTime) {
      setError('Please select department, doctor, appointment date, and a time slot.');
      return;
    }

    setBookingLoading(true);
    setError('');

    try {
      const res = await appointmentService.bookAppointment({
        departmentId: selectedDept,
        doctorId: selectedDoctor,
        appointmentDate: selectedDate,
        appointmentTime: selectedTime,
        appointmentType,
        reasonForVisit
      });

      if (res.success) {
        // Navigate to confirmation page with appointment and token state
        navigate('/appointment-confirmation', {
          state: {
            appointment: res.data.appointment,
            token: res.data.token
          }
        });
      }
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Booking failed. Please try a different slot.'
      );
    } finally {
      setBookingLoading(false);
    }
  };

  const selectedDoctorObj = doctors.find((d) => d._id === selectedDoctor);

  return (
    <div className="page-container" style={{ maxWidth: 860 }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Book a Doctor Consultation
        </h1>
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)' }}>
          Select your specialist, date, and preferred time slot to generate your hospital token
        </p>
      </div>

      <Card>
        {error && <Alert type="error" message={error} />}

        <form onSubmit={handleSubmit}>
          {/* Step 1: Department */}
          <div className="form-group">
            <label className="form-label">1. Medical Department *</label>
            <select
              className="form-select"
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setSelectedDoctor('');
              }}
              required
            >
              <option value="">-- Choose Department --</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name} ({d.departmentCode}) - Daily Limit: {d.dailyTokenLimit}
                </option>
              ))}
            </select>
          </div>

          {/* Step 2: Doctor */}
          <div className="form-group">
            <label className="form-label">2. Doctor / Specialist *</label>
            <select
              className="form-select"
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              disabled={!selectedDept || doctors.length === 0}
              required
            >
              <option value="">-- Choose Specialist --</option>
              {doctors.map((doc) => (
                <option key={doc._id} value={doc._id}>
                  {doc.userId?.fullName} - {doc.specialization} ({doc.roomNumber || 'Room 101'})
                </option>
              ))}
            </select>
            {selectedDept && doctors.length === 0 && (
              <span className="form-help" style={{ color: '#ea580c' }}>
                No active doctors found in this department.
              </span>
            )}
          </div>

          {/* Step 3: Date Picker & Slots */}
          <div className="grid grid-cols-2">
            <div className="form-group">
              <label className="form-label">3. Service Date *</label>
              <input
                type="date"
                className="form-input"
                min={todayStr}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Appointment Type</label>
              <select
                className="form-select"
                value={appointmentType}
                onChange={(e) => setAppointmentType(e.target.value)}
              >
                <option value="ROUTINE">Routine Consultation</option>
                <option value="FIRST_VISIT">First Time Visit</option>
                <option value="FOLLOW_UP">Follow-Up Visit</option>
                <option value="EMERGENCY">Urgent / Priority</option>
              </select>
            </div>
          </div>

          {/* Time Slot Picker */}
          <div className="form-group">
            <label className="form-label">4. Available Time Slots *</label>
            {loadingSlots ? (
              <LoadingSpinner text="Checking doctor schedule & slot availability..." size={20} />
            ) : availableSlots.length === 0 ? (
              <div style={{ padding: '16px', background: '#f8fafc', borderRadius: 'var(--radius-md)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Please select a doctor and date to view available time slots.
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
                  gap: '8px',
                  maxHeight: '220px',
                  overflowY: 'auto',
                  padding: '12px',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  background: '#fafafa'
                }}
              >
                {availableSlots.map((slot) => (
                  <button
                    key={slot.time}
                    type="button"
                    disabled={!slot.isAvailable}
                    onClick={() => setSelectedTime(slot.time)}
                    style={{
                      padding: '8px 4px',
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      borderRadius: '6px',
                      border: selectedTime === slot.time ? '2px solid var(--primary)' : '1px solid var(--border)',
                      backgroundColor: selectedTime === slot.time ? 'var(--primary-light)' : slot.isAvailable ? '#ffffff' : '#f1f5f9',
                      color: selectedTime === slot.time ? 'var(--primary)' : slot.isAvailable ? 'var(--text-primary)' : '#94a3b8',
                      cursor: slot.isAvailable ? 'pointer' : 'not-allowed',
                      textAlign: 'center'
                    }}
                  >
                    {slot.time}
                    {!slot.isAvailable && <span style={{ display: 'block', fontSize: '0.65rem', fontWeight: 500 }}>Booked</span>}
                  </button>
                ))}
              </div>
            )}
            {selectedTime && (
              <div style={{ marginTop: '8px', fontSize: '0.8125rem', color: 'var(--teal)', fontWeight: 600 }}>
                Selected Time Slot: {selectedTime}
              </div>
            )}
          </div>

          {/* Reason for visit */}
          <div className="form-group">
            <label className="form-label">Reason for Visit / Symptoms (Optional)</label>
            <textarea
              rows={2}
              className="form-textarea"
              placeholder="Brief description of symptoms or consultation goal..."
              value={reasonForVisit}
              onChange={(e) => setReasonForVisit(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            variant="teal"
            size="lg"
            loading={bookingLoading}
            disabled={!selectedTime}
            icon={Calendar}
            style={{ width: '100%', marginTop: '16px' }}
          >
            Confirm Booking & Generate Token
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default BookAppointmentPage;
