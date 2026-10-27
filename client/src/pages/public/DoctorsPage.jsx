import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Stethoscope, Clock, MapPin, Calendar } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { doctorService } from '../../services/doctorService';
import { departmentService } from '../../services/departmentService';

const DoctorsPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInitial = async () => {
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
    fetchInitial();
  }, []);

  const filteredDoctors = doctors.filter((doc) => {
    const matchesDept = !selectedDept || doc.departmentId?._id === selectedDept;
    const matchesSearch =
      !searchQuery ||
      doc.userId?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specialization?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.departmentId?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  return (
    <div className="page-container">
      <div style={{ textAlign: 'center', marginBottom: '36px', paddingTop: '16px' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
          Find Hospital Doctors & Specialists
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--text-muted)', maxWidth: 600, margin: '0 auto' }}>
          Browse verified physicians, check consultation durations and clinic room locations.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="card"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '32px',
          padding: '16px 20px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1', minWidth: '240px' }}>
          <Search size={18} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search doctor name or specialization..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '220px' }}>
          <Filter size={18} style={{ color: 'var(--text-muted)' }} />
          <select
            className="form-select"
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading doctors directory..." />
      ) : filteredDoctors.length === 0 ? (
        <EmptyState
          title="No doctors match your criteria"
          description="Try selecting a different department or clearing your search term."
          actionLabel="Clear Filters"
          onAction={() => {
            setSelectedDept('');
            setSearchQuery('');
          }}
        />
      ) : (
        <div className="grid grid-cols-3">
          {filteredDoctors.map((doc) => (
            <Card key={doc._id}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '14px' }}>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: '50%',
                    background: 'var(--primary-light)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '1.25rem',
                    flexShrink: 0
                  }}
                >
                  {doc.userId?.fullName?.charAt(0) || 'D'}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>{doc.userId?.fullName}</h3>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--teal)', fontWeight: 600 }}>
                    {doc.specialization}
                  </span>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {doc.departmentId?.name}
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px', margin: '14px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={14} style={{ color: 'var(--primary)' }} />
                  <span>Avg Duration: <strong>{doc.consultationDurationMinutes} mins</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={14} style={{ color: 'var(--primary)' }} />
                  <span>Room: {doc.roomNumber || 'Consultation Room'}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
                <Link to={`/doctors/${doc._id}`} style={{ flex: 1 }}>
                  <Button size="sm" variant="secondary" style={{ width: '100%' }}>
                    View Profile
                  </Button>
                </Link>
                <Link to={`/book?doctorId=${doc._id}&departmentId=${doc.departmentId?._id}`} style={{ flex: 1 }}>
                  <Button size="sm" variant="primary" icon={Calendar} style={{ width: '100%' }}>
                    Book
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorsPage;
