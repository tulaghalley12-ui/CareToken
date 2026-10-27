import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Calendar, Search, UserCheck, Ticket, Printer } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PrintReceiptModal from '../../components/common/PrintReceiptModal';
import { patientService } from '../../services/patientService';
import { departmentService } from '../../services/departmentService';
import { doctorService } from '../../services/doctorService';
import { appointmentService } from '../../services/appointmentService';

const ReceptionistBookingPage = () => {
  const [searchParams] = useSearchParams();
  const preselectedPatientId = searchParams.get('patientId') || '';

  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);

  const [selectedDept, setSelectedDept] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedTime, setSelectedTime] = useState('');
  const [priority, setPriority] = useState(false);
  const [reason, setReason] = useState('');

  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [generatedToken, setGeneratedToken] = useState(null);
  const [printOpen, setPrintOpen] = useState(false);

  // Load departments
  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const res = await departmentService.getDepartments();
        if (res.success) setDepartments(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDepts();
  }, []);

  // If patientId passed in URL, load that patient
  useEffect(() => {
    if (preselectedPatientId) {
      patientService.getPatientById(preselectedPatientId).then((res) => {
        if (res.success) setSelectedPatient(res.data);
      });
    }
  }, [preselectedPatientId]);

  // Search patients
  const handleSearchPatients = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const res = await patientService.getPatients(searchQuery.trim());
      if (res.success) setPatients(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // When department changes, load doctors
  useEffect(() => {
    if (selectedDept) {
      doctorService.getDoctors({ departmentId: selectedDept }).then((res) => {
        if (res.success) {
          setDoctors(res.data);
          setSelectedDoctor('');
        }
      });
    } else {
      setDoctors([]);
    }
  }, [selectedDept]);

  // Load available slots
  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      appointmentService.getAvailableSlots(selectedDoctor, selectedDate).then((res) => {
        if (res.success) {
          setAvailableSlots(res.data.slots || []);
          setSelectedTime('');
        }
      });
    }
  }, [selectedDoctor, selectedDate]);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!selectedPatient || !selectedDept || !selectedDoctor || !selectedDate || !selectedTime) {
      setFeedback({ type: 'error', message: 'Please select a patient, doctor, date, and slot.' });
      return;
    }

    setBookingLoading(true);
    setFeedback(null);

    try {
      const res = await appointmentService.bookAppointment({
        patientId: selectedPatient._id,
        departmentId: selectedDept,
        doctorId: selectedDoctor,
        appointmentDate: selectedDate,
        appointmentTime: selectedTime,
        priority,
        reasonForVisit: reason
      });

      if (res.success) {
        setFeedback({
          type: 'success',
          message: `Booking successful! Token Generated: ${res.data.token?.tokenNumber}`
        });
        setGeneratedToken(res.data.token);
        setPrintOpen(true);
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Booking failed.'
      });
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 860 }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Receptionist Appointment Booking</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Schedule appointments and issue digital tokens on behalf of patients
        </p>
      </div>

      {feedback && <Alert type={feedback.type} message={feedback.message} />}

      {/* Patient Picker Card */}
      <Card title="1. Select Patient" style={{ marginBottom: '20px' }}>
        {selectedPatient ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--primary-light)', borderRadius: 'var(--radius-md)' }}>
            <div>
              <strong style={{ fontSize: '1rem', color: 'var(--primary-dark)' }}>
                {selectedPatient.userId?.fullName || selectedPatient.fullName}
              </strong>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                ID: {selectedPatient.patientNumber} &bull; Phone: {selectedPatient.userId?.phone || selectedPatient.phone}
              </div>
            </div>
            <Button size="sm" variant="secondary" onClick={() => setSelectedPatient(null)}>
              Change Patient
            </Button>
          </div>
        ) : (
          <div>
            <form onSubmit={handleSearchPatients} style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search by patient name, phone, or ID (e.g. PAT-10001)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button type="submit" variant="primary" icon={Search} loading={loading}>
                Search
              </Button>
            </form>

            {patients.length > 0 && (
              <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                {patients.map((p) => (
                  <div
                    key={p._id}
                    onClick={() => setSelectedPatient(p)}
                    style={{
                      padding: '10px 14px',
                      borderBottom: '1px solid var(--border)',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div>
                      <strong>{p.userId?.fullName}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '10px' }}>
                        {p.patientNumber} &bull; {p.userId?.phone}
                      </span>
                    </div>
                    <Button size="sm" variant="secondary">Select</Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Booking Form Card */}
      <Card title="2. Consultation Details & Token Issuance">
        <form onSubmit={handleBook}>
          <div className="grid grid-cols-2">
            <div className="form-group">
              <label className="form-label">Department *</label>
              <select
                className="form-select"
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                required
              >
                <option value="">-- Choose Department --</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} ({d.departmentCode})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Doctor *</label>
              <select
                className="form-select"
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                disabled={!selectedDept || doctors.length === 0}
                required
              >
                <option value="">-- Choose Doctor --</option>
                {doctors.map((doc) => (
                  <option key={doc._id} value={doc._id}>
                    {doc.userId?.fullName} ({doc.roomNumber || 'Room 101'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2">
            <div className="form-group">
              <label className="form-label">Date *</label>
              <input
                type="date"
                className="form-input"
                min={todayStr}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '28px' }}>
              <input
                type="checkbox"
                id="priorityCheck"
                checked={priority}
                onChange={(e) => setPriority(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label htmlFor="priorityCheck" style={{ fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', color: '#b91c1c' }}>
                Flag as High Priority / Urgent
              </label>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Time Slot *</label>
            {availableSlots.length === 0 ? (
              <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '6px', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Select doctor and date to see available slots.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(85px, 1fr))', gap: '8px', maxHeight: '160px', overflowY: 'auto' }}>
                {availableSlots.map((s) => (
                  <button
                    key={s.time}
                    type="button"
                    disabled={!s.isAvailable}
                    onClick={() => setSelectedTime(s.time)}
                    style={{
                      padding: '8px 4px',
                      borderRadius: '6px',
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      border: selectedTime === s.time ? '2px solid var(--primary)' : '1px solid var(--border)',
                      backgroundColor: selectedTime === s.time ? 'var(--primary-light)' : s.isAvailable ? '#fff' : '#f1f5f9',
                      color: selectedTime === s.time ? 'var(--primary)' : s.isAvailable ? 'var(--text-primary)' : '#94a3b8',
                      cursor: s.isAvailable ? 'pointer' : 'not-allowed'
                    }}
                  >
                    {s.time}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Notes / Reason for Visit</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Walk-in headache evaluation"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
            <Button
              type="submit"
              variant="teal"
              size="lg"
              loading={bookingLoading}
              disabled={!selectedPatient || !selectedTime}
              icon={Ticket}
            >
              Confirm & Generate Token
            </Button>
          </div>
        </form>
      </Card>

      <PrintReceiptModal
        isOpen={printOpen}
        onClose={() => setPrintOpen(false)}
        token={generatedToken}
      />
    </div>
  );
};

export default ReceptionistBookingPage;
