import React, { useState, useEffect } from 'react';
import { Activity, RefreshCw, Building2, Users } from 'lucide-react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { departmentService } from '../../services/departmentService';
import { tokenService } from '../../services/tokenService';
import { useSocket } from '../../context/SocketContext';

const QueueMonitoringPage = () => {
  const [departments, setDepartments] = useState([]);
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const { lastQueueEvent, isConnected, joinDepartment, leaveDepartment } = useSocket();

  useEffect(() => {
    departmentService.getDepartments().then((res) => {
      if (res.success && res.data.length > 0) {
        setDepartments(res.data);
        setSelectedDeptId(res.data[0]._id);
      }
      setLoading(false);
    });
  }, []);

  const fetchQueue = async () => {
    if (!selectedDeptId) return;
    try {
      const res = await tokenService.getDepartmentQueue(selectedDeptId);
      if (res.success) setTokens(res.data);
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
    if (lastQueueEvent) fetchQueue();
  }, [lastQueueEvent]);

  if (loading) return <LoadingSpinner text="Connecting to live queue channels..." />;

  const waitingCount = tokens.filter((t) => t.queueStatus === 'WAITING').length;
  const consultingCount = tokens.filter((t) => t.queueStatus === 'IN_CONSULTATION').length;
  const completedCount = tokens.filter((t) => t.queueStatus === 'COMPLETED').length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Real-Time Queue Monitoring</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Live inspection of patient flow, doctor consultations, and wait durations
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

      <div className="grid grid-cols-3" style={{ gap: '16px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '16px', borderLeft: '4px solid #b45309' }}>
          <div style={{ fontSize: '0.75rem', color: '#b45309', fontWeight: 700, textTransform: 'uppercase' }}>Waiting</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900 }}>{waitingCount}</div>
        </div>
        <div className="card" style={{ padding: '16px', borderLeft: '4px solid #7c3aed' }}>
          <div style={{ fontSize: '0.75rem', color: '#7c3aed', fontWeight: 700, textTransform: 'uppercase' }}>In Consultation</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900 }}>{consultingCount}</div>
        </div>
        <div className="card" style={{ padding: '16px', borderLeft: '4px solid #059669' }}>
          <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700, textTransform: 'uppercase' }}>Completed Today</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900 }}>{completedCount}</div>
        </div>
      </div>

      <Card title={`Active Department Queue (${tokens.length} Total Issued)`}>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Seq #</th>
                <th>Token #</th>
                <th>Patient Name</th>
                <th>Doctor</th>
                <th>Room</th>
                <th>Status</th>
                <th>Est. Wait</th>
              </tr>
            </thead>
            <tbody>
              {tokens.map((t) => {
                const pos = t.positionInfo || {};
                return (
                  <tr key={t._id}>
                    <td style={{ fontWeight: 700 }}>#{t.tokenSequence}</td>
                    <td style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--primary)' }}>
                      {t.tokenNumber}
                    </td>
                    <td style={{ fontWeight: 600 }}>{t.patientName}</td>
                    <td>{t.doctorName}</td>
                    <td><strong>{t.roomNumber}</strong></td>
                    <td><Badge status={t.queueStatus} /></td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      {t.queueStatus === 'WAITING' ? `~${pos.estimatedWaitMinutes || 0} mins` : '--'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default QueueMonitoringPage;
