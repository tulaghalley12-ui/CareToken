import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Layouts
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Public Pages
import HomePage from './pages/public/HomePage';
import AboutPage from './pages/public/AboutPage';
import DepartmentsPage from './pages/public/DepartmentsPage';
import DoctorsPage from './pages/public/DoctorsPage';
import DoctorProfilePage from './pages/public/DoctorProfilePage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import ContactPage from './pages/public/ContactPage';
import PublicLiveQueuePage from './pages/public/PublicLiveQueuePage';

// Patient Pages
import PatientDashboard from './pages/patient/PatientDashboard';
import BookAppointmentPage from './pages/patient/BookAppointmentPage';
import AppointmentConfirmationPage from './pages/patient/AppointmentConfirmationPage';
import MyTokensPage from './pages/patient/MyTokensPage';
import AppointmentHistoryPage from './pages/patient/AppointmentHistoryPage';
import PatientProfilePage from './pages/patient/PatientProfilePage';

// Doctor Pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorAppointmentsPage from './pages/doctor/DoctorAppointmentsPage';
import DoctorQueueManagementPage from './pages/doctor/DoctorQueueManagementPage';
import DoctorSchedulePage from './pages/doctor/DoctorSchedulePage';

// Receptionist Pages
import ReceptionistDashboard from './pages/receptionist/ReceptionistDashboard';
import WalkInRegistrationPage from './pages/receptionist/WalkInRegistrationPage';
import ReceptionistBookingPage from './pages/receptionist/ReceptionistBookingPage';
import ReceptionistQueuePage from './pages/receptionist/ReceptionistQueuePage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import DoctorManagementPage from './pages/admin/DoctorManagementPage';
import PatientManagementPage from './pages/admin/PatientManagementPage';
import StaffManagementPage from './pages/admin/StaffManagementPage';
import DepartmentManagementPage from './pages/admin/DepartmentManagementPage';
import AppointmentManagementPage from './pages/admin/AppointmentManagementPage';
import QueueMonitoringPage from './pages/admin/QueueMonitoringPage';
import TokenReportsPage from './pages/admin/TokenReportsPage';
import HospitalSettingsPage from './pages/admin/HospitalSettingsPage';
import ActivityLogsPage from './pages/admin/ActivityLogsPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <div className="app-container">
            <Navbar />
            <div className="main-content">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/departments" element={<DepartmentsPage />} />
                <Route path="/doctors" element={<DoctorsPage />} />
                <Route path="/doctors/:id" element={<DoctorProfilePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/live-queue" element={<PublicLiveQueuePage />} />

                {/* Patient Routes */}
                <Route element={<ProtectedRoute allowedRoles={['patient', 'admin']} />}>
                  <Route element={<DashboardLayout />}>
                    <Route path="/patient/dashboard" element={<PatientDashboard />} />
                    <Route path="/patient/tokens" element={<MyTokensPage />} />
                    <Route path="/patient/live-queue" element={<PublicLiveQueuePage />} />
                    <Route path="/patient/history" element={<AppointmentHistoryPage />} />
                    <Route path="/patient/profile" element={<PatientProfilePage />} />
                  </Route>
                  {/* Standalone booking / confirmation flow */}
                  <Route path="/book" element={<BookAppointmentPage />} />
                  <Route path="/appointment-confirmation" element={<AppointmentConfirmationPage />} />
                </Route>

                {/* Doctor Routes */}
                <Route element={<ProtectedRoute allowedRoles={['doctor', 'admin']} />}>
                  <Route element={<DashboardLayout />}>
                    <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
                    <Route path="/doctor/appointments" element={<DoctorAppointmentsPage />} />
                    <Route path="/doctor/queue" element={<DoctorQueueManagementPage />} />
                    <Route path="/doctor/schedule" element={<DoctorSchedulePage />} />
                  </Route>
                </Route>

                {/* Receptionist Routes */}
                <Route element={<ProtectedRoute allowedRoles={['receptionist', 'admin']} />}>
                  <Route element={<DashboardLayout />}>
                    <Route path="/receptionist/dashboard" element={<ReceptionistDashboard />} />
                    <Route path="/receptionist/patient-register" element={<WalkInRegistrationPage />} />
                    <Route path="/receptionist/book-appointment" element={<ReceptionistBookingPage />} />
                    <Route path="/receptionist/queue" element={<ReceptionistQueuePage />} />
                  </Route>
                </Route>

                {/* Admin Routes */}
                <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                  <Route element={<DashboardLayout />}>
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/doctors" element={<DoctorManagementPage />} />
                    <Route path="/admin/patients" element={<PatientManagementPage />} />
                    <Route path="/admin/staff" element={<StaffManagementPage />} />
                    <Route path="/admin/departments" element={<DepartmentManagementPage />} />
                    <Route path="/admin/appointments" element={<AppointmentManagementPage />} />
                    <Route path="/admin/queues" element={<QueueMonitoringPage />} />
                    <Route path="/admin/reports" element={<TokenReportsPage />} />
                    <Route path="/admin/settings" element={<HospitalSettingsPage />} />
                    <Route path="/admin/logs" element={<ActivityLogsPage />} />
                  </Route>
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
            <Footer />
          </div>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
