import React, { useState, useEffect } from 'react';
import { Calendar, X, AlertCircle } from 'lucide-react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import { appointmentService } from '../../services/appointmentService';

const AppointmentHistoryPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const fetchAppointments = async () => {
    try {
      const res = await appointmentService.getAppointments();
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
  }, []);

  const handleCancelClick = (appt) => {
    setSelectedAppt(appt);
    setCancelReason('');
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async (e) => {
    e.preventDefault();
    if (!selectedAppt) return;
    setCancelLoading(true);
    try {
      const res = await appointmentService.cancelAppointment(selectedAppt._id, cancelReason);
      if (res.success) {
        setFeedback({ type: 'success', message: 'Appointment cancelled successfully.' });
        setCancelModalOpen(false);
        fetchAppointments();
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to cancel appointment.'
      });
    } finally {
      setCancelLoading(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading appointment history..." />;

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Appointment History</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          View all scheduled, completed, and cancelled consultations
        </p>
      </div>

      {feedback && (
        <Alert
          type={feedback.type}
          message={feedback.message}
          style={{ marginBottom: '20px' }}
        />
      )}

      {appointments.length === 0 ? (
        <EmptyState
          title="No Appointments Found"
          description="You haven't booked any appointments yet."
        />
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Department</th>
                <th>Doctor</th>
                <th>Token #</th>
                <th>Type</th>
                <th>Status</th>
                <th>Action</th>
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
                    <td>{a.departmentId?.name}</td>
                    <td>{a.doctorId?.userId?.fullName}</td>
                    <td style={{ fontWeight: 800, color: 'var(--primary)' }}>
                      {a.tokenId?.tokenNumber || '--'}
                    </td>
                    <td>{a.appointmentType}</td>
                    <td><Badge status={a.status} /></td>
                    <td>
                      {canCancel ? (
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleCancelClick(a)}
                        >
                          Cancel
                        </Button>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Locked
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Cancellation Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Appointment"
      >
        <form onSubmit={handleConfirmCancel}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Are you sure you want to cancel your appointment on{' '}
            <strong>{selectedAppt?.appointmentDate} at {selectedAppt?.appointmentTime}</strong>?
            Any active token associated with this booking will be cancelled.
          </p>
          <div className="form-group">
            <label className="form-label">Reason for Cancellation</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Rescheduling or resolved symptom"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              required
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Button variant="secondary" onClick={() => setCancelModalOpen(false)}>
              Keep Booking
            </Button>
            <Button type="submit" variant="danger" loading={cancelLoading}>
              Confirm Cancellation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AppointmentHistoryPage;
