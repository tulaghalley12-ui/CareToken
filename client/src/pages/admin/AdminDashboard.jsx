import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserCheck,
  CalendarCheck,
  Ticket,
  Clock,
  Activity,
  Building2,
  RefreshCw,
  FileText
} from 'lucide-react';
import StatCard from '../../components/common/StatCard';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { dashboardService } from '../../services/dashboardService';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      const res = await dashboardService.getAdminDashboard();
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
    fetchAdminData();
  }, []);

  if (loading) return <LoadingSpinner text="Aggregating hospital metrics..." />;

  const summary = data?.summary || {};
  const departmentStats = data?.departmentStats || [];
  const recentActivity = data?.recentActivity || [];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Hospital Command Center</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Hospital-wide operational statistics, queue monitoring, and clinical governance
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Button size="sm" variant="secondary" icon={RefreshCw} onClick={fetchAdminData}>
            Refresh
          </Button>
          <Link to="/admin/reports">
            <Button size="sm" variant="primary">
              View Analytics
            </Button>
          </Link>
        </div>
      </div>

      {/* Top 5 Metric Cards */}
      <div className="grid grid-cols-4" style={{ marginBottom: '24px' }}>
        <StatCard
          label="Total Registered Patients"
          value={summary.totalPatients || 0}
          icon={Users}
          color="blue"
        />
        <StatCard
          label="Active Doctors"
          value={summary.totalDoctors || 0}
          icon={UserCheck}
          color="teal"
        />
        <StatCard
          label="Appointments Today"
          value={summary.totalAppointmentsToday || 0}
          icon={CalendarCheck}
          color="purple"
        />
        <StatCard
          label="Tokens Issued Today"
          value={summary.totalTokensToday || 0}
          icon={Ticket}
          color="amber"
          subtitle={`${summary.waitingTokensCount || 0} waiting &bull; ${summary.completedTokensToday || 0} completed`}
        />
      </div>

      <div className="grid grid-cols-3" style={{ gap: '24px', marginBottom: '28px' }}>
        {/* Department-wise queue table */}
        <div style={{ gridColumn: 'span 2' }}>
          <Card
            title="Department Queue Breakdown (Today)"
            action={
              <Link to="/admin/queues">
                <Button size="sm" variant="secondary">
                  Live Queue Matrix
                </Button>
              </Link>
            }
          >
            {departmentStats.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No active departments configured.
              </div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Department</th>
                      <th>Code</th>
                      <th>Daily Limit</th>
                      <th>Total Tokens</th>
                      <th>Waiting</th>
                      <th>Consulting</th>
                      <th>Completed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departmentStats.map((dept) => (
                      <tr key={dept._id}>
                        <td style={{ fontWeight: 700 }}>{dept.name}</td>
                        <td><span style={{ fontWeight: 800, color: 'var(--primary)' }}>{dept.code}</span></td>
                        <td>{dept.limit}</td>
                        <td><strong>{dept.total}</strong></td>
                        <td style={{ color: '#b45309', fontWeight: 700 }}>{dept.waiting}</td>
                        <td style={{ color: '#7c3aed', fontWeight: 700 }}>{dept.consulting}</td>
                        <td style={{ color: '#059669', fontWeight: 700 }}>{dept.completed}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Recent Activity Log Preview */}
        <div>
          <Card
            title="Audit & Activity Log"
            action={
              <Link to="/admin/logs" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                View All
              </Link>
            }
          >
            {recentActivity.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No recent activity logged.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {recentActivity.slice(0, 6).map((log) => (
                  <div
                    key={log._id}
                    style={{
                      padding: '8px 10px',
                      background: '#f8fafc',
                      borderRadius: 'var(--radius-sm)',
                      borderLeft: '3px solid var(--teal)',
                      fontSize: '0.75rem'
                    }}
                  >
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      {log.action}
                    </div>
                    <div style={{ color: 'var(--text-muted)' }}>
                      By: {log.userEmail} ({log.userRole})
                    </div>
                    <span style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
