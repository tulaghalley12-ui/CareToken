import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Ticket,
  Calendar,
  Clock,
  Activity,
  ShieldCheck,
  ArrowRight,
  Search,
  CheckCircle2,
  Stethoscope,
  Building2,
  Sparkles,
  Users
} from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import { departmentService } from '../../services/departmentService';
import { doctorService } from '../../services/doctorService';
import { tokenService } from '../../services/tokenService';

const HomePage = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [searchTokenId, setSearchTokenId] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deptRes, docRes] = await Promise.all([
          departmentService.getDepartments(),
          doctorService.getDoctors()
        ]);
        if (deptRes.success) setDepartments(deptRes.data.slice(0, 4));
        if (docRes.success) setDoctors(docRes.data.slice(0, 3));
      } catch (err) {
        // Fallback gracefully
      }
    };
    fetchData();
  }, []);

  const handleTrackToken = async (e) => {
    e.preventDefault();
    if (!searchTokenId.trim()) return;

    setSearchLoading(true);
    setSearchError('');
    setSearchResult(null);

    try {
      const res = await tokenService.trackTokenPublic(searchTokenId.trim());
      if (res.success && res.data) {
        setSearchResult(res.data);
      } else {
        setSearchError('Token not found. Please verify the Token ID or Number.');
      }
    } catch (err) {
      setSearchError(err.response?.data?.message || 'Token not found. Please check and try again.');
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #0d9488 100%)',
          color: '#ffffff',
          padding: '80px 20px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '48px', alignItems: 'center' }}>
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(8px)',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                marginBottom: '20px'
              }}
            >
              <Sparkles size={16} /> Intelligent Hospital Queue Management
            </div>

            <h1
              style={{
                fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
                fontWeight: 900,
                lineHeight: 1.15,
                letterSpacing: '-0.03em',
                marginBottom: '20px'
              }}
            >
              Seamless Digital Care. Zero Waiting Confusion.
            </h1>

            <p style={{ fontSize: '1.125rem', lineHeight: '1.6', opacity: 0.9, maxWidth: 540, marginBottom: '32px' }}>
              Replace chaotic waiting rooms with our real-time hospital token system. Book specialist appointments, generate sequential tokens, and monitor live queue positions from anywhere.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
              <Link to="/book">
                <Button size="lg" variant="teal" icon={Calendar}>
                  Book Appointment Now
                </Button>
              </Link>
              <Link to="/live-queue">
                <Button
                  size="lg"
                  variant="secondary"
                  icon={Activity}
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.3)' }}
                >
                  View Live Queue Display
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Token Tracker Card */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              padding: '32px',
              color: 'var(--text-primary)',
              boxShadow: 'var(--shadow-xl)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Ticket size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Check Token Status</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Quick lookup for patients with a Token ID</p>
              </div>
            </div>

            <form onSubmit={handleTrackToken}>
              <div className="form-group">
                <label className="form-label">Enter Token ID (MongoDB ID)</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 67bf42d0a1b2c3d4e5f67890"
                    value={searchTokenId}
                    onChange={(e) => setSearchTokenId(e.target.value)}
                    required
                  />
                  <Button type="submit" loading={searchLoading} icon={Search}>
                    Track
                  </Button>
                </div>
              </div>
            </form>

            {searchError && (
              <div style={{ padding: '10px', background: '#fee2e2', color: '#991b1b', borderRadius: '6px', fontSize: '0.8125rem', marginTop: '12px' }}>
                {searchError}
              </div>
            )}

            {searchResult && (
              <div style={{ marginTop: '16px', padding: '16px', background: '#f8fafc', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>{searchResult.tokenNumber}</strong>
                  <Badge status={searchResult.queueStatus} />
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  <div><strong>Doctor:</strong> {searchResult.doctorId?.userId?.fullName || 'Assigned Doctor'}</div>
                  <div><strong>Department:</strong> {searchResult.departmentId?.name}</div>
                  <div><strong>Queue Position:</strong> #{searchResult.positionInfo?.queuePosition || '1'}</div>
                  <div><strong>Est. Wait:</strong> ~{searchResult.positionInfo?.estimatedWaitMinutes || 0} minutes</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How It Works Walkthrough */}
      <section style={{ padding: '64px 20px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '10px' }}>
            How Digital Hospital Tokens Work
          </h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: 600, margin: '0 auto', fontSize: '1rem' }}>
            A streamlined 4-step workflow designed to eliminate waiting anxiety and physical overcrowding.
          </p>
        </div>

        <div className="grid grid-cols-4">
          {[
            {
              step: '01',
              title: 'Select Department',
              desc: 'Choose from specialized clinical departments including Cardiology, Pediatrics, and Orthopedics.'
            },
            {
              step: '02',
              title: 'Choose Doctor & Slot',
              desc: 'View verified doctor schedules, consultation durations, and pick a convenient available time slot.'
            },
            {
              step: '03',
              title: 'Get Instant Token',
              desc: 'Receive a sequential digital token (e.g. CARD-001) generated atomically with estimated wait times.'
            },
            {
              step: '04',
              title: 'Live Queue Tracking',
              desc: 'Monitor queue status in real-time on your phone or lobby screens until your token is called.'
            }
          ].map((item, idx) => (
            <div key={idx} className="card" style={{ textAlign: 'center', position: 'relative' }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  fontWeight: 800,
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto'
                }}
              >
                {item.step}
              </div>
              <h4 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '8px' }}>{item.title}</h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Departments Section Preview */}
      <section style={{ backgroundColor: 'var(--bg-subtle)', padding: '64px 20px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Medical Specialties & Departments
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
                Dedicated outpatient clinics equipped with dedicated token queues
              </p>
            </div>
            <Link to="/departments" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
              View All <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-4">
            {departments.map((dept) => (
              <Card key={dept._id} className="dept-preview-card">
                <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--teal-light)', color: 'var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <Building2 size={22} />
                </div>
                <h4 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '6px' }}>{dept.name}</h4>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '14px', minHeight: '38px' }}>
                  {dept.description || 'Specialized clinical care & diagnostics.'}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Code: <strong>{dept.departmentCode}</strong></span>
                  <span style={{ color: 'var(--teal)', fontWeight: 600 }}>Limit: {dept.dailyTokenLimit}/day</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Doctor Preview Section */}
      <section style={{ padding: '64px 20px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Consult Our Specialists
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
              Qualified medical experts ready for consultation
            </p>
          </div>
          <Link to="/doctors" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
            Full Directory <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-3">
          {doctors.map((doc) => (
            <Card key={doc._id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.25rem' }}>
                  {doc.userId?.fullName?.charAt(0) || 'D'}
                </div>
                <div>
                  <h4 style={{ fontSize: '1.0625rem', fontWeight: 700 }}>{doc.userId?.fullName}</h4>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--teal)', fontWeight: 600 }}>{doc.specialization}</span>
                </div>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                {doc.qualifications} &bull; {doc.departmentId?.name}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Room: {doc.roomNumber || 'Room 101'}</span>
                <Link to={`/doctors/${doc._id}`}>
                  <Button size="sm" variant="secondary">
                    View Profile
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{ backgroundColor: 'var(--primary)', color: '#ffffff', padding: '48px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '14px' }}>
            Ready to Experience Hassle-Free Healthcare?
          </h2>
          <p style={{ fontSize: '1rem', opacity: 0.9, marginBottom: '24px' }}>
            Book your appointment online in under 2 minutes and track your queue in real time without crowded waiting rooms.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <Link to="/book">
              <Button size="lg" variant="teal">
                Book Consultation
              </Button>
            </Link>
            <Link to="/register">
              <Button size="lg" variant="secondary" style={{ backgroundColor: '#fff', color: 'var(--primary)' }}>
                Register Patient Account
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
