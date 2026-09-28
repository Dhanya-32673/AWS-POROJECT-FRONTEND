import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStudentPortal } from '../../context/StudentPortalContext';
import { getStudentInitials, formatStudentField } from '../../services/studentPortalService';
import {
  User,
  ShieldCheck,
  Building2,
  Calendar,
  Phone,
  Mail,
  Users,
  Award,
  BookOpen,
  Layers,
  GraduationCap,
  Eye,
  EyeOff,
  FileCheck,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Clock
} from 'lucide-react';
import { usePageTitle } from '../../hooks/usePageTitle';

const ProfileField = ({ label, value, isAadhaar = false, showAadhaar = false, onToggleAadhaar = null }) => {
  return (
    <div className="bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-4 transition-colors">
      <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block">
        {label}
      </span>
      <div className="mt-1 flex items-center justify-between gap-2">
        <span className="text-sm font-bold text-slate-800 dark:text-slate-100 break-words">
          {isAadhaar && value !== 'Not Provided'
            ? showAadhaar
              ? value
              : value.length >= 4
              ? `XXXX-XXXX-${value.slice(-4)}`
              : 'XXXX-XXXX-XXXX'
            : value}
        </span>
        {isAadhaar && value !== 'Not Provided' && (
          <button
            type="button"
            onClick={onToggleAadhaar}
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-white dark:hover:bg-slate-700 transition cursor-pointer"
            title={showAadhaar ? 'Hide Aadhaar' : 'Show Aadhaar'}
            aria-label={showAadhaar ? 'Hide Aadhaar' : 'Show Aadhaar'}
          >
            {showAadhaar ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );
};

export const StudentProfilePage = () => {
  const { student, certificateCount, loading, error, refreshStudent } = useStudentPortal();
  const [showAadhaar, setShowAadhaar] = useState(false);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-56 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        <div className="h-72 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white dark:bg-slate-900 rounded-3xl border border-red-200 dark:border-red-900/60 shadow-lg text-center space-y-4">
        <div className="w-14 h-14 bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Unable to Load Profile</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
          {error || 'Student record could not be loaded.'}
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
  const initials = getStudentInitials(fullName);

  usePageTitle('My Profile');

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            My Profile
          </h1>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
            Official student record information &bull; Student Management System
          </p>
        </div>

        <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 text-xs font-bold w-fit">
          <ShieldCheck className="w-4 h-4" />
          <span>READ-ONLY PORTAL ACCESS</span>
        </div>
      </div>

      {/* PROFILE HEADER HERO CARD */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar / Photo */}
          {student.profilePhotoUrl ? (
            <img
              src={student.profilePhotoUrl}
              alt={fullName}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-2 border-blue-500 shadow-md shrink-0"
              onError={(e) => {
                e.target.style.display = 'none';
                if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div
            className={`w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-2xl sm:text-3xl flex items-center justify-center shadow-lg shadow-blue-600/20 shrink-0 ${
              student.profilePhotoUrl ? 'hidden' : 'flex'
            }`}
          >
            {initials}
          </div>

          {/* Core Info */}
          <div className="flex-1 text-center md:text-left space-y-3">
            <div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {fullName}
                </h2>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  {student.status || 'ACTIVE'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Official Enrolled Student &bull; Student Management System
              </p>
            </div>

            {/* Badges Bar */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs">
              <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-bold">
                ID: {studentId}
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-bold">
                Adm: {admissionNumber}
              </span>
              {student.campus && (
                <span className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold">
                  Campus: {student.campus}
                </span>
              )}
              {student.branchGroup && (
                <span className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold">
                  Group: {student.branchGroup}
                </span>
              )}
              {student.intermediateYear && (
                <span className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold">
                  {student.intermediateYear}
                </span>
              )}
              <span className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold">
                {certificateCount} {certificateCount === 1 ? 'Certificate' : 'Certificates'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION A — BASIC INFORMATION */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-sm">
        <div className="flex items-center space-x-2.5 pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
          <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Basic Information</h3>
            <p className="text-[11px] text-slate-600 dark:text-slate-300">Identity details verified during admission</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <ProfileField label="Student ID" value={formatStudentField(student.studentId)} />
          <ProfileField label="Admission Number" value={formatStudentField(student.admissionNumber)} />
          <ProfileField label="Full Name" value={formatStudentField(student.fullName)} />
          <ProfileField label="Gender" value={formatStudentField(student.gender)} />
          <ProfileField label="Date of Birth" value={formatStudentField(student.dateOfBirth)} />
          <ProfileField label="Nationality" value={formatStudentField(student.nationality)} />
          <ProfileField label="Religion" value={formatStudentField(student.religion)} />
          <ProfileField label="Category" value={formatStudentField(student.category)} />
          <ProfileField
            label="Aadhaar Number"
            value={formatStudentField(student.aadhaarNumber || student.maskedAadhaar)}
            isAadhaar={true}
            showAadhaar={showAadhaar}
            onToggleAadhaar={() => setShowAadhaar(!showAadhaar)}
          />
        </div>
      </div>

      {/* SECTION B — CONTACT INFORMATION */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-sm">
        <div className="flex items-center space-x-2.5 pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Phone className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Contact Information</h3>
            <p className="text-[11px] text-slate-600 dark:text-slate-300">Primary and alternative communications</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
          <ProfileField label="Primary Email" value={formatStudentField(student.email)} />
          <ProfileField label="Alternate Email" value={formatStudentField(student.alternateEmail)} />
          <ProfileField label="Mobile Number" value={formatStudentField(student.mobileNumber)} />
          <ProfileField label="Alternate Mobile" value={formatStudentField(student.alternateMobile)} />
        </div>
      </div>

      {/* SECTION C — FAMILY INFORMATION */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-sm">
        <div className="flex items-center space-x-2.5 pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
          <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Family Information</h3>
            <p className="text-[11px] text-slate-600 dark:text-slate-300">Parents and emergency guardians</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ProfileField label="Father's Name" value={formatStudentField(student.fatherName)} />
          <ProfileField label="Mother's Name" value={formatStudentField(student.motherName)} />
        </div>
      </div>

      {/* SECTION D — ACADEMIC & INSTITUTIONAL INFORMATION */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-sm">
        <div className="flex items-center space-x-2.5 pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
          <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Academic & Institutional Details</h3>
            <p className="text-[11px] text-slate-600 dark:text-slate-300">Campus enrollment and branch assignments</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <ProfileField label="Campus" value={formatStudentField(student.campus)} />
          <ProfileField label="Academic Year" value={formatStudentField(student.academicYear)} />
          <ProfileField label="Branch / Group" value={formatStudentField(student.branchGroup)} />
          <ProfileField label="Intermediate Year" value={formatStudentField(student.intermediateYear)} />
          <ProfileField label="Batch" value={formatStudentField(student.batch)} />
          <ProfileField label="Admission Type" value={formatStudentField(student.admissionType)} />
          <ProfileField label="Hostel / Day Scholar" value={formatStudentField(student.hostelDayScholar)} />
          <ProfileField label="Section" value={formatStudentField(student.section)} />
          <ProfileField label="Enrollment Status" value={formatStudentField(student.status)} />
        </div>
      </div>

      {/* SECTION E — CERTIFICATES SHORTCUT */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5 text-center sm:text-left">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-base text-slate-900 dark:text-white">Certificates & Documents</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {certificateCount} official certificates on file.
            </p>
          </div>
        </div>

        <Link
          to="/student/certificates"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-sm cursor-pointer whitespace-nowrap"
        >
          <span>View My Certificates</span>
          <FileCheck className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default StudentProfilePage;
