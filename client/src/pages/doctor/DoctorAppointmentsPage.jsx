import React, { useState, useEffect } from 'react';
import { Calendar, Filter, RefreshCw, User, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { doctorService } from '../../services/doctorService';

const DoctorAppointmentsPage = () => {
  const { user } = useAuth();
  const todayStr = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState(todayStr);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    if (!user?.doctor?._id) return;
    setLoading(true);
    try {
      const res = await doctorService.getDoctorAppointments(user.doctor._id, { date });
      if (res.success) {
        setAppointments(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [date, user?.doctor?._id]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Assigned Appointments</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Scheduled patient consultations for doctor: {user?.fullName}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="date"
            className="form-input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ width: '160px' }}
          />
          <Button size="sm" variant="secondary" icon={RefreshCw} onClick={fetchAppointments}>
            Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading appointment bookings..." />
      ) : appointments.length === 0 ? (
        <EmptyState
          title={`No Appointments on ${date}`}
          description="There are no patient bookings scheduled for this date."
        />
      ) : (
        <Card title={`Bookings for ${date} (${appointments.length})`}>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Patient Name</th>
                  <th>Phone</th>
                  <th>Token #</th>
                  <th>Type</th>
                  <th>Reason</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((a) => (
                  <tr key={a._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
                        <Clock size={14} style={{ color: 'var(--primary)' }} />
                        {a.appointmentTime}
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{a.patientId?.userId?.fullName || 'Walk-in'}</td>
                    <td>{a.patientId?.userId?.phone || '--'}</td>
                    <td style={{ fontWeight: 800, color: 'var(--primary)' }}>
                      {a.tokenId?.tokenNumber || '--'}
                    </td>
                    <td>{a.appointmentType}</td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      {a.reasonForVisit || 'General Consultation'}
                    </td>
                    <td><Badge status={a.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default DoctorAppointmentsPage;
