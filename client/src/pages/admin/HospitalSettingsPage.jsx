import React, { useState, useEffect } from 'react';
import { Settings, Save, Building2 } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { adminService } from '../../services/adminService';

const HospitalSettingsPage = () => {
  const [settings, setSettings] = useState({
    hospitalName: '',
    tagline: '',
    address: '',
    contactPhone: '',
    emergencyPhone: '',
    contactEmail: '',
    openingHour: '08:00',
    closingHour: '18:00',
    defaultConsultationMinutes: 15
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    adminService.getHospitalSettings().then((res) => {
      if (res.success && res.data) {
        setSettings(res.data);
      }
      setLoading(false);
    });
  }, []);

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      const res = await adminService.updateHospitalSettings(settings);
      if (res.success) {
        setFeedback({ type: 'success', message: 'Hospital settings updated successfully!' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading hospital configuration..." />;

  return (
    <div style={{ maxWidth: 760 }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Hospital Global Configuration</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Configure institution name, outpatient operating hours, and consultation defaults
        </p>
      </div>

      {feedback && <Alert type={feedback.type} message={feedback.message} />}

      <Card>
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Hospital Institution Name *</label>
            <input
              type="text"
              name="hospitalName"
              className="form-input"
              value={settings.hospitalName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Hospital Tagline / Motto</label>
            <input
              type="text"
              name="tagline"
              className="form-input"
              value={settings.tagline}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Physical Campus Address</label>
            <input
              type="text"
              name="address"
              className="form-input"
              value={settings.address}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2">
            <div className="form-group">
              <label className="form-label">General Contact Phone</label>
              <input
                type="text"
                name="contactPhone"
                className="form-input"
                value={settings.contactPhone}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Emergency Hotline</label>
              <input
                type="text"
                name="emergencyPhone"
                className="form-input"
                value={settings.emergencyPhone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2">
            <div className="form-group">
              <label className="form-label">Contact Email</label>
              <input
                type="email"
                name="contactEmail"
                className="form-input"
                value={settings.contactEmail}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Default Consultation Duration (Mins)</label>
              <input
                type="number"
                name="defaultConsultationMinutes"
                className="form-input"
                value={settings.defaultConsultationMinutes}
                onChange={handleChange}
                min={5}
                max={60}
              />
            </div>
          </div>

          <div className="grid grid-cols-2">
            <div className="form-group">
              <label className="form-label">Opening Hour</label>
              <input
                type="time"
                name="openingHour"
                className="form-input"
                value={settings.openingHour}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Closing Hour</label>
              <input
                type="time"
                name="closingHour"
                className="form-input"
                value={settings.closingHour}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
            <Button type="submit" variant="primary" icon={Save} loading={saving}>
              Save Hospital Settings
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default HospitalSettingsPage;
