import React, { useState, useEffect } from 'react';
import { Activity, RefreshCw, Volume2, Stethoscope, Clock, Users, Building2 } from 'lucide-react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { departmentService } from '../../services/departmentService';
import { tokenService } from '../../services/tokenService';
import { useSocket } from '../../context/SocketContext';

const PublicLiveQueuePage = () => {
  const [departments, setDepartments] = useState([]);
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [queueTokens, setQueueTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const { isConnected, lastQueueEvent, joinDepartment, leaveDepartment } = useSocket();

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

  // Fetch queue data for selected department
  const fetchQueue = async () => {
    if (!selectedDeptId) return;
    try {
      const res = await tokenService.getDepartmentQueue(selectedDeptId);
      if (res.success) {
        setQueueTokens(res.data);
        setLastRefreshed(new Date());
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchQueue();
    joinDepartment(selectedDeptId);

    // Fallback polling every 15 seconds
    const interval = setInterval(fetchQueue, 15000);

    return () => {
      leaveDepartment(selectedDeptId);
      clearInterval(interval);
    };
  }, [selectedDeptId]);

  // When a socket update is received
  useEffect(() => {
    if (lastQueueEvent) {
      fetchQueue();
    }
  }, [lastQueueEvent]);

  const currentlyCalled = queueTokens.filter((t) => t.queueStatus === 'CALLED');
  const inConsultation = queueTokens.filter((t) => t.queueStatus === 'IN_CONSULTATION');
  const waitingTokens = queueTokens.filter((t) => t.queueStatus === 'WAITING');

  const selectedDeptObj = departments.find((d) => d._id === selectedDeptId);

  return (
    <div className="page-container" style={{ maxWidth: 1300 }}>
      {/* Header bar with live indicator */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)' }}>
              Outpatient Queue Display
            </h1>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: isConnected ? '#d1fae5' : '#fee2e2',
                color: isConnected ? '#065f46' : '#991b1b'
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: isConnected ? '#10b981' : '#ef4444'
                }}
              />
              {isConnected ? 'LIVE SYNC ACTIVE' : 'POLLING FALLBACK'}
            </span>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Real-time digital status board for patient waiting lounges & corridors
          </p>
        </div>

        {/* Department selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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

      {loading ? (
        <LoadingSpinner text="Connecting to department queue display..." />
      ) : (
        <>
          {/* Top Big Status Screens */}
          <div className="grid grid-cols-2" style={{ gap: '20px', marginBottom: '28px' }}>
            {/* Now Called */}
            <div
              style={{
                background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
                color: '#ffffff',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
                boxShadow: 'var(--shadow-lg)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  NOW CALLING / PLEASE PROCEED
                </span>
                <Volume2 size={20} />
              </div>

              {currentlyCalled.length === 0 ? (
                <div style={{ padding: '24px 0', textAlign: 'center', opacity: 0.8, fontSize: '1.125rem' }}>
                  No token currently being called
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {currentlyCalled.map((t) => (
                    <div
                      key={t._id}
                      style={{
                        background: 'rgba(255, 255, 255, 0.15)',
                        backdropFilter: 'blur(4px)',
                        padding: '16px',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '0.05em', lineHeight: 1 }}>
                          {t.tokenNumber}
                        </div>
                        <div style={{ fontSize: '0.875rem', marginTop: '6px', opacity: 0.9 }}>
                          Patient: {t.patientName}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{t.roomNumber}</div>
                        <div style={{ fontSize: '0.8125rem', opacity: 0.85 }}>{t.doctorName}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* In Consultation */}
            <div
              style={{
                background: 'linear-gradient(135deg, #0d9488, #0f766e)',
                color: '#ffffff',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
                boxShadow: 'var(--shadow-lg)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  CURRENTLY IN CONSULTATION
                </span>
                <Stethoscope size={20} />
              </div>

              {inConsultation.length === 0 ? (
                <div style={{ padding: '24px 0', textAlign: 'center', opacity: 0.8, fontSize: '1.125rem' }}>
                  No active consultation in progress
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {inConsultation.map((t) => (
                    <div
                      key={t._id}
                      style={{
                        background: 'rgba(255, 255, 255, 0.15)',
                        backdropFilter: 'blur(4px)',
                        padding: '16px',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '0.05em', lineHeight: 1 }}>
                          {t.tokenNumber}
                        </div>
                        <div style={{ fontSize: '0.875rem', marginTop: '6px', opacity: 0.9 }}>
                          Patient: {t.patientName}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{t.roomNumber}</div>
                        <div style={{ fontSize: '0.8125rem', opacity: 0.85 }}>{t.doctorName}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Waiting Queue Table */}
          <Card
            title={`Waiting Queue (${waitingTokens.length} Patients in Line)`}
            action={
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Auto-updated: {lastRefreshed.toLocaleTimeString()}
              </span>
            }
          >
            {queueTokens.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                No active tokens in this department queue today.
              </div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Queue #</th>
                      <th>Token Number</th>
                      <th>Patient Name</th>
                      <th>Assigned Doctor</th>
                      <th>Room</th>
                      <th>Status</th>
                      <th>Est. Wait</th>
                    </tr>
                  </thead>
                  <tbody>
                    {queueTokens.map((t) => {
                      const pos = t.positionInfo || {};
                      return (
                        <tr
                          key={t._id}
                          style={{
                            backgroundColor:
                              t.queueStatus === 'CALLED'
                                ? '#eff6ff'
                                : t.queueStatus === 'IN_CONSULTATION'
                                ? '#f0fdfa'
                                : '#ffffff'
                          }}
                        >
                          <td style={{ fontWeight: 800, color: 'var(--primary)' }}>
                            {pos.queuePosition ? `#${pos.queuePosition}` : '--'}
                          </td>
                          <td style={{ fontSize: '1.125rem', fontWeight: 800 }}>
                            {t.tokenNumber}
                          </td>
                          <td style={{ fontWeight: 600 }}>{t.patientName}</td>
                          <td>{t.doctorName}</td>
                          <td><strong>{t.roomNumber}</strong></td>
                          <td><Badge status={t.queueStatus} /></td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                            {t.queueStatus === 'WAITING' ? `~${pos.estimatedWaitMinutes || 0} mins` : '--'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
};

export default PublicLiveQueuePage;
