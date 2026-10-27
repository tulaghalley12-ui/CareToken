import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  CalendarCheck,
  Play,
  CheckCircle,
  SkipForward,
  RotateCcw,
  Stethoscope,
  Volume2,
  Clock,
  RefreshCw
} from 'lucide-react';
import Card from '../../components/common/Card';
import StatCard from '../../components/common/StatCard';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import { dashboardService } from '../../services/dashboardService';
import { tokenService } from '../../services/tokenService';
import { useSocket } from '../../context/SocketContext';

const DoctorDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [completeNotesModal, setCompleteNotesModal] = useState(false);
  const [consultationNotes, setConsultationNotes] = useState('');

  const { lastQueueEvent, joinDoctor, leaveDoctor } = useSocket();

  const fetchDashboard = async () => {
    try {
      const res = await dashboardService.getDoctorDashboard();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    if (data?.doctor?._id) {
      joinDoctor(data.doctor._id);
      return () => leaveDoctor(data.doctor._id);
    }
  }, [data?.doctor?._id]);

  useEffect(() => {
    if (lastQueueEvent) {
      fetchDashboard();
    }
  }, [lastQueueEvent]);

  // Actions
  const handleCallToken = async (tokenId) => {
    setActionLoading(true);
    setFeedback(null);
    try {
      const res = await tokenService.callToken(tokenId);
      if (res.success) {
        setFeedback({ type: 'success', message: res.message });
        fetchDashboard();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Call failed' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartConsultation = async (tokenId) => {
    setActionLoading(true);
    setFeedback(null);
    try {
      const res = await tokenService.startConsultation(tokenId);
      if (res.success) {
        setFeedback({ type: 'success', message: res.message });
        fetchDashboard();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to start consultation' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteConsultation = async (e) => {
    e.preventDefault();
    if (!data?.currentConsultation?._id) return;
    setActionLoading(true);
    setFeedback(null);
    try {
      const res = await tokenService.completeToken(data.currentConsultation._id, consultationNotes);
      if (res.success) {
        setFeedback({ type: 'success', message: res.message });
        setCompleteNotesModal(false);
        setConsultationNotes('');
        fetchDashboard();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to complete consultation' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSkipToken = async (tokenId) => {
    setActionLoading(true);
    setFeedback(null);
    try {
      const res = await tokenService.skipToken(tokenId, 'Skipped by doctor');
      if (res.success) {
        setFeedback({ type: 'info', message: res.message });
        fetchDashboard();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to skip token' });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading doctor console..." />;

  const doctor = data?.doctor;
  const metrics = data?.metrics || {};
  const currentlyCalled = data?.currentlyCalled;
  const currentConsultation = data?.currentConsultation;
  const nextEligible = data?.nextEligible;
  const waitingQueue = data?.waitingQueue || [];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
            {doctor?.name} &bull; Consultation Console
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {doctor?.specialization} &bull; {doctor?.department} &bull; Room: <strong>{doctor?.roomNumber}</strong>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button size="sm" variant="secondary" icon={RefreshCw} onClick={fetchDashboard}>
            Refresh
          </Button>
          <Link to="/doctor/queue">
            <Button size="sm" variant="primary">
              Full Queue Table
            </Button>
          </Link>
        </div>
      </div>

      {feedback && <Alert type={feedback.type} message={feedback.message} />}

      {/* Metrics Row */}
      <div className="grid grid-cols-4" style={{ marginBottom: '24px' }}>
        <StatCard
          label="Today's Appointments"
          value={metrics.todayAppointmentsCount || 0}
          icon={CalendarCheck}
          color="blue"
        />
        <StatCard
          label="Patients Waiting"
          value={metrics.waitingCount || 0}
          icon={Users}
          color="amber"
        />
        <StatCard
          label="Completed Today"
          value={metrics.completedCount || 0}
          icon={CheckCircle}
          color="emerald"
        />
        <StatCard
          label="Active In-Line"
          value={metrics.activeCount || 0}
          icon={Clock}
          color="purple"
        />
      </div>

      {/* Doctor Active Action Bar */}
      <div className="grid grid-cols-3" style={{ gap: '20px', marginBottom: '28px' }}>
        {/* Card 1: Currently In Consultation */}
        <div
          className="card"
          style={{
            borderLeft: '4px solid #7c3aed',
            background: currentConsultation ? '#faf5ff' : '#ffffff'
          }}
        >
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase' }}>
            In Consultation Room
          </span>
          {currentConsultation ? (
            <div style={{ marginTop: '8px' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                {currentConsultation.tokenNumber}
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '4px 0 14px 0' }}>
                Patient: <strong>{currentConsultation.patientId?.userId?.fullName || 'Walk-in'}</strong>
              </p>
              <Button
                variant="teal"
                size="sm"
                icon={CheckCircle}
                onClick={() => setCompleteNotesModal(true)}
                disabled={actionLoading}
                style={{ width: '100%' }}
              >
                Complete Consultation
              </Button>
            </div>
          ) : (
            <div style={{ padding: '20px 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              No consultation currently active.
            </div>
          )}
        </div>

        {/* Card 2: Currently Called Patient */}
        <div
          className="card"
          style={{
            borderLeft: '4px solid var(--primary)',
            background: currentlyCalled ? '#eff6ff' : '#ffffff'
          }}
        >
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
            Currently Called
          </span>
          {currentlyCalled ? (
            <div style={{ marginTop: '8px' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--primary)' }}>
                {currentlyCalled.tokenNumber}
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '4px 0 14px 0' }}>
                Patient: <strong>{currentlyCalled.patientId?.userId?.fullName || 'Walk-in'}</strong>
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button
                  variant="primary"
                  size="sm"
                  icon={Play}
                  onClick={() => handleStartConsultation(currentlyCalled._id)}
                  disabled={actionLoading || !!currentConsultation}
                  style={{ flex: 1 }}
                >
                  Start Consult
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={SkipForward}
                  onClick={() => handleSkipToken(currentlyCalled._id)}
                  disabled={actionLoading}
                >
                  Skip
                </Button>
              </div>
            </div>
          ) : (
            <div style={{ padding: '20px 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              No patient currently called.
            </div>
          )}
        </div>

        {/* Card 3: Next in Line */}
        <div className="card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#b45309', textTransform: 'uppercase' }}>
            Next Eligible Patient
          </span>
          {nextEligible ? (
            <div style={{ marginTop: '8px' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                {nextEligible.tokenNumber}
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '4px 0 14px 0' }}>
                Patient: <strong>{nextEligible.patientId?.userId?.fullName || 'Walk-in'}</strong>
              </p>
              <Button
                variant="primary"
                size="sm"
                icon={Volume2}
                onClick={() => handleCallToken(nextEligible._id)}
                disabled={actionLoading || !!currentlyCalled}
                style={{ width: '100%' }}
              >
                Call Next Patient
              </Button>
            </div>
          ) : (
            <div style={{ padding: '20px 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Queue is clear. No waiting patients.
            </div>
          )}
        </div>
      </div>

      {/* Waiting Queue Table Preview */}
      <Card title={`Active Waiting Queue (${waitingQueue.length})`}>
        {waitingQueue.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
            No patients waiting in queue today.
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Seq #</th>
                  <th>Token #</th>
                  <th>Patient Name</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {waitingQueue.map((t, idx) => (
                  <tr key={t._id}>
                    <td>#{idx + 1}</td>
                    <td style={{ fontWeight: 800, color: 'var(--primary)' }}>{t.tokenNumber}</td>
                    <td style={{ fontWeight: 600 }}>{t.patientId?.userId?.fullName}</td>
                    <td>{t.patientId?.userId?.phone || '--'}</td>
                    <td><Badge status={t.queueStatus} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <Button
                          size="sm"
                          variant="primary"
                          icon={Volume2}
                          onClick={() => handleCallToken(t._id)}
                          disabled={actionLoading || !!currentlyCalled}
                        >
                          Call
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          icon={SkipForward}
                          onClick={() => handleSkipToken(t._id)}
                          disabled={actionLoading}
                        >
                          Skip
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Consultation Complete Modal */}
      <Modal
        isOpen={completeNotesModal}
        onClose={() => setCompleteNotesModal(false)}
        title="Complete Consultation"
      >
        <form onSubmit={handleCompleteConsultation}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
            Completing consultation for token{' '}
            <strong>{currentConsultation?.tokenNumber}</strong>. You may add brief medical notes or diagnosis summary.
          </p>
          <div className="form-group">
            <label className="form-label">Consultation Notes / Prescription Summary</label>
            <textarea
              rows={4}
              className="form-textarea"
              placeholder="Diagnosis notes, advice, or follow-up recommendation..."
              value={consultationNotes}
              onChange={(e) => setConsultationNotes(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Button variant="secondary" onClick={() => setCompleteNotesModal(false)}>
              Back
            </Button>
            <Button type="submit" variant="teal" icon={CheckCircle} loading={actionLoading}>
              Confirm Complete
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DoctorDashboard;
