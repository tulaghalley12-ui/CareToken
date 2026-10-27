import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Ticket, Clock, Bell, Plus, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { dashboardService } from '../../services/dashboardService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import QueueTicketCard from '../../components/common/QueueTicketCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PrintReceiptModal from '../../components/common/PrintReceiptModal';

const PatientDashboard = () => {
  const { user } = useAuth();
  const { lastQueueEvent } = useSocket();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPrintToken, setSelectedPrintToken] = useState(null);

  const fetchDashboard = async () => {
    try {
      const res = await dashboardService.getPatientDashboard();
      if (res.success) {
        setDashboardData(res.data);
      }
    } catch (err) {
      console.error('Failed to load patient dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Reactive refresh on socket events
  useEffect(() => {
    if (lastQueueEvent) {
      fetchDashboard();
    }
  }, [lastQueueEvent]);

  if (loading) return <LoadingSpinner text="Loading your dashboard..." />;

  const activeToken = dashboardData?.activeToken;
  const upcomingAppointment = dashboardData?.upcomingAppointment;
  const notifications = dashboardData?.recentNotifications || [];

  return (
    <div>
      {/* Welcome header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Welcome back, {user?.fullName?.split(' ')[0]}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Patient ID: <strong>{dashboardData?.patient?.patientNumber || 'PAT-10001'}</strong> &bull; Track your active hospital queues and doctor appointments
          </p>
        </div>
        <Link to="/book">
          <Button variant="teal" icon={Plus}>
            Book Appointment
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-3" style={{ gap: '24px' }}>
        {/* Active Token Card */}
        <div style={{ gridColumn: 'span 2' }}>
          {activeToken ? (
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Your Active Token</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--teal)', fontWeight: 600 }}>
                  Live Queue Tracking Active
                </span>
              </div>
              <QueueTicketCard
                token={activeToken}
                onPrint={(token) => setSelectedPrintToken(token)}
              />
            </div>
          ) : (
            <div
              style={{
                background: '#ffffff',
                border: '1px dashed var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '36px 20px',
                textAlign: 'center',
                marginBottom: '24px'
              }}
            >
              <Ticket size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 12px auto' }} />
              <h4 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '6px' }}>
                No Active Queue Token Today
              </h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: 400, margin: '0 auto 18px auto' }}>
                You do not currently have a waiting or in-consultation token for today. Book an appointment to generate a token.
              </p>
              <Link to="/book">
                <Button variant="primary" icon={Calendar}>
                  Book Consultation Slot
                </Button>
              </Link>
            </div>
          )}

          {/* Upcoming Appointment */}
          <Card title="Upcoming Appointment">
            {upcomingAppointment ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}>
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 700 }}>
                    {upcomingAppointment.doctorId?.userId?.fullName}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    {upcomingAppointment.departmentId?.name} &bull; {upcomingAppointment.appointmentType}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 600, marginTop: '4px' }}>
                    {upcomingAppointment.appointmentDate} at {upcomingAppointment.appointmentTime}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <Badge status={upcomingAppointment.status} />
                  {upcomingAppointment.tokenId && (
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginTop: '6px' }}>
                      Token: {upcomingAppointment.tokenId.tokenNumber || 'Assigned'}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                No scheduled upcoming appointments.
              </div>
            )}
          </Card>
        </div>

        {/* Right sidebar: Recent notifications */}
        <div>
          <Card title="Recent Notifications">
            {notifications.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                No recent notifications.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {notifications.map((n) => (
                  <div
                    key={n._id}
                    style={{
                      padding: '10px 12px',
                      background: '#f8fafc',
                      borderRadius: 'var(--radius-sm)',
                      borderLeft: '3px solid var(--primary)',
                      fontSize: '0.8125rem'
                    }}
                  >
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{n.title}</div>
                    <p style={{ color: 'var(--text-secondary)', margin: '4px 0' }}>{n.message}</p>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {new Date(n.createdAt).toLocaleDateString()} &bull; {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      <PrintReceiptModal
        isOpen={!!selectedPrintToken}
        onClose={() => setSelectedPrintToken(null)}
        token={selectedPrintToken}
      />
    </div>
  );
};

export default PatientDashboard;
