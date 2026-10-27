import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, CheckCircle, ArrowRight } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { patientService } from '../../services/patientService';

const WalkInRegistrationPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    dateOfBirth: '',
    gender: 'prefer_not_to_say',
    bloodGroup: 'Unknown',
    emergencyContactName: '',
    emergencyContactPhone: ''
  });

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [registeredPatient, setRegisteredPatient] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    try {
      const res = await patientService.createWalkInPatient({
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        emergencyContact: {
          name: formData.emergencyContactName,
          phone: formData.emergencyContactPhone
        }
      });

      if (res.success) {
        setFeedback({
          type: 'success',
          message: `Walk-in patient registered with Patient Number: ${res.data.patientNumber}`
        });
        setRegisteredPatient(res.data);
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to register walk-in patient.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 760 }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Walk-in Patient Registration</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Quickly register on-site patients arriving at the reception desk
        </p>
      </div>

      {feedback && <Alert type={feedback.type} message={feedback.message} />}

      {registeredPatient ? (
        <Card style={{ textAlign: 'center', padding: '32px' }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: '#d1fae5',
              color: '#065f46',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}
          >
            <CheckCircle size={32} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Registration Complete</h3>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', margin: '8px 0 20px 0' }}>
            Patient: <strong>{registeredPatient.fullName}</strong> &bull; Number:{' '}
            <strong style={{ color: 'var(--primary)' }}>{registeredPatient.patientNumber}</strong>
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <Button
              variant="secondary"
              onClick={() => {
                setRegisteredPatient(null);
                setFormData({
                  fullName: '',
                  phone: '',
                  email: '',
                  dateOfBirth: '',
                  gender: 'prefer_not_to_say',
                  bloodGroup: 'Unknown',
                  emergencyContactName: '',
                  emergencyContactPhone: ''
                });
              }}
            >
              Register Another Walk-in
            </Button>
            <Button
              variant="teal"
              icon={ArrowRight}
              onClick={() =>
                navigate(`/receptionist/book-appointment?patientId=${registeredPatient._id}`)
              }
            >
              Issue Token for Patient
            </Button>
          </div>
        </Card>
      ) : (
        <Card>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2">
              <div className="form-group">
                <label className="form-label">Patient Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  className="form-input"
                  placeholder="e.g. Maria Gonzalez"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-input"
                  placeholder="e.g. +1 (555) 345-6789"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address (Optional)</label>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="Optional for digital notifications"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-3">
              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  className="form-input"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Gender</label>
                <select
                  name="gender"
                  className="form-select"
                  value={formData.gender}
                  onChange={handleChange}
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
                  name="bloodGroup"
                  className="form-select"
                  value={formData.bloodGroup}
                  onChange={handleChange}
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

            <div className="grid grid-cols-2">
              <div className="form-group">
                <label className="form-label">Emergency Contact Name</label>
                <input
                  type="text"
                  name="emergencyContactName"
                  className="form-input"
                  placeholder="Companion / Family member"
                  value={formData.emergencyContactName}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Emergency Phone</label>
                <input
                  type="tel"
                  name="emergencyContactPhone"
                  className="form-input"
                  placeholder="+1 (555) 000-0000"
                  value={formData.emergencyContactPhone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <Button type="submit" variant="teal" icon={UserPlus} loading={loading}>
                Register Walk-in Patient
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};

export default WalkInRegistrationPage;
