import React, { useState, useEffect } from 'react';
import { Ticket, Printer, RefreshCw, Calendar } from 'lucide-react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import PrintReceiptModal from '../../components/common/PrintReceiptModal';
import { tokenService } from '../../services/tokenService';
import { useSocket } from '../../context/SocketContext';

const MyTokensPage = () => {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrintToken, setSelectedPrintToken] = useState(null);
  const { lastQueueEvent } = useSocket();

  const fetchTokens = async () => {
    try {
      const res = await tokenService.getMyTokens();
      if (res.success) {
        setTokens(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  useEffect(() => {
    if (lastQueueEvent) {
      fetchTokens();
    }
  }, [lastQueueEvent]);

  if (loading) return <LoadingSpinner text="Loading your hospital tokens..." />;

  const activeTokens = tokens.filter((t) =>
    ['WAITING', 'CALLED', 'IN_CONSULTATION', 'SKIPPED'].includes(t.queueStatus)
  );
  const pastTokens = tokens.filter((t) =>
    ['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(t.queueStatus)
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>My Hospital Tokens</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Track active waiting queue positions and past consultation receipts
          </p>
        </div>
        <Button size="sm" variant="secondary" icon={RefreshCw} onClick={fetchTokens}>
          Refresh Status
        </Button>
      </div>

      {/* Active Tokens Section */}
      <div style={{ marginBottom: '36px' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '14px' }}>
          Active Tokens ({activeTokens.length})
        </h3>
        {activeTokens.length === 0 ? (
          <div style={{ padding: '24px', background: '#ffffff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            No active tokens at the moment.
          </div>
        ) : (
          <div className="grid grid-cols-2">
            {activeTokens.map((t) => {
              const pos = t.positionInfo || {};
              return (
                <Card key={t._id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        Token Number
                      </span>
                      <div style={{ fontSize: '1.875rem', fontWeight: 900, color: 'var(--primary)' }}>
                        {t.tokenNumber}
                      </div>
                    </div>
                    <Badge status={t.queueStatus} />
                  </div>

                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                    <div><strong>Department:</strong> {t.departmentId?.name}</div>
                    <div><strong>Doctor:</strong> {t.doctorId?.userId?.fullName}</div>
                    <div><strong>Service Date:</strong> {t.serviceDate}</div>
                    <div>
                      <strong>Queue Position:</strong>{' '}
                      <span style={{ color: 'var(--primary)', fontWeight: 800 }}>
                        {pos.queuePosition ? `#${pos.queuePosition}` : 'In Room / Called'}
                      </span>{' '}
                      {pos.eligibleWaitingAhead !== undefined && `(${pos.eligibleWaitingAhead} ahead)`}
                    </div>
                    <div>
                      <strong>Estimated Wait:</strong> ~{pos.estimatedWaitMinutes || 0} minutes
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      size="sm"
                      variant="secondary"
                      icon={Printer}
                      onClick={() => setSelectedPrintToken(t)}
                    >
                      Print Slip
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Historical Tokens */}
      <div>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '14px' }}>
          Historical Tokens ({pastTokens.length})
        </h3>
        {pastTokens.length === 0 ? (
          <div style={{ padding: '24px', background: '#ffffff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            No past tokens on record.
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Token #</th>
                  <th>Department</th>
                  <th>Doctor</th>
                  <th>Service Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pastTokens.map((t) => (
                  <tr key={t._id}>
                    <td style={{ fontWeight: 800 }}>{t.tokenNumber}</td>
                    <td>{t.departmentId?.name}</td>
                    <td>{t.doctorId?.userId?.fullName}</td>
                    <td>{t.serviceDate}</td>
                    <td><Badge status={t.queueStatus} /></td>
                    <td>
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={Printer}
                        onClick={() => setSelectedPrintToken(t)}
                      >
                        Receipt
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <PrintReceiptModal
        isOpen={!!selectedPrintToken}
        onClose={() => setSelectedPrintToken(null)}
        token={selectedPrintToken}
      />
    </div>
  );
};

export default MyTokensPage;
