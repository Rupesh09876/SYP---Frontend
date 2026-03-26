import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Auth
import Login from './components/Login';
import Signup from './components/Signup';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import Appointments from './pages/admin/Appointments';
import Billing from './pages/admin/Billing';
import Reports from './pages/admin/Reports';
import AdminSettings from './pages/admin/Settings';

// Doctor
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import PatientProfiles from './pages/doctor/PatientProfiles';
import ReportSharing from './pages/doctor/ReportSharing';
import DoctorSettings from './pages/doctor/DoctorSettings';
import PatientChat from './pages/doctor/PatientChat';

// Patient
import PatientDashboard from './pages/patient/PatientDashboard';
import PatientAppointments from './pages/patient/PatientAppointments';
import MedicalReports from './pages/patient/MedicalReports';
import AIAssistant from './pages/patient/AIAssistant';
import MyProfile from './pages/patient/MyProfile';
import PatientSettings from './pages/patient/PatientSettings';
import PatientBilling from './pages/patient/Billing';
import Subscription from './pages/patient/Subscription';
import PublicReportView from './pages/patient/PublicReportView';
import Chat from './pages/patient/Chat';

function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (!token) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute role="admin"><UserManagement /></ProtectedRoute>} />
        <Route path="/admin/appointments" element={<ProtectedRoute role="admin"><Appointments /></ProtectedRoute>} />
        <Route path="/admin/billing" element={<ProtectedRoute role="admin"><Billing /></ProtectedRoute>} />
        <Route path="/admin/reports" element={<ProtectedRoute role="admin"><Reports /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute role="admin"><AdminSettings /></ProtectedRoute>} />

        {/* Doctor Routes */}
        <Route path="/doctor/dashboard" element={<ProtectedRoute role="doctor"><DoctorDashboard /></ProtectedRoute>} />
        <Route path="/doctor/appointments" element={<ProtectedRoute role="doctor"><DoctorAppointments /></ProtectedRoute>} />
        <Route path="/doctor/patients" element={<ProtectedRoute role="doctor"><PatientProfiles /></ProtectedRoute>} />
        <Route path="/doctor/reports" element={<ProtectedRoute role="doctor"><ReportSharing /></ProtectedRoute>} />
        <Route path="/doctor/settings" element={<ProtectedRoute role="doctor"><DoctorSettings /></ProtectedRoute>} />
        <Route path="/doctor/chat" element={<ProtectedRoute role="doctor"><PatientChat /></ProtectedRoute>} />

        {/* Patient Routes */}
        <Route path="/patient/dashboard" element={<ProtectedRoute role="patient"><PatientDashboard /></ProtectedRoute>} />
        <Route path="/patient/appointments" element={<ProtectedRoute role="patient"><PatientAppointments /></ProtectedRoute>} />
        <Route path="/patient/reports" element={<ProtectedRoute role="patient"><MedicalReports /></ProtectedRoute>} />
        <Route path="/patient/ai-assistant" element={<ProtectedRoute role="patient"><AIAssistant /></ProtectedRoute>} />
        <Route path="/patient/profile" element={<ProtectedRoute role="patient"><MyProfile /></ProtectedRoute>} />
        <Route path="/patient/billing" element={<ProtectedRoute role="patient"><PatientBilling /></ProtectedRoute>} />
        <Route path="/patient/subscription" element={<ProtectedRoute role="patient"><Subscription /></ProtectedRoute>} />
        <Route path="/patient/settings" element={<ProtectedRoute role="patient"><PatientSettings /></ProtectedRoute>} />
        <Route path="/patient/chat" element={<ProtectedRoute role="patient"><Chat /></ProtectedRoute>} />

        {/* Public Sharing */}
        <Route path="/share/report/:id" element={<PublicReportView />} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}