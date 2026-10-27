import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Ticket,
  Users,
  Clock,
  Settings,
  Activity,
  UserCheck,
  Building2,
  FileText,
  BarChart2,
  CalendarCheck,
  ShieldAlert,
  UserPlus,
  PlayCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();
  if (!user) return null;

  const role = user.role;

  const patientLinks = [
    { to: '/patient/dashboard', label: 'My Dashboard', icon: LayoutDashboard },
    { to: '/book', label: 'Book Appointment', icon: Calendar },
    { to: '/patient/tokens', label: 'My Tokens', icon: Ticket },
    { to: '/patient/live-queue', label: 'Live Queue Status', icon: Activity },
    { to: '/patient/history', label: 'Appointment History', icon: CalendarCheck },
    { to: '/patient/profile', label: 'Profile & Settings', icon: Settings }
  ];

  const doctorLinks = [
    { to: '/doctor/dashboard', label: 'Doctor Console', icon: LayoutDashboard },
    { to: '/doctor/queue', label: 'Patient Queue Control', icon: PlayCircle },
    { to: '/doctor/appointments', label: "Today's Appointments", icon: CalendarCheck },
    { to: '/doctor/schedule', label: 'My Working Schedule', icon: Clock }
  ];

  const receptionistLinks = [
    { to: '/receptionist/dashboard', label: 'Reception Dashboard', icon: LayoutDashboard },
    { to: '/receptionist/patient-register', label: 'Walk-in Registration', icon: UserPlus },
    { to: '/receptionist/book-appointment', label: 'Book Appointment', icon: Calendar },
    { to: '/receptionist/queue', label: 'Active Queue & Tokens', icon: Ticket }
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Admin Overview', icon: LayoutDashboard },
    { to: '/admin/doctors', label: 'Doctor Management', icon: UserCheck },
    { to: '/admin/patients', label: 'Patient Management', icon: Users },
    { to: '/admin/staff', label: 'Staff Management', icon: UserPlus },
    { to: '/admin/departments', label: 'Departments', icon: Building2 },
    { to: '/admin/appointments', label: 'All Appointments', icon: Calendar },
    { to: '/admin/queues', label: 'Queue Monitoring', icon: Activity },
    { to: '/admin/reports', label: 'Token Statistics', icon: BarChart2 },
    { to: '/admin/logs', label: 'System Activity Logs', icon: FileText },
    { to: '/admin/settings', label: 'Hospital Settings', icon: Settings }
  ];

  let links = [];
  if (role === 'patient') links = patientLinks;
  else if (role === 'doctor') links = doctorLinks;
  else if (role === 'receptionist') links = receptionistLinks;
  else if (role === 'admin') links = adminLinks;

  return (
    <aside className="dashboard-sidebar">
      <div style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Logged In As
        </div>
        <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
          {user.fullName}
        </div>
        <div style={{ display: 'inline-block', marginTop: '6px' }}>
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              padding: '2px 8px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)'
            }}
          >
            {user.role}
          </span>
        </div>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                transition: 'all 0.15s ease'
              })}
            >
              <Icon size={18} />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
