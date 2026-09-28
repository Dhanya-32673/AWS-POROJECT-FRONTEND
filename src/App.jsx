import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import RoleRoute from './components/RoleRoute';

// Auth Pages (Eagerly loaded for fast TTI on login)
import Login from './pages/auth/Login';
import OtpVerification from './pages/auth/OtpVerification';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import OAuth2RedirectHandler from './pages/auth/OAuth2RedirectHandler';
import OAuthSuccess from './pages/auth/OAuthSuccess';
import AdminOtp from './pages/auth/AdminOtp';

// Dashboards (Lazy loaded)
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const FacultyDashboard = lazy(() => import('./pages/faculty/FacultyDashboard').then(m => ({ default: m.FacultyDashboard })));

// Admin Student Management Pages (Lazy loaded)
const AllStudents = lazy(() => import('./pages/admin/students/AllStudents').then(m => ({ default: m.AllStudents })));
const AddStudent = lazy(() => import('./pages/admin/students/AddStudent').then(m => ({ default: m.AddStudent })));
const StudentProfile = lazy(() => import('./pages/admin/students/StudentProfile').then(m => ({ default: m.StudentProfile })));
const EditStudent = lazy(() => import('./pages/admin/students/EditStudent').then(m => ({ default: m.EditStudent })));
const StudentIdCard = lazy(() => import('./pages/admin/students/StudentIdCard').then(m => ({ default: m.StudentIdCard })));

// Faculty Student Management Pages (Lazy loaded)
const SearchStudent = lazy(() => import('./pages/faculty/students/SearchStudent').then(m => ({ default: m.SearchStudent })));
const FacultyStudentProfile = lazy(() => import('./pages/faculty/students/FacultyStudentProfile').then(m => ({ default: m.FacultyStudentProfile })));

// Certificate Pages (Lazy loaded)
const AllCertificates = lazy(() => import('./pages/admin/certificates/AllCertificates').then(m => ({ default: m.AllCertificates })));
const UploadCertificate = lazy(() => import('./pages/admin/certificates/UploadCertificate').then(m => ({ default: m.UploadCertificate })));
const PendingDocuments = lazy(() => import('./pages/admin/certificates/PendingDocuments').then(m => ({ default: m.PendingDocuments })));
const MissingDocuments = lazy(() => import('./pages/admin/certificates/MissingDocuments').then(m => ({ default: m.MissingDocuments })));
const VerifiedDocuments = lazy(() => import('./pages/admin/certificates/VerifiedDocuments').then(m => ({ default: m.VerifiedDocuments })));
const CertificateTypes = lazy(() => import('./pages/admin/certificates/CertificateTypes').then(m => ({ default: m.CertificateTypes })));

// Group, Section & Security Pages (Lazy loaded)
const GroupManagement = lazy(() => import('./pages/admin/academic/GroupManagement').then(m => ({ default: m.GroupManagement })));
const SectionManagement = lazy(() => import('./pages/admin/academic/SectionManagement').then(m => ({ default: m.SectionManagement })));
const RoleManagement = lazy(() => import('./pages/admin/security/RoleManagement').then(m => ({ default: m.RoleManagement })));

// Common User Profile Page (Lazy loaded)
const UserProfile = lazy(() => import('./pages/common/UserProfile').then(m => ({ default: m.UserProfile })));

// Student Portal Pages & Layout (Lazy loaded)
const StudentLayout = lazy(() => import('./layouts/StudentLayout').then(m => ({ default: m.StudentLayout || m.default })));
const StudentDashboard = lazy(() => import('./pages/student/StudentDashboard').then(m => ({ default: m.StudentDashboard || m.default })));
const StudentProfilePage = lazy(() => import('./pages/student/StudentProfilePage').then(m => ({ default: m.StudentProfilePage || m.default })));
const StudentCertificatesPage = lazy(() => import('./pages/student/StudentCertificatesPage').then(m => ({ default: m.StudentCertificatesPage || m.default })));
const StudentChangePassword = lazy(() => import('./pages/student/StudentChangePassword').then(m => ({ default: m.StudentChangePassword || m.default })));

// Error Pages (Lazy loaded)
const NotFound = lazy(() => import('./pages/error/NotFound'));
const Unauthorized = lazy(() => import('./pages/error/Unauthorized'));

import { warmupServer } from './services/api';

const RouteFallback = () => (
  <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
    <div className="flex flex-col items-center space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-white p-2 flex items-center justify-center shadow-xl shadow-blue-500/10">
        <img
          src="/logo.png"
          alt="Student Management System"
          className="w-full h-full object-contain animate-pulse"
        />
      </div>
      <div className="text-center">
        <h2 className="text-white font-black text-sm tracking-wider uppercase">STUDENT MANAGEMENT SYSTEM</h2>
        <div className="flex items-center justify-center space-x-2 text-blue-400 font-semibold text-xs mt-2">
          <span className="inline-block animate-spin rounded-full h-3.5 w-3.5 border-2 border-blue-500 border-t-transparent" />
          <span>Loading...</span>
        </div>
      </div>
    </div>
  </div>
);

function App() {
  React.useEffect(() => {
    // Non-blocking ping to wake up Render free tier backend immediately when site is opened
    warmupServer();
  }, []);

  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
          {/* Public Authentication Routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
          <Route path="/oauth-success" element={<OAuthSuccess />} />
          <Route path="/admin-otp" element={<AdminOtp />} />
          <Route path="/otp-verification" element={<OtpVerification />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Admin & Faculty Shared Student Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <RoleRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/students"
            element={
              <RoleRoute allowedRoles={['ADMIN', 'FACULTY']}>
                <AllStudents />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/students/add"
            element={
              <RoleRoute allowedRoles={['ADMIN', 'FACULTY']}>
                <AddStudent />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/students/:id"
            element={
              <RoleRoute allowedRoles={['ADMIN', 'FACULTY']}>
                <StudentProfile />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/students/:id/edit"
            element={
              <RoleRoute allowedRoles={['ADMIN', 'FACULTY']}>
                <EditStudent />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/students/:id/id-card"
            element={
              <RoleRoute allowedRoles={['ADMIN', 'FACULTY']}>
                <StudentIdCard />
              </RoleRoute>
            }
          />

          {/* Certificate Management Routes */}
          <Route
            path="/admin/certificates"
            element={
              <RoleRoute allowedRoles={['ADMIN', 'FACULTY']}>
                <AllCertificates />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/certificates/upload"
            element={
              <RoleRoute allowedRoles={['ADMIN', 'FACULTY']}>
                <UploadCertificate />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/certificates/pending"
            element={
              <RoleRoute allowedRoles={['ADMIN', 'FACULTY']}>
                <PendingDocuments />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/certificates/missing"
            element={
              <RoleRoute allowedRoles={['ADMIN', 'FACULTY']}>
                <MissingDocuments />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/certificates/verified"
            element={
              <RoleRoute allowedRoles={['ADMIN', 'FACULTY']}>
                <VerifiedDocuments />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/certificates/types"
            element={
              <RoleRoute allowedRoles={['ADMIN', 'FACULTY']}>
                <CertificateTypes />
              </RoleRoute>
            }
          />

          {/* Academic & Campus Management Routes */}
          <Route
            path="/admin/academic/groups"
            element={
              <RoleRoute allowedRoles={['ADMIN']}>
                <GroupManagement />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/academic/campus"
            element={
              <RoleRoute allowedRoles={['ADMIN']}>
                <SectionManagement />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/academic/sections"
            element={<Navigate to="/admin/academic/campus" replace />}
          />

          {/* Security Management Routes */}
          <Route
            path="/admin/security/roles"
            element={
              <RoleRoute allowedRoles={['ADMIN']}>
                <RoleManagement />
              </RoleRoute>
            }
          />

          {/* Faculty Dashboard & Dedicated Student Search */}
          <Route
            path="/faculty/dashboard"
            element={
              <RoleRoute allowedRoles={['FACULTY']}>
                <FacultyDashboard />
              </RoleRoute>
            }
          />
          <Route
            path="/faculty/students/search"
            element={
              <RoleRoute allowedRoles={['FACULTY']}>
                <SearchStudent />
              </RoleRoute>
            }
          />
          <Route
            path="/faculty/students/:id"
            element={
              <RoleRoute allowedRoles={['FACULTY']}>
                <FacultyStudentProfile />
              </RoleRoute>
            }
          />
          <Route
            path="/faculty/students/:id/id-card"
            element={
              <RoleRoute allowedRoles={['FACULTY', 'ADMIN']}>
                <StudentIdCard />
              </RoleRoute>
            }
          />

          {/* Student Portal Protected Routes */}
          <Route path="/student/login" element={<Navigate to="/login" replace />} />
          <Route
            path="/student"
            element={
              <RoleRoute allowedRoles={['STUDENT']}>
                <StudentLayout />
              </RoleRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="profile" element={<StudentProfilePage />} />
            <Route path="certificates" element={<StudentCertificatesPage />} />
            <Route path="change-password" element={<StudentChangePassword />} />
          </Route>

          {/* Shared Common Profile */}
          <Route
            path="/profile"
            element={
              <RoleRoute allowedRoles={['ADMIN', 'FACULTY', 'STUDENT']}>
                <UserProfile />
              </RoleRoute>
            }
          />

          {/* Error and Fallback Routes */}
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
          </Suspense>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
