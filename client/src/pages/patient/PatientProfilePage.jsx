import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, MapPin, Heart, Shield, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { patientService } from '../../services/patientService';

const PatientProfilePage = () => {
  const { user } = useAuth();
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    dateOfBirth: '',
    gender: 'prefer_not_to_say',
    bloodGroup: 'Unknown',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    emergencyName: '',
    emergencyPhone: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (user?.patient?._id) {
          const res = await patientService.getPatientById(user.patient._id);
          if (res.success && res.data) {
            const p = res.data;
            setPatientData(p);
            setFormData({
              fullName: p.userId?.fullName || user.fullName || '',
              phone: p.userId?.phone || user.phone || '',
              dateOfBirth: p.dateOfBirth ? p.dateOfBirth.split('T')[0] : '',
              gender: p.gender || 'prefer_not_to_say',
              bloodGroup: p.bloodGroup || 'Unknown',
              street: p.address?.street || '',
              city: p.address?.city || '',
              state: p.address?.state || '',
              zipCode: p.address?.zipCode || '',
              emergencyName: p.emergencyContact?.name || '',
              emergencyPhone: p.emergencyContact?.phone || ''
            });
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patientData?._id) return;
    setSaving(true);
    setFeedback(null);

    try {
      const res = await patientService.updatePatient(patientData._id, {
        fullName: formData.fullName,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode
        },
        emergencyContact: {
          name: formData.emergencyName,
          phone: formData.emergencyPhone
        }
      });

      if (res.success) {
        setFeedback({ type: 'success', message: 'Profile updated successfully!' });
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update profile.'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading patient record..." />;

  return (
    <div style={{ maxWidth: 780 }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Patient Profile & Settings</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Personal health details, contact phone, and emergency notifications
        </p>
      </div>

      {feedback && <Alert type={feedback.type} message={feedback.message} />}

      <Card>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.5rem'
              }}
            >
              {formData.fullName?.charAt(0) || 'P'}
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{formData.fullName}</h3>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Patient ID: <strong>{patientData?.patientNumber || 'PAT-10001'}</strong> &bull; {user?.email}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                className="form-input"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3">
            <div className="form-group">
              <label className="form-label">Date of Birth</label>
              <input
                type="date"
                className="form-input"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select
                className="form-select"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              >
                <option value="prefer_not_to_say">Prefer not to say</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Blood Group</label>
              <select
                className="form-select"
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
              >
                <option value="Unknown">Unknown</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: '16px', marginBottom: '8px', fontWeight: 700, fontSize: '0.9375rem' }}>
            Emergency Contact Information
          </div>
          <div className="grid grid-cols-2">
            <div className="form-group">
              <label className="form-label">Contact Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="Next of kin / Emergency contact"
                value={formData.emergencyName}
                onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Emergency Phone</label>
              <input
                type="tel"
                className="form-input"
                placeholder="+1 (555) 000-0000"
                value={formData.emergencyPhone}
                onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
            <Button type="submit" variant="primary" icon={Save} loading={saving}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default PatientProfilePage;
