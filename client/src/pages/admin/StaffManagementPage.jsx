import React, { useState } from 'react';
import { UserPlus, UserCog, ShieldCheck, RefreshCw } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import { authService } from '../../services/authService';

const StaffManagementPage = () => {
  const [feedback, setFeedback] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    role: 'receptionist'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);
    try {
      const res = await authService.registerStaff(form);
      if (res.success) {
        setFeedback({
          type: 'success',
          message: `${form.role.toUpperCase()} account for ${form.fullName} created successfully!`
        });
        setModalOpen(false);
        setForm({ fullName: '', email: '', phone: '', password: '', role: 'receptionist' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Creation failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Staff & Role Access Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Provision authorized accounts for receptionists and administrators
          </p>
        </div>

        <Button size="sm" variant="teal" icon={UserPlus} onClick={() => setModalOpen(true)}>
          Add Staff Member
        </Button>
      </div>

      {feedback && <Alert type={feedback.type} message={feedback.message} />}

      <div className="grid grid-cols-2" style={{ gap: '24px' }}>
        <Card title="Receptionist Roles & Permissions">
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '16px' }}>
            Receptionists have operational permission to register walk-in patients, book appointments, generate sequential queue tokens, call waiting patients, and print paper slips.
          </p>
          <div style={{ fontSize: '0.8125rem', color: 'var(--teal)', fontWeight: 600 }}>
            &bull; Safe Front-Desk Queue Controls &bull; No administrative system deletion
          </div>
        </Card>

        <Card title="Administrator Governance">
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '16px' }}>
            Administrators hold hospital-wide authority over clinical departments, doctor scheduling, patient logs, audit trails, and hospital operating parameters.
          </p>
          <div style={{ fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: 600 }}>
            &bull; Full Role Governance &bull; Audit Trail Logging
          </div>
        </Card>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Register Privileged Staff Member">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Sarah Jenkins"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2">
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                className="form-input"
                placeholder="staff@hospital.org"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone *</label>
              <input
                type="tel"
                className="form-input"
                placeholder="+1 (555) 000-0000"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2">
            <div className="form-group">
              <label className="form-label">Assigned Role *</label>
              <select
                className="form-select"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                required
              >
                <option value="receptionist">Receptionist</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Password *</label>
              <input
                type="password"
                className="form-input"
                placeholder="Min 6 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="teal" loading={loading}>Create Staff Account</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StaffManagementPage;
