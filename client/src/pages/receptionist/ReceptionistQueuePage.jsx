import React, { useState, useEffect } from 'react';
import {
  Ticket,
  Printer,
  Volume2,
  RotateCcw,
  SkipForward,
  XCircle,
  RefreshCw,
  Building2
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import PrintReceiptModal from '../../components/common/PrintReceiptModal';
import { departmentService } from '../../services/departmentService';
import { tokenService } from '../../services/tokenService';
import { useSocket } from '../../context/SocketContext';

const ReceptionistQueuePage = () => {
  const [departments, setDepartments] = useState([]);
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [queueTokens, setQueueTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [printToken, setPrintToken] = useState(null);

  const { lastQueueEvent, joinDepartment, leaveDepartment } = useSocket();

  // Load departments
  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const res = await departmentService.getDepartments();
        if (res.success && res.data.length > 0) {
          setDepartments(res.data);
          setSelectedDeptId(res.data[0]._id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDepts();
  }, []);

  // Fetch tokens for selected department
  const fetchQueue = async () => {
    if (!selectedDeptId) return;
    try {
      const res = await tokenService.getDepartmentQueue(selectedDeptId);
      if (res.success) {
        setQueueTokens(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchQueue();
    joinDepartment(selectedDeptId);
    return () => leaveDepartment(selectedDeptId);
  }, [selectedDeptId]);

  useEffect(() => {
    if (lastQueueEvent) {
      fetchQueue();
    }
  }, [lastQueueEvent]);

  // Actions
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

  const handleCancelToken = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this token?')) return;
    setActionLoading(true);
    setFeedback(null);
    try {
      const res = await tokenService.cancelToken(id, 'Cancelled by receptionist');
      setFeedback({ type: 'info', message: res.message });
      fetchQueue();
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Cancel failed' });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading department queues..." />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Department Active Queue Control</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Monitor and coordinate patient token queues in real time
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select
            className="form-select"
            value={selectedDeptId}
            onChange={(e) => setSelectedDeptId(e.target.value)}
            style={{ fontWeight: 700, minWidth: '220px' }}
          >
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name} ({d.departmentCode})
              </option>
            ))}
          </select>
          <Button size="sm" variant="secondary" icon={RefreshCw} onClick={fetchQueue}>
            Refresh
          </Button>
        </div>
      </div>

      {feedback && <Alert type={feedback.type} message={feedback.message} />}

      <Card title={`Active Queue List (${queueTokens.length} Patients)`}>
        {queueTokens.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
            No tokens in this department queue today.
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Queue #</th>
                  <th>Token #</th>
                  <th>Patient Name</th>
                  <th>Phone</th>
                  <th>Doctor</th>
                  <th>Room</th>
                  <th>Status</th>
                  <th>Est. Wait</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {queueTokens.map((t) => {
                  const pos = t.positionInfo || {};
                  return (
                    <tr key={t._id}>
                      <td style={{ fontWeight: 800, color: 'var(--primary)' }}>
                        {pos.queuePosition ? `#${pos.queuePosition}` : '--'}
                      </td>
                      <td style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--primary)' }}>
                        {t.tokenNumber}
                      </td>
                      <td style={{ fontWeight: 600 }}>{t.patientName}</td>
                      <td>{t.patientPhone || '--'}</td>
                      <td>{t.doctorName}</td>
                      <td><strong>{t.roomNumber}</strong></td>
                      <td><Badge status={t.queueStatus} /></td>
                      <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        {t.queueStatus === 'WAITING' ? `~${pos.estimatedWaitMinutes || 0} mins` : '--'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <Button
                            size="sm"
                            variant="secondary"
                            icon={Printer}
                            onClick={() => setPrintToken(t)}
                            title="Print Token Slip"
                          >
                            Print
                          </Button>
                          {t.queueStatus === 'WAITING' && (
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
                          {t.queueStatus === 'SKIPPED' && (
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
                          {['WAITING', 'CALLED', 'SKIPPED'].includes(t.queueStatus) && (
                            <Button
                              size="sm"
                              variant="danger"
                              icon={XCircle}
                              onClick={() => handleCancelToken(t._id)}
                              disabled={actionLoading}
                            >
                              Cancel
                            </Button>
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

      <PrintReceiptModal
        isOpen={!!printToken}
        onClose={() => setPrintToken(null)}
        token={printToken}
      />
    </div>
  );
};

export default ReceptionistQueuePage;
