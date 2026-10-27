import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Stethoscope, Calendar, Clock, MapPin, Award, CheckCircle, ArrowLeft } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { doctorService } from '../../services/doctorService';

const DoctorProfilePage = () => {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const [docRes, schedRes] = await Promise.all([
          doctorService.getDoctorById(id),
          doctorService.getDoctorSchedule(id)
        ]);
        if (docRes.success) setDoctor(docRes.data);
        if (schedRes.success) setSchedules(schedRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, [id]);

  if (loading) return <LoadingSpinner text="Loading doctor profile..." />;
  if (!doctor) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h2>Doctor not found</h2>
        <Link to="/doctors"><Button style={{ marginTop: '16px' }}>Back to Directory</Button></Link>
      </div>
    );
  }

  return (
    <div className="page-container">
      <Link to="/doctors" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '20px', fontWeight: 600 }}>
        <ArrowLeft size={16} /> Back to Doctors Directory
      </Link>

      <div className="grid grid-cols-3" style={{ gap: '30px' }}>
        <div style={{ gridColumn: 'span 2' }}>
          <Card>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '2rem'
                }}
              >
                {doctor.userId?.fullName?.charAt(0) || 'D'}
              </div>
              <div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{doctor.userId?.fullName}</h1>
                <span style={{ fontSize: '1rem', color: 'var(--teal)', fontWeight: 700 }}>
                  {doctor.specialization}
                </span>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {doctor.qualifications} &bull; {doctor.departmentId?.name}
                </p>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '10px' }}>About the Doctor</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', fontSize: '0.9375rem' }}>
                {doctor.bio || `${doctor.userId?.fullName} is a certified specialist at CareToken Hospital with extensive diagnostic and outpatient consultation experience.`}
              </p>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '14px' }}>Weekly Working Schedule</h3>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Day of Week</th>
                      <th>Clinic Hours</th>
                      <th>Slot Duration</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedules.length === 0 ? (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                          Monday to Friday, 09:00 - 17:00 (Standard Hospital Clinic Hours)
                        </td>
                      </tr>
                    ) : (
                      schedules.map((s) => (
                        <tr key={s._id}>
                          <td style={{ fontWeight: 600 }}>{daysOfWeek[s.dayOfWeek]}</td>
                          <td>{s.startTime} - {s.endTime}</td>
                          <td>{s.slotDurationMinutes} mins</td>
                          <td>
                            <span style={{ color: s.isActive ? 'var(--teal)' : '#dc2626', fontWeight: 700, fontSize: '0.75rem' }}>
                              {s.isActive ? 'PRACTICING' : 'OFF DUTY'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar Consultation Booking Card */}
        <div>
          <Card title="Appointment Summary">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Clock size={18} style={{ color: 'var(--primary)' }} />
                <span>Consultation: <strong>{doctor.consultationDurationMinutes} mins</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <MapPin size={18} style={{ color: 'var(--primary)' }} />
                <span>Location: <strong>{doctor.roomNumber || 'Room 101'}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Award size={18} style={{ color: 'var(--teal)' }} />
                <span>Verified License & Active Practitioner</span>
              </div>
            </div>

            <Link to={`/book?doctorId=${doctor._id}&departmentId=${doctor.departmentId?._id}`}>
              <Button size="lg" variant="primary" icon={Calendar} style={{ width: '100%' }}>
                Book Appointment
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfilePage;
