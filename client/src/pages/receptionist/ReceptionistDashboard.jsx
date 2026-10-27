import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Ticket,
  Clock,
  Stethoscope,
  UserPlus,
  Calendar,
  Printer,
  RefreshCw
} from 'lucide-react';
import StatCard from '../../components/common/StatCard';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PrintReceiptModal from '../../components/common/PrintReceiptModal';
import { dashboardService } from '../../services/dashboardService';
import { useSocket } from '../../context/SocketContext';

const ReceptionistDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPrintToken, setSelectedPrintToken] = useState(null);
  const { lastQueueEvent } = useSocket();

  const fetchDashboard = async () => {
    try {
      const res = await dashboardService.getReceptionistDashboard();
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
    if (lastQueueEvent) {
      fetchDashboard();
    }
  }, [lastQueueEvent]);

  if (loading) return <LoadingSpinner text="Loading reception console..." />;

  const metrics = data?.metrics || {};
  const recentTokens = data?.recentTokens || [];
  const departments = data?.departments || [];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Receptionist Desk</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Hospital outpatient front-desk token distribution & walk-in patient management
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Button size="sm" variant="secondary" icon={RefreshCw} onClick={fetchDashboard}>
            Refresh
          </Button>
          <Link to="/receptionist/patient-register">
            <Button size="sm" variant="teal" icon={UserPlus}>
              Walk-in Register
            </Button>
          </Link>
          <Link to="/receptionist/book-appointment">
            <Button size="sm" variant="primary" icon={Calendar}>
              Book & Issue Token
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-4" style={{ marginBottom: '24px' }}>
        <StatCard
          label="Today's Registrations"
          value={metrics.registrationsToday || 0}
          icon={UserPlus}
          color="blue"
        />
        <StatCard
          label="Active Tokens Today"
          value={metrics.activeTokensToday || 0}
          icon={Ticket}
          color="teal"
        />
        <StatCard
          label="Patients Waiting"
          value={metrics.patientsWaiting || 0}
          icon={Clock}
          color="amber"
        />
        <StatCard
          label="In Consultation"
          value={metrics.patientsConsulting || 0}
          icon={Stethoscope}
          color="purple"
        />
      </div>

      {/* Recent Tokens Table */}
      <Card
        title="Recently Generated Tokens"
        action={
          <Link to="/receptionist/queue">
            <Button size="sm" variant="secondary">
              View All Department Queues
            </Button>
          </Link>
        }
      >
        {recentTokens.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
            No tokens generated yet today.
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Token #</th>
                  <th>Patient Name</th>
                  <th>Department</th>
                  <th>Assigned Doctor</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentTokens.map((t) => (
                  <tr key={t._id}>
                    <td style={{ fontSize: '1.0625rem', fontWeight: 800, color: 'var(--primary)' }}>
                      {t.tokenNumber}
                    </td>
                    <td style={{ fontWeight: 600 }}>{t.patientId?.userId?.fullName || 'Walk-in'}</td>
                    <td>{t.departmentId?.name}</td>
                    <td>{t.doctorId?.userId?.fullName}</td>
                    <td><Badge status={t.queueStatus} /></td>
                    <td>
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={Printer}
                        onClick={() => setSelectedPrintToken(t)}
                      >
                        Print Slip
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <PrintReceiptModal
        isOpen={!!selectedPrintToken}
        onClose={() => setSelectedPrintToken(null)}
        token={selectedPrintToken}
      />
    </div>
  );
};

export default ReceptionistDashboard;
