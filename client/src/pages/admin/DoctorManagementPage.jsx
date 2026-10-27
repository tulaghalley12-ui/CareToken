import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, Edit, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import { doctorService } from '../../services/doctorService';
import { departmentService } from '../../services/departmentService';
import { authService } from '../../services/authService';

const DoctorManagementPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  // Create Doctor Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    departmentId: '',
    specialization: '',
    qualifications: '',
    consultationDurationMinutes: 15,
    roomNumber: 'Room 101'
  });
  const [createLoading, setCreateLoading] = useState(false);

  // Edit Doctor Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [editForm, setEditForm] = useState({
    specialization: '',
    qualifications: '',
    consultationDurationMinutes: 15,
    roomNumber: '',
    isAvailable: true,
    departmentId: ''
  });
  const [editLoading, setEditLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [docRes, deptRes] = await Promise.all([
        doctorService.getDoctors(),
        departmentService.getDepartments()
      ]);
      if (docRes.success) setDoctors(docRes.data);
      if (deptRes.success) setDepartments(deptRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setFeedback(null);
    try {
      const res = await authService.registerStaff({
        ...createForm,
        role: 'doctor'
      });
      if (res.success) {
        setFeedback({ type: 'success', message: 'Doctor account created successfully!' });
        setCreateModalOpen(false);
        setCreateForm({
          fullName: '',
          email: '',
          phone: '',
          password: '',
          departmentId: '',
          specialization: '',
          qualifications: '',
          consultationDurationMinutes: 15,
          roomNumber: 'Room 101'
        });
        fetchData();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Creation failed' });
    } finally {
      setCreateLoading(false);
    }
  };

  const openEdit = (doc) => {
    setEditingDoctor(doc);
    setEditForm({
      specialization: doc.specialization,
      qualifications: doc.qualifications || '',
      consultationDurationMinutes: doc.consultationDurationMinutes || 15,
      roomNumber: doc.roomNumber || '',
      isAvailable: doc.isAvailable,
      departmentId: doc.departmentId?._id || ''
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingDoctor) return;
    setEditLoading(true);
    setFeedback(null);
    try {
      const res = await doctorService.updateDoctor(editingDoctor._id, editForm);
      if (res.success) {
        setFeedback({ type: 'success', message: 'Doctor profile updated successfully!' });
        setEditModalOpen(false);
        fetchData();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Update failed' });
    } finally {
      setEditLoading(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading doctors directory..." />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Doctor Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Create doctor accounts, configure clinical departments, and manage consultation settings
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Button size="sm" variant="secondary" icon={RefreshCw} onClick={fetchData}>
            Refresh
          </Button>
          <Button
            size="sm"
            variant="teal"
            icon={Plus}
            onClick={() => setCreateModalOpen(true)}
          >
            Add New Doctor
          </Button>
        </div>
      </div>

      {feedback && <Alert type={feedback.type} message={feedback.message} />}

      <Card title={`Active Hospital Doctors (${doctors.length})`}>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Doctor #</th>
                <th>Doctor Name</th>
                <th>Department</th>
                <th>Specialization</th>
                <th>Room</th>
                <th>Avg Duration</th>
                <th>Practicing</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((doc) => (
                <tr key={doc._id}>
                  <td style={{ fontWeight: 700 }}>{doc.doctorNumber}</td>
                  <td>
                    <strong>{doc.userId?.fullName}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {doc.userId?.email}
                    </div>
                  </td>
                  <td>{doc.departmentId?.name}</td>
                  <td>{doc.specialization}</td>
                  <td><strong>{doc.roomNumber}</strong></td>
                  <td>{doc.consultationDurationMinutes} mins</td>
                  <td>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: doc.isAvailable ? '#059669' : '#dc2626'
                      }}
                    >
                      {doc.isAvailable ? 'AVAILABLE' : 'UNAVAILABLE'}
                    </span>
                  </td>
                  <td>
                    <Button size="sm" variant="secondary" icon={Edit} onClick={() => openEdit(doc)}>
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Doctor Account"
      >
        <form onSubmit={handleCreateSubmit}>
          <div className="grid grid-cols-2">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Dr. Full Name"
                value={createForm.fullName}
                onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                className="form-input"
                placeholder="doctor@hospital.org"
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2">
            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input
                type="tel"
                className="form-input"
                placeholder="+1 (555) 000-0000"
                value={createForm.phone}
                onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Initial Password *</label>
              <input
                type="password"
                className="form-input"
                placeholder="Min 6 characters"
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2">
            <div className="form-group">
              <label className="form-label">Department *</label>
              <select
                className="form-select"
                value={createForm.departmentId}
                onChange={(e) => setCreateForm({ ...createForm, departmentId: e.target.value })}
                required
              >
                <option value="">-- Select Department --</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Specialization *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Cardiologist"
                value={createForm.specialization}
                onChange={(e) => setCreateForm({ ...createForm, specialization: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2">
            <div className="form-group">
              <label className="form-label">Room Number</label>
              <input
                type="text"
                className="form-input"
                value={createForm.roomNumber}
                onChange={(e) => setCreateForm({ ...createForm, roomNumber: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Consultation Duration (Mins)</label>
              <input
                type="number"
                className="form-input"
                value={createForm.consultationDurationMinutes}
                onChange={(e) => setCreateForm({ ...createForm, consultationDurationMinutes: Number(e.target.value) })}
                min={5}
                max={60}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
            <Button variant="secondary" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="teal" loading={createLoading}>
              Create Doctor
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Doctor Profile"
      >
        <form onSubmit={handleEditSubmit}>
          <div className="form-group">
            <label className="form-label">Specialization</label>
            <input
              type="text"
              className="form-input"
              value={editForm.specialization}
              onChange={(e) => setEditForm({ ...editForm, specialization: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Qualifications</label>
            <input
              type="text"
              className="form-input"
              value={editForm.qualifications}
              onChange={(e) => setEditForm({ ...editForm, qualifications: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2">
            <div className="form-group">
              <label className="form-label">Room Number</label>
              <input
                type="text"
                className="form-input"
                value={editForm.roomNumber}
                onChange={(e) => setEditForm({ ...editForm, roomNumber: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Consultation Duration (Mins)</label>
              <input
                type="number"
                className="form-input"
                value={editForm.consultationDurationMinutes}
                onChange={(e) => setEditForm({ ...editForm, consultationDurationMinutes: Number(e.target.value) })}
                min={5}
                max={60}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Department</label>
            <select
              className="form-select"
              value={editForm.departmentId}
              onChange={(e) => setEditForm({ ...editForm, departmentId: e.target.value })}
            >
              {departments.map((d) => (
                <option key={d._id} value={d._id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              id="isAvailCheck"
              checked={editForm.isAvailable}
              onChange={(e) => setEditForm({ ...editForm, isAvailable: e.target.checked })}
              style={{ width: '18px', height: '18px' }}
            />
            <label htmlFor="isAvailCheck" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
              Doctor is Available for New Appointments
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
            <Button variant="secondary" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={editLoading}>
              Save Updates
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DoctorManagementPage;
