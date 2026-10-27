import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { Printer, Check } from 'lucide-react';

const PrintReceiptModal = ({ isOpen, onClose, token }) => {
  if (!token) return null;

  const handlePrint = () => {
    window.print();
  };

  const patientName =
    token.patientId?.userId?.fullName ||
    token.patientName ||
    'Registered Patient';
  const doctorName =
    token.doctorId?.userId?.fullName ||
    token.doctorName ||
    'Assigned Doctor';
  const room = token.doctorId?.roomNumber || token.roomNumber || 'Room 101';
  const deptName = token.departmentId?.name || token.departmentName || 'Outpatient Clinic';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Hospital Token Slip" maxWidth={440}>
      <div className="printable-receipt" style={{ padding: '20px', border: '1px dashed #cbd5e1', borderRadius: '8px' }}>
        <div style={{ textAlign: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '14px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-dark)' }}>
            CARETOKEN HOSPITAL
          </h2>
          <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Patient Queue Management & Consultation Receipt
          </p>
        </div>

        <div style={{ textAlign: 'center', margin: '16px 0' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
            Your Token Number
          </span>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '2px' }}>
            {token.tokenNumber}
          </div>
          <span style={{ fontSize: '0.8rem', padding: '2px 10px', background: '#dbeafe', color: '#1e40af', borderRadius: '12px', fontWeight: 700 }}>
            {token.queueStatus || 'WAITING'}
          </span>
        </div>

        <div style={{ fontSize: '0.875rem', lineHeight: '1.8', borderTop: '1px dashed #cbd5e1', paddingTop: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#64748b' }}>Patient:</span>
            <strong>{patientName}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#64748b' }}>Department:</span>
            <span>{deptName}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#64748b' }}>Doctor:</span>
            <span>{doctorName}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#64748b' }}>Consultation Room:</span>
            <strong>{room}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#64748b' }}>Service Date:</span>
            <span>{token.serviceDate || new Date().toISOString().split('T')[0]}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#64748b' }}>Issued At:</span>
            <span>{new Date(token.issuedAt || Date.now()).toLocaleTimeString()}</span>
          </div>
        </div>

        <div style={{ marginTop: '16px', padding: '10px', background: '#f8fafc', borderRadius: '6px', fontSize: '0.75rem', color: '#64748b', textAlign: 'center' }}>
          Please watch the digital display screens in the waiting lounge. You will be called by your token number when your turn arrives.
        </div>
      </div>

      <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
        <Button variant="primary" icon={Printer} onClick={handlePrint}>
          Print Slip
        </Button>
      </div>
    </Modal>
  );
};

export default PrintReceiptModal;
