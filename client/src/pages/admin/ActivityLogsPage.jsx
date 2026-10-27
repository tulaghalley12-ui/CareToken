import React, { useState, useEffect } from 'react';
import { FileText, RefreshCw, Filter } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { adminService } from '../../services/adminService';

const ActivityLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (actionFilter) params.action = actionFilter;
      const res = await adminService.getActivityLogs(params);
      if (res.success) {
        setLogs(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>System Activity & Audit Logs</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Security audit trail of user logins, token state updates, and clinical appointments
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <select
            className="form-select"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            style={{ width: '220px' }}
          >
            <option value="">All Actions</option>
            <option value="USER_LOGIN">User Logins</option>
            <option value="TOKEN_CALLED">Token Calls</option>
            <option value="TOKEN_COMPLETED">Consultation Completions</option>
            <option value="TOKEN_SKIPPED">Token Skips</option>
            <option value="APPOINTMENT_BOOKED">Appointments Booked</option>
            <option value="APPOINTMENT_CANCELLED">Appointments Cancelled</option>
          </select>
          <Button size="sm" variant="secondary" icon={RefreshCw} onClick={fetchLogs}>
            Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading audit records..." />
      ) : (
        <Card title={`Audit Events (${logs.length})`}>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>User Email</th>
                  <th>Role</th>
                  <th>Resource</th>
                  <th>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id}>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td>
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          background: log.action.includes('CANCEL')
                            ? '#fee2e2'
                            : log.action.includes('CALL') || log.action.includes('LOGIN')
                            ? '#dbeafe'
                            : '#f1f5f9',
                          color: log.action.includes('CANCEL')
                            ? '#991b1b'
                            : log.action.includes('CALL')
                            ? '#1e40af'
                            : 'var(--text-primary)'
                        }}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td>{log.userEmail}</td>
                    <td style={{ textTransform: 'capitalize' }}>{log.userRole}</td>
                    <td>
                      <span style={{ fontSize: '0.8125rem' }}>
                        {log.resourceType} {log.resourceId ? `(${String(log.resourceId).substring(0, 8)}...)` : ''}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {log.ipAddress || 'local'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ActivityLogsPage;
