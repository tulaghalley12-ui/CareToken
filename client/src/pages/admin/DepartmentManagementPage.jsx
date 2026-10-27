import React, { useState, useEffect } from 'react';
import { Building2, Plus, Edit, Trash2, RefreshCw } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import { departmentService } from '../../services/departmentService';

const DepartmentManagementPage = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  // Create Modal
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    departmentCode: '',
    description: '',
    dailyTokenLimit: 50
  });
  const [createLoading, setCreateLoading] = useState(false);

  // Edit Modal
  const [editOpen, setEditOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    departmentCode: '',
    description: '',
    dailyTokenLimit: 50,
    isActive: true
  });
  const [editLoading, setEditLoading] = useState(false);

  const fetchDepts = async () => {
    try {
      const res = await departmentService.getDepartments(true);
      if (res.success) setDepartments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepts();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setFeedback(null);
    try {
      const res = await departmentService.createDepartment(createForm);
      if (res.success) {
        setFeedback({ type: 'success', message: 'Department created successfully!' });
        setCreateOpen(false);
        setCreateForm({ name: '', departmentCode: '', description: '', dailyTokenLimit: 50 });
        fetchDepts();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Creation failed' });
    } finally {
      setCreateLoading(false);
    }
  };

  const openEdit = (dept) => {
    setEditingDept(dept);
    setEditForm({
      name: dept.name,
      departmentCode: dept.departmentCode,
      description: dept.description || '',
      dailyTokenLimit: dept.dailyTokenLimit || 50,
      isActive: dept.isActive
    });
    setEditOpen(true);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!editingDept) return;
    setEditLoading(true);
    setFeedback(null);
    try {
      const res = await departmentService.updateDepartment(editingDept._id, editForm);
      if (res.success) {
        setFeedback({ type: 'success', message: 'Department updated successfully!' });
        setEditOpen(false);
        fetchDepts();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Update failed' });
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('Are you sure you want to soft-deactivate this department?')) return;
    try {
      const res = await departmentService.deleteDepartment(id);
      if (res.success) {
        setFeedback({ type: 'info', message: 'Department deactivated successfully.' });
        fetchDepts();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Deactivation failed' });
    }
  };

  if (loading) return <LoadingSpinner text="Loading departments..." />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Department Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Manage outpatient clinical departments, unique token prefixes, and daily limits
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Button size="sm" variant="secondary" icon={RefreshCw} onClick={fetchDepts}>
            Refresh
          </Button>
          <Button size="sm" variant="teal" icon={Plus} onClick={() => setCreateOpen(true)}>
            Add Department
          </Button>
        </div>
      </div>

      {feedback && <Alert type={feedback.type} message={feedback.message} />}

      <Card title={`Configured Departments (${departments.length})`}>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Department Name</th>
                <th>Description</th>
                <th>Daily Limit</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept) => (
                <tr key={dept._id} style={{ opacity: dept.isActive ? 1 : 0.6 }}>
                  <td style={{ fontWeight: 800, color: 'var(--primary)' }}>
                    {dept.departmentCode}
                  </td>
                  <td><strong>{dept.name}</strong></td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', maxWidth: '300px' }}>
                    {dept.description || '--'}
                  </td>
                  <td><strong>{dept.dailyTokenLimit}</strong> tokens</td>
                  <td>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: dept.isActive ? '#059669' : '#dc2626'
                      }}
                    >
                      {dept.isActive ? 'ACTIVE' : 'DEACTIVATED'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <Button size="sm" variant="secondary" icon={Edit} onClick={() => openEdit(dept)}>
                        Edit
                      </Button>
                      {dept.isActive && (
                        <Button
                          size="sm"
                          variant="danger"
                          icon={Trash2}
                          onClick={() => handleDeactivate(dept._id)}
                        >
                          Deactivate
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Add Clinical Department">
        <form onSubmit={handleCreate}>
          <div className="form-group">
            <label className="form-label">Department Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Cardiology"
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2">
            <div className="form-group">
              <label className="form-label">Department Code (Prefix) *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. CARD"
                maxLength={6}
                value={createForm.departmentCode}
                onChange={(e) => setCreateForm({ ...createForm, departmentCode: e.target.value.toUpperCase() })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Daily Token Limit *</label>
              <input
                type="number"
                className="form-input"
                value={createForm.dailyTokenLimit}
                onChange={(e) => setCreateForm({ ...createForm, dailyTokenLimit: Number(e.target.value) })}
                min={1}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              rows={3}
              className="form-textarea"
              placeholder="Clinical summary and outpatient care scope..."
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button type="submit" variant="teal" loading={createLoading}>Create Department</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Department">
        <form onSubmit={handleEdit}>
          <div className="form-group">
            <label className="form-label">Department Name</label>
            <input
              type="text"
              className="form-input"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2">
            <div className="form-group">
              <label className="form-label">Department Code</label>
              <input
                type="text"
                className="form-input"
                value={editForm.departmentCode}
                onChange={(e) => setEditForm({ ...editForm, departmentCode: e.target.value.toUpperCase() })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Daily Token Limit</label>
              <input
                type="number"
                className="form-input"
                value={editForm.dailyTokenLimit}
                onChange={(e) => setEditForm({ ...editForm, dailyTokenLimit: Number(e.target.value) })}
                min={1}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              rows={3}
              className="form-textarea"
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            />
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              id="deptActiveCheck"
              checked={editForm.isActive}
              onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
              style={{ width: '18px', height: '18px' }}
            />
            <label htmlFor="deptActiveCheck" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
              Department is Active
            </label>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Button variant="secondary" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" loading={editLoading}>Save Changes</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DepartmentManagementPage;
