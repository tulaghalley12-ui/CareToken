import React, { useState } from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { CheckCircle2, Calendar, Ticket, Printer, ArrowRight } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import QueueTicketCard from '../../components/common/QueueTicketCard';
import PrintReceiptModal from '../../components/common/PrintReceiptModal';

const AppointmentConfirmationPage = () => {
  const location = useLocation();
  const [printOpen, setPrintOpen] = useState(false);

  const appointment = location.state?.appointment;
  const token = location.state?.token;

  if (!appointment || !token) {
    return <Navigate to="/patient/dashboard" replace />;
  }

  return (
    <div className="page-container" style={{ maxWidth: 650, textAlign: 'center' }}>
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: 'var(--status-completed-bg)',
          color: 'var(--status-completed-text)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px auto'
        }}
      >
        <CheckCircle2 size={36} />
      </div>

      <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
        Appointment & Token Confirmed!
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginBottom: '32px' }}>
        Your consultation has been booked and an official hospital queue token has been generated.
      </p>

      {/* Ticket card */}
      <div style={{ textAlign: 'left', marginBottom: '28px' }}>
        <QueueTicketCard token={token} onPrint={() => setPrintOpen(true)} />
      </div>

      <div className="card" style={{ textAlign: 'left', marginBottom: '28px', padding: '20px' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>Booking Summary</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Appointment Date:</span>
            <strong>{appointment.appointmentDate}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Scheduled Time:</span>
            <strong>{appointment.appointmentTime}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Type:</span>
            <span>{appointment.appointmentType}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
        <Button variant="secondary" icon={Printer} onClick={() => setPrintOpen(true)}>
          Print Token Slip
        </Button>
        <Link to="/patient/dashboard">
          <Button variant="primary" icon={ArrowRight}>
            Go to My Dashboard
          </Button>
        </Link>
      </div>

      <PrintReceiptModal isOpen={printOpen} onClose={() => setPrintOpen(false)} token={token} />
    </div>
  );
};

export default AppointmentConfirmationPage;
