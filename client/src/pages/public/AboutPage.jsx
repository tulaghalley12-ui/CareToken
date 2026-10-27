import React from 'react';
import { ShieldCheck, HeartPulse, Clock, Award, Users, CheckCircle } from 'lucide-react';
import Card from '../../components/common/Card';

const AboutPage = () => {
  return (
    <div className="page-container">
      <div style={{ textAlign: 'center', marginBottom: '48px', paddingTop: '16px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px' }}>
          About CareToken Hospital System
        </h1>
        <p style={{ fontSize: '1.125rem', color: 'var(--text-muted)', maxWidth: '700px', margin: '0 auto' }}>
          Pioneering modernized healthcare logistics, patient dignity, and transparent digital waiting systems.
        </p>
      </div>

      <div className="grid grid-cols-2" style={{ alignItems: 'center', gap: '40px', marginBottom: '60px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>
            Transforming Hospital Queues Into Transparent Digital Care
          </h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '16px' }}>
            Traditional hospital waiting lounges have long suffered from physical congestion, lack of appointment visibility, and patient anxiety. CareToken was engineered from the ground up to restore calm and precision to outpatient operations.
          </p>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '24px' }}>
            Our smart queue engine assigns sequential tokens atomically across medical departments, calculates dynamic waiting estimates, and alerts patients in real time when their turn arrives.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
            {[
              'Zero Overcrowding in Waiting Areas',
              'Atomic Concurrency Safe Numbering',
              'Real-Time WebSocket Synchronization',
              'Integrated Doctor & Receptionist Portals'
            ].map((text, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', fontWeight: 600 }}>
                <CheckCircle size={18} style={{ color: 'var(--teal)', flexShrink: 0 }} />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: 'var(--primary-light)', padding: '36px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--primary-border)' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '16px' }}>
            Our Clinical Mission
          </h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '20px' }}>
            "To deliver compassionate, timely, and organized healthcare by leveraging digital innovation, respecting patient time, and empowering medical professionals with high-efficiency queue tools."
          </p>
          <div style={{ display: 'flex', gap: '20px', borderTop: '1px solid var(--primary-border)', paddingTop: '20px' }}>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)' }}>99.8%</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>On-Time Token Tracking</div>
            </div>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--teal)' }}>5+</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Clinical Departments</div>
            </div>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-dark)' }}>24/7</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>System Availability</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
