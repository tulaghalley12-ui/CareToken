import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Calendar, Users, ArrowRight } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { departmentService } from '../../services/departmentService';

const DepartmentsPage = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await departmentService.getDepartments();
        if (res.success) setDepartments(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDepartments();
  }, []);

  return (
    <div className="page-container">
      <div style={{ textAlign: 'center', marginBottom: '40px', paddingTop: '16px' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '10px' }}>
          Hospital Departments & Specialized Clinics
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--text-muted)', maxWidth: 650, margin: '0 auto' }}>
          Explore our outpatient clinical departments, daily token limits, and certified healthcare specialists.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading departments..." />
      ) : (
        <div className="grid grid-cols-3">
          {departments.map((dept) => (
            <Card key={dept._id} className="dept-card">
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px'
                }}
              >
                <Building2 size={24} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{dept.name}</h3>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: 'var(--bg-subtle)',
                    color: 'var(--text-secondary)'
                  }}
                >
                  {dept.departmentCode}
                </span>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '20px', minHeight: '48px' }}>
                {dept.description || 'Dedicated clinical department offering outpatient evaluations and therapies.'}
              </p>

              <div
                style={{
                  borderTop: '1px solid var(--border)',
                  paddingTop: '14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.8125rem'
                }}
              >
                <span style={{ color: 'var(--text-muted)' }}>
                  Daily Token Limit: <strong>{dept.dailyTokenLimit}</strong>
                </span>
                <Link to={`/book?departmentId=${dept._id}`}>
                  <Button size="sm" variant="primary" icon={Calendar}>
                    Book Slot
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

export default DepartmentsPage;
