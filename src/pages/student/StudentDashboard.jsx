import React from 'react';
import { Link } from 'react-router-dom';
import { useStudentPortal } from '../../context/StudentPortalContext';
import { getStudentInitials, formatStudentField } from '../../services/studentPortalService';
import {
  User,
  Award,
  BookOpen,
  Calendar,
  Building,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  KeyRound,
  FileCheck,
  Mail,
  GraduationCap,
  Layers,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { usePageTitle } from '../../hooks/usePageTitle';

const DashboardSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    {/* Welcome Card Skeleton */}
    <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-3xl" />

    {/* Academic Summary Skeleton Grid */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
      ))}
    </div>

    {/* Summaries Grid Skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
      <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
      <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
    </div>
  </div>
);

export const StudentDashboard = () => {
  const { student, certificates, certificateCount, loading, certificatesLoading, error, refreshStudent } = useStudentPortal();

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error || !student) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white dark:bg-slate-900 rounded-3xl border border-red-200 dark:border-red-900/60 shadow-lg text-center space-y-4">
        <div className="w-14 h-14 bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          Unable to Load Dashboard
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
          {error || 'Student record could not be loaded for your account.'}
        </p>
        <button
          onClick={refreshStudent}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors cursor-pointer shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  const fullName = student.fullName || 'Student';
  const studentId = student.studentId || 'Not Assigned';
  const admissionNumber = student.admissionNumber || 'Not Assigned';
  const campus = formatStudentField(student.campus);
  const group = formatStudentField(student.branchGroup);
  const year = formatStudentField(student.intermediateYear);
  const batch = formatStudentField(student.batch);
  const status = student.status || 'ACTIVE';
  const email = formatStudentField(student.email);
  const initials = getStudentInitials(fullName);

  usePageTitle('Student Dashboard');

  return (
    <div className="space-y-6">
      {/* 1. WELCOME CARD */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-600/10">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold tracking-wider uppercase text-blue-100 mb-3">
            <GraduationCap className="w-4 h-4" />
            <span>Student Portal &bull; Student Management System</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            Welcome back, {fullName}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-blue-100 font-medium">
            <div className="flex items-center space-x-1.5 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm">
              <span className="text-blue-200">Student ID:</span>
              <span className="font-bold text-white font-mono">{studentId}</span>
            </div>

            <div className="flex items-center space-x-1.5 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm">
              <span className="text-blue-200">Admission No:</span>
              <span className="font-bold text-white font-mono">{admissionNumber}</span>
            </div>

            <div className="flex items-center space-x-1.5 bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 px-3 py-1 rounded-xl">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="font-bold tracking-wider uppercase text-[11px]">{status}</span>
            </div>
          </div>
        </div>

        {/* Decorative background circle */}
        <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 w-80 h-80 bg-white/5 rounded-full pointer-events-none" />
      </div>

      {/* 2. ACADEMIC SUMMARY CARDS */}
      <div>
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-3 px-1">
          Academic Summary
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Campus */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Campus</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Building className="w-4 h-4" />
              </div>
            </div>
            <div className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 truncate" title={campus}>
              {campus}
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-300 font-medium mt-1">Official Study Campus</div>
          </div>

          {/* Group */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Group</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <div className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 truncate" title={group}>
              {group}
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-300 font-medium mt-1">Academic Stream</div>
          </div>

          {/* Year */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Year</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 truncate" title={year}>
              {year}
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-300 font-medium mt-1">Intermediate Level</div>
          </div>

          {/* Batch */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Batch</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 truncate" title={batch}>
              {batch}
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-300 font-medium mt-1">Enrolled Cohort</div>
          </div>
        </div>
      </div>

      {/* 3. SUMMARIES & ACTION SHORTCUTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Profile Summary Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">My Profile</h3>
              </div>
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-md">
                Official Record
              </span>
            </div>

            <div className="mt-4 flex items-center space-x-3.5">
              {student.profilePhotoUrl ? (
                <img
                  src={student.profilePhotoUrl}
                  alt={fullName}
                  className="w-14 h-14 rounded-2xl object-cover border border-blue-200 dark:border-blue-900 shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-md shadow-blue-600/20 shrink-0">
                  {initials}
                </div>
              )}
              <div className="truncate">
                <h4 className="font-bold text-slate-900 dark:text-white truncate">{fullName}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">ID: {studentId}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">Adm: {admissionNumber}</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-300">Campus:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{campus}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-300">Group / Year:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{group} &bull; {year}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Link
              to="/student/profile"
              className="w-full inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-sm cursor-pointer"
            >
              <span>View Full Profile</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Certificate Summary Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">My Certificates</h3>
              </div>
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-md">
                Verified Documents
              </span>
            </div>

            <div className="mt-6 text-center py-3">
              <div className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {certificatesLoading ? '...' : certificateCount}
              </div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                {certificateCount === 1 ? 'Certificate Uploaded' : 'Certificates Uploaded'}
              </p>

              {certificateCount === 0 && !certificatesLoading && (
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs">
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>No certificates uploaded yet</span>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-1 px-4">
              Access and download your academic records, marksheets, and official certificates.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Link
              to="/student/certificates"
              className="w-full inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950 hover:text-blue-600 dark:hover:text-blue-400 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors cursor-pointer"
            >
              <span>View Certificates</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Account & Security Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Account Security</h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                Active
              </span>
            </div>

            <div className="mt-5 space-y-4 text-xs">
              <div>
                <span className="text-slate-600 dark:text-slate-300 block font-medium">Account Status</span>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-bold text-slate-800 dark:text-slate-200 uppercase">{status}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-600 dark:text-slate-300 block font-medium">Registered Email</span>
                <div className="flex items-center space-x-2 mt-1 text-slate-700 dark:text-slate-300">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate font-medium">{email}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Protect your student portal. You can change your password anytime using your current credentials.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Link
              to="/student/change-password"
              className="w-full inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>Change Password</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentDashboard;
