import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';

const ContactPage = () => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="page-container">
      <div style={{ textAlign: 'center', marginBottom: '40px', paddingTop: '16px' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
          Contact & Hospital Information
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--text-muted)', maxWidth: 600, margin: '0 auto' }}>
          Get in touch with hospital administration, patient helpdesk, or emergency triage.
        </p>
      </div>

      <div className="grid grid-cols-2" style={{ gap: '32px' }}>
        <div>
          <Card title="Hospital Helpdesk & Location">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MapPin size={20} />
                </div>
                <div>
                  <strong style={{ display: 'block', color: 'var(--text-primary)' }}>Hospital Campus</strong>
                  <span>742 Evergreen Healthcare Way, Medical District, Metro City</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--teal-light)', color: 'var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Phone size={20} />
                </div>
                <div>
                  <strong style={{ display: 'block', color: 'var(--text-primary)' }}>Phone Lines</strong>
                  <span>Reception: +1 (555) 019-2831</span>
                  <div style={{ color: '#b91c1c', fontWeight: 600, marginTop: '2px' }}>Emergency Triage: +1 (555) 911-HELP (24/7)</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Mail size={20} />
                </div>
                <div>
                  <strong style={{ display: 'block', color: 'var(--text-primary)' }}>Inquiries & Support</strong>
                  <span>care@cityhospital.org</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--teal-light)', color: 'var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Clock size={20} />
                </div>
                <div>
                  <strong style={{ display: 'block', color: 'var(--text-primary)' }}>Outpatient Clinic Hours</strong>
                  <span>Mon - Fri: 08:00 AM - 06:00 PM</span>
                  <div>Saturday: 08:30 AM - 03:00 PM (Emergency 24/7)</div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div>
          <Card title="Send an Inquiry">
            {submitted ? (
              <Alert type="success" message="Thank you! Your message has been received by hospital patient relations." />
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <input
                    type="text"
                    className="form-input"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Message</label>
                  <textarea
                    rows={4}
                    className="form-textarea"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" variant="primary" icon={Send} style={{ width: '100%' }}>
                  Submit Message
                </Button>
              </form>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
