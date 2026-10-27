import React, { useState, useEffect } from 'react';
import { Calendar, Filter, XCircle, RefreshCw } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import { appointmentService } from '../../services/appointmentService';
import { departmentService } from '../../services/departmentService';

const AppointmentManagementPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedDept) params.departmentId = selectedDept;
      if (selectedStatus) params.status = selectedStatus;
      if (selectedDate) params.date = selectedDate;

      const [apptRes, deptRes] = await Promise.all([
        appointmentService.getAppointments(params),
        departmentService.getDepartments()
      ]);

      if (apptRes.success) setAppointments(apptRes.data);
      if (deptRes.success) setDepartments(deptRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDept, selectedStatus, selectedDate]);

  const handleCancel = async (id) => {
    const reason = window.prompt('Please enter reason for cancellation:');
    if (!reason) return;
    try {
      const res = await appointmentService.cancelAppointment(id, reason);
      if (res.success) {
        setFeedback({ type: 'info', message: 'Appointment cancelled successfully.' });
        fetchData();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Cancellation failed.' });
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Appointment Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Hospital-wide appointment roster, status tracking, and cancellation control
          </p>
        </div>

        <Button size="sm" variant="secondary" icon={RefreshCw} onClick={fetchData}>
          Refresh
        </Button>
      </div>

      {feedback && <Alert type={feedback.type} message={feedback.message} />}

      {/* Filters */}
      <Card style={{ marginBottom: '20px', padding: '16px 20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>Date</label>
            <input
              type="date"
              className="form-input"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ width: '150px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>Department</label>
            <select
              className="form-select"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              style={{ minWidth: '180px' }}
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>Status</label>
            <select
              className="form-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{ minWidth: '150px' }}
            >
              <option value="">All Statuses</option>
              <option value="BOOKED">Booked</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div style={{ paddingTop: '18px' }}>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setSelectedDate('');
                setSelectedDept('');
                setSelectedStatus('');
              }}
            >
              Reset Filters
            </Button>
          </div>
        </div>
      </Card>

      {loading ? (
        <LoadingSpinner text="Loading appointments..." />
      ) : (
        <Card title={`Hospital Appointments (${appointments.length})`}>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Patient Name</th>
                  <th>Department</th>
                  <th>Doctor</th>
                  <th>Token #</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((a) => {
                  const canCancel = ['BOOKED', 'CONFIRMED'].includes(a.status);
                  return (
                    <tr key={a._id}>
                      <td>
                        <strong>{a.appointmentDate}</strong>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {a.appointmentTime}
                        </span>
                      </td>
                      <td>
                        <strong>{a.patientId?.userId?.fullName || 'Walk-in'}</strong>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {a.patientId?.userId?.phone}
                        </span>
                      </td>
                      <td>{a.departmentId?.name}</td>
                      <td>{a.doctorId?.userId?.fullName}</td>
                      <td style={{ fontWeight: 800, color: 'var(--primary)' }}>
                        {a.tokenId?.tokenNumber || '--'}
                      </td>
                      <td>{a.appointmentType}</td>
                      <td><Badge status={a.status} /></td>
                      <td>
                        {canCancel && (
                          <Button
                            size="sm"
                            variant="danger"
                            icon={XCircle}
                            onClick={() => handleCancel(a._id)}
                          >
                            Cancel
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AppointmentManagementPage;
