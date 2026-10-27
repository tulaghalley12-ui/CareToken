import React from 'react';
import { Clock, Users, MapPin, Stethoscope, Printer } from 'lucide-react';
import Badge from './Badge';
import Button from './Button';

const QueueTicketCard = ({ token, onPrint, showActions = true }) => {
  if (!token) return null;

  const positionInfo = token.positionInfo || {};
  const isConsulting = token.queueStatus === 'IN_CONSULTATION';
  const isCalled = token.queueStatus === 'CALLED';

  return (
    <div className="token-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span style={{ fontSize: '0.8125rem', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Hospital Queue Token
          </span>
          <div className="token-number-large">{token.tokenNumber}</div>
        </div>
        <Badge status={token.queueStatus} />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '12px',
          margin: '20px 0'
        }}
      >
        <div className="queue-metric">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', opacity: 0.9 }}>
            <Users size={14} /> Queue Position
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '4px' }}>
            {isConsulting ? (
              <span style={{ color: '#a7f3d0' }}>In Room</span>
            ) : isCalled ? (
              <span style={{ color: '#fef08a' }}>Now Called</span>
            ) : positionInfo.queuePosition ? (
              `#${positionInfo.queuePosition}`
            ) : (
              '--'
            )}
          </div>
          <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>
            {positionInfo.eligibleWaitingAhead !== undefined
              ? `${positionInfo.eligibleWaitingAhead} ahead of you`
              : 'Waiting for call'}
          </span>
        </div>

        <div className="queue-metric">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', opacity: 0.9 }}>
            <Clock size={14} /> Est. Wait Time
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '4px' }}>
            {isConsulting || isCalled ? (
              '0 min'
            ) : positionInfo.estimatedWaitMinutes !== undefined ? (
              `~${positionInfo.estimatedWaitMinutes} min`
            ) : (
              'Calculating...'
            )}
          </div>
          <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>(Estimated duration)</span>
        </div>
      </div>

      <div
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.2)',
          paddingTop: '16px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          fontSize: '0.875rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Stethoscope size={16} />
          <span>{token.doctorId?.userId?.fullName || 'Assigned Doctor'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <MapPin size={16} />
          <span>{token.doctorId?.roomNumber || 'Room 101'} ({token.departmentId?.name || 'Department'})</span>
        </div>
      </div>

      {showActions && onPrint && (
        <div style={{ marginTop: '18px', display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="secondary"
            size="sm"
            icon={Printer}
            onClick={() => onPrint(token)}
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', color: '#fff', border: 'none' }}
          >
            Print Token Slip
          </Button>
        </div>
      )}
    </div>
  );
};

export default QueueTicketCard;
