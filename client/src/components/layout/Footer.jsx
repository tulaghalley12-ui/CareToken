import React from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse, Phone, Mail, MapPin, Clock, ShieldCheck } from 'lucide-react';

const Footer = () => {
  return (
    <footer
      style={{
        backgroundColor: '#ffffff',
        borderTop: '1px solid var(--border)',
        marginTop: 'auto',
        padding: '48px 20px 24px 20px'
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '32px',
          paddingBottom: '32px',
          borderBottom: '1px solid var(--border)'
        }}
      >
        {/* Hospital Brand & Intro */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--primary)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <HeartPulse size={18} />
            </div>
            <span style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              CareToken Hospital
            </span>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '16px' }}>
            Transforming hospital waiting rooms into seamless digital experiences with real-time queue tracking and token management.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--teal)', fontWeight: 600 }}>
            <ShieldCheck size={16} /> ISO 9001 Patient Care Standards
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>
            Quick Links
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.875rem' }}>
            <li><Link to="/book" style={{ color: 'var(--text-secondary)' }}>Book Appointment</Link></li>
            <li><Link to="/live-queue" style={{ color: 'var(--text-secondary)' }}>Live Queue Status</Link></li>
            <li><Link to="/departments" style={{ color: 'var(--text-secondary)' }}>Medical Departments</Link></li>
            <li><Link to="/doctors" style={{ color: 'var(--text-secondary)' }}>Doctors Directory</Link></li>
            <li><Link to="/login" style={{ color: 'var(--text-secondary)' }}>Patient / Staff Portal</Link></li>
          </ul>
        </div>

        {/* Operating Hours */}
        <div>
          <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>
            Operating Hours
          </h4>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} style={{ color: 'var(--primary)' }} />
              <span>Mon - Fri: 08:00 AM - 06:00 PM</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} style={{ color: 'var(--primary)' }} />
              <span>Saturday: 08:30 AM - 03:00 PM</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b91c1c', fontWeight: 600 }}>
              <HeartPulse size={16} />
              <span>Emergency Services: 24/7 Available</span>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div>
          <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>
            Hospital Contact
          </h4>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <MapPin size={16} style={{ color: 'var(--primary)', marginTop: '3px', flexShrink: 0 }} />
              <span>742 Evergreen Healthcare Way, Medical District</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Phone size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <span>Helpdesk: +1 (555) 019-2831</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <span>care@cityhospital.org</span>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          paddingTop: '20px',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          fontSize: '0.75rem',
          color: 'var(--text-muted)'
        }}
      >
        <p>&copy; {new Date().getFullYear()} CareToken Hospital Management System. All rights reserved.</p>
        <p>Built for responsive digital healthcare, queue tracking, and token management.</p>
      </div>
    </footer>
  );
};

export default Footer;
