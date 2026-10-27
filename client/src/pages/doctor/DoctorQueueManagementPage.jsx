import React, { useState, useEffect } from 'react';
import {
  Volume2,
  Play,
  CheckCircle,
  SkipForward,
  RotateCcw,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { doctorService } from '../../services/doctorService';
import { tokenService } from '../../services/tokenService';

const DoctorQueueManagementPage = () => {
  const { user } = useAuth();
  const [queueData, setQueueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Complete consultation modal
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [completingTokenId, setCompletingTokenId] = useState(null);
  const [consultNotes, setConsultNotes] = useState('');

  const { lastQueueEvent, joinDoctor, leaveDoctor } = useSocket();

  const fetchQueue = async () => {
    if (!user?.doctor?._id) return;
    try {
      const res = await doctorService.getDoctorQueue(user.doctor._id);
      if (res.success) {
        setQueueData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [user?.doctor?._id]);

  useEffect(() => {
    if (user?.doctor?._id) {
      joinDoctor(user.doctor._id);
      return () => leaveDoctor(user.doctor._id);
    }
  }, [user?.doctor?._id]);

  useEffect(() => {
    if (lastQueueEvent) {
      fetchQueue();
    }
  }, [lastQueueEvent]);

  const handleCall = async (id) => {
    setActionLoading(true);
    setFeedback(null);
    try {
      const res = await tokenService.callToken(id);
      setFeedback({ type: 'success', message: res.message });
      fetchQueue();
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Call failed' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartConsultation = async (id) => {
    setActionLoading(true);
    setFeedback(null);
    try {
      const res = await tokenService.startConsultation(id);
      setFeedback({ type: 'success', message: res.message });
      fetchQueue();
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Start consultation failed' });
    } finally {
      setActionLoading(false);
    }
  };

  const openCompleteModal = (id) => {
    setCompletingTokenId(id);
    setConsultNotes('');
    setCompleteModalOpen(true);
  };

  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    if (!completingTokenId) return;
    setActionLoading(true);
    try {
      const res = await tokenService.completeToken(completingTokenId, consultNotes);
      setFeedback({ type: 'success', message: res.message });
      setCompleteModalOpen(false);
      fetchQueue();
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Completion failed' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSkip = async (id) => {
    setActionLoading(true);
    setFeedback(null);
    try {
      const res = await tokenService.skipToken(id, 'Patient absent during call');
      setFeedback({ type: 'info', message: res.message });
      fetchQueue();
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Skip failed' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRecall = async (id) => {
    setActionLoading(true);
    setFeedback(null);
    try {
      const res = await tokenService.recallToken(id);
      setFeedback({ type: 'success', message: res.message });
      fetchQueue();
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Recall failed' });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingSpinner text="Connecting to doctor queue..." />;

  const tokens = queueData?.tokens || [];
  const currentConsultation = queueData?.currentConsultation;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Patient Queue Controller</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Control live patient calls, consultations, skips, and recalls
          </p>
        </div>
        <Button size="sm" variant="secondary" icon={RefreshCw} onClick={fetchQueue}>
          Refresh Queue
        </Button>
      </div>

      {feedback && <Alert type={feedback.type} message={feedback.message} />}

      <Card title={`Today's Queue Roster (${tokens.length} Total Registered)`}>
        {tokens.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
            No tokens generated for your clinic today.
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Sequence</th>
                  <th>Token #</th>
                  <th>Patient Name</th>
                  <th>Phone</th>
                  <th>Queue Status</th>
                  <th>Issued Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tokens.map((t) => {
                  const isConsulting = t.queueStatus === 'IN_CONSULTATION';
                  const isCalled = t.queueStatus === 'CALLED';
                  const isWaiting = t.queueStatus === 'WAITING';
                  const isSkipped = t.queueStatus === 'SKIPPED';
                  const isCompleted = t.queueStatus === 'COMPLETED';

                  return (
                    <tr
                      key={t._id}
                      style={{
                        backgroundColor: isConsulting
                          ? '#f3e8ff'
                          : isCalled
                          ? '#eff6ff'
                          : isSkipped
                          ? '#fff7ed'
                          : '#ffffff'
                      }}
                    >
                      <td style={{ fontWeight: 700 }}>#{t.tokenSequence}</td>
                      <td style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--primary)' }}>
                        {t.tokenNumber}
                      </td>
                      <td style={{ fontWeight: 600 }}>{t.patientId?.userId?.fullName || 'Walk-in'}</td>
                      <td>{t.patientId?.userId?.phone || '--'}</td>
                      <td><Badge status={t.queueStatus} /></td>
                      <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(t.issuedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {/* If WAITING */}
                          {isWaiting && (
                            <Button
                              size="sm"
                              variant="primary"
                              icon={Volume2}
                              onClick={() => handleCall(t._id)}
                              disabled={actionLoading}
                            >
                              Call
                            </Button>
                          )}

                          {/* If CALLED */}
                          {isCalled && (
                            <>
                              <Button
                                size="sm"
                                variant="teal"
                                icon={Play}
                                onClick={() => handleStartConsultation(t._id)}
                                disabled={actionLoading || !!currentConsultation}
                              >
                                Start
                              </Button>
                              <Button
                                size="sm"
                                variant="secondary"
                                icon={SkipForward}
                                onClick={() => handleSkip(t._id)}
                                disabled={actionLoading}
                              >
                                Skip
                              </Button>
                            </>
                          )}

                          {/* If IN_CONSULTATION */}
                          {isConsulting && (
                            <Button
                              size="sm"
                              variant="teal"
                              icon={CheckCircle}
                              onClick={() => openCompleteModal(t._id)}
                              disabled={actionLoading}
                            >
                              Complete
                            </Button>
                          )}

                          {/* If SKIPPED */}
                          {isSkipped && (
                            <Button
                              size="sm"
                              variant="secondary"
                              icon={RotateCcw}
                              onClick={() => handleRecall(t._id)}
                              disabled={actionLoading}
                            >
                              Recall
                            </Button>
                          )}

                          {/* If COMPLETED */}
                          {isCompleted && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--teal)', fontWeight: 700 }}>
                              Done
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Complete Modal */}
      <Modal
        isOpen={completeModalOpen}
        onClose={() => setCompleteModalOpen(false)}
        title="Complete Patient Consultation"
      >
        <form onSubmit={handleCompleteSubmit}>
          <div className="form-group">
            <label className="form-label">Consultation Notes / Instructions</label>
            <textarea
              rows={4}
              className="form-textarea"
              placeholder="Clinical impressions, prescribed meds, or recommendations..."
              value={consultNotes}
              onChange={(e) => setConsultNotes(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Button variant="secondary" onClick={() => setCompleteModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="teal" icon={CheckCircle} loading={actionLoading}>
              Save & Mark Completed
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DoctorQueueManagementPage;
