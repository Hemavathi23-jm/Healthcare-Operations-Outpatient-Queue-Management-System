import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Doctors from './pages/Doctors';
import Departments from './pages/Departments';
import Availability from './pages/Availability';
import Appointments from './pages/Appointments';
import Queue from './pages/Queue';
import Reports from './pages/Reports';
import AuditLogs from './pages/AuditLogs';
import AppointmentHistory from './pages/AppointmentHistory';

export const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Login Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Application Area wrapped in Layout */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard: All Roles including PATIENT */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Patients: Admin & Receptionist */}
            <Route
              path="/patients"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'RECEPTIONIST']}>
                  <Patients />
                </ProtectedRoute>
              }
            />

            {/* Doctors Directory: Admin & Patient */}
            <Route
              path="/doctors"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'PATIENT']}>
                  <Doctors />
                </ProtectedRoute>
              }
            />

            {/* Departments: Admin & Patient */}
            <Route
              path="/departments"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'PATIENT']}>
                  <Departments />
                </ProtectedRoute>
              }
            />

            {/* Doctor Availability: Admin & Doctor */}
            <Route
              path="/availability"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'DOCTOR']}>
                  <Availability />
                </ProtectedRoute>
              }
            />

            {/* Appointments & Booking Workflow: All Roles including PATIENT */}
            <Route
              path="/appointments"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'RECEPTIONIST', 'DOCTOR', 'MANAGER', 'PATIENT']}>
                  <Appointments />
                </ProtectedRoute>
              }
            />

            {/* Live Queue & Waiting Time: All Staff Roles */}
            <Route
              path="/queue"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'RECEPTIONIST', 'DOCTOR', 'MANAGER']}>
                  <Queue />
                </ProtectedRoute>
              }
            />

            {/* Reports & Capacity Analytics: Admin & Manager */}
            <Route
              path="/reports"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
                  <Reports />
                </ProtectedRoute>
              }
            />

            {/* Audit Logs: Admin & Manager */}
            <Route
              path="/audit-logs"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
                  <AuditLogs />
                </ProtectedRoute>
              }
            />

            {/* Appointment History: Doctor, Admin, Manager */}
            <Route
              path="/appointment-history"
              element={
                <ProtectedRoute allowedRoles={['DOCTOR', 'ADMIN', 'MANAGER']}>
                  <AppointmentHistory />
                </ProtectedRoute>
              }
            />

            {/* Default Index Redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
