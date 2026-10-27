import React, { useState, useEffect } from 'react';
import { BarChart2, Ticket, TrendingUp, Calendar, CheckCircle } from 'lucide-react';
import Card from '../../components/common/Card';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { dashboardService } from '../../services/dashboardService';

const TokenReportsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.getAdminDashboard().then((res) => {
      if (res.success) setData(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingSpinner text="Generating analytics..." />;

  const summary = data?.summary || {};
  const departmentStats = data?.departmentStats || [];

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Token Statistics & Utilization Reports</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Daily outpatient throughput, clinic token capacity, and queue completion metrics
        </p>
      </div>

      <div className="grid grid-cols-3" style={{ marginBottom: '24px' }}>
        <StatCard
          label="Total Tokens Generated Today"
          value={summary.totalTokensToday || 0}
          icon={Ticket}
          color="blue"
        />
        <StatCard
          label="Completed Consultations"
          value={summary.completedTokensToday || 0}
          icon={CheckCircle}
          color="emerald"
        />
        <StatCard
          label="Current Outpatient Waiting"
          value={summary.waitingTokensCount || 0}
          icon={TrendingUp}
          color="amber"
        />
      </div>

      <Card title="Department Utilization & Daily Quotas">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Department</th>
                <th>Prefix</th>
                <th>Issued Today</th>
                <th>Daily Limit</th>
                <th>Utilization</th>
                <th>Completed</th>
              </tr>
            </thead>
            <tbody>
              {departmentStats.map((dept) => {
                const pct = dept.limit ? Math.min(100, Math.round((dept.total / dept.limit) * 100)) : 0;
                return (
                  <tr key={dept._id}>
                    <td><strong>{dept.name}</strong></td>
                    <td style={{ fontWeight: 800, color: 'var(--primary)' }}>{dept.code}</td>
                    <td>{dept.total}</td>
                    <td>{dept.limit}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: 1, height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${pct}%`,
                              height: '100%',
                              background: pct > 85 ? '#ef4444' : pct > 60 ? '#f59e0b' : 'var(--teal)'
                            }}
                          />
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{pct}%</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 700, color: '#059669' }}>{dept.completed}</td>
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

export default TokenReportsPage;
