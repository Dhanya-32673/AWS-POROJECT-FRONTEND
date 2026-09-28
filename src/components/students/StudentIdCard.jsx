import React, { useState } from 'react';
import { GraduationCap } from 'lucide-react';

/**
 * Premium Blue + White Student ID Card Component
 * 
 * Strict specifications:
 * - Color System:
 *   - Primary Blue: #2563EB
 *   - Secondary Blue: #1D4ED8
 *   - Light Blue: #EFF6FF
 *   - Very Light Blue: #F8FAFC
 *   - White: #FFFFFF
 *   - Dark Text: #0F172A
 *   - Secondary / Label Text: #64748B or #2563EB
 *   - Border: #DBEAFE
 * - Balance: ~75% white, ~25% blue. Clean, modern, trustworthy academic styling.
 * - Vertical portrait format (approx 0.63 : 1 ratio, width ~360-380px)
 * - ONLY 6 student details:
 *   1. Institution / App Name: STUDENT MANAGEMENT SYSTEM
 *   2. Card Title: STUDENT IDENTITY CARD
 *   3. Student Photo / Initials
 *   4. Student Name
 *   5. Student ID
 *   6. Admission Number
 *   7. Group & Academic Year
 * - NO roll number, section, intermediate year, branch, DOB, gender, blood group,
 *   phone, email, address, parent, status, QR code, or verification text.
 */
export const StudentIdCard = ({
  idCardData,
  student,
  studentName,
  studentId,
  admissionNumber,
  group,
  academicYear,
  photoUrl,
  className = '',
}) => {
  const [logoError, setLogoError] = useState(false);
  const [photoError, setPhotoError] = useState(false);

  // Normalize data from multiple possible prop formats
  const rawData = idCardData || student || {};

  const resolvedName =
    studentName ||
    rawData.studentName ||
    rawData.fullName ||
    '—';

  const resolvedId =
    studentId ||
    rawData.studentId ||
    '—';

  const resolvedAdmNo =
    admissionNumber ||
    rawData.admissionNumber ||
    '—';

  const resolvedGroup =
    group ||
    rawData.branchGroup ||
    rawData.group ||
    '—';

  const resolvedYear =
    academicYear ||
    rawData.academicYear ||
    '2026-2027';

  const resolvedPhoto =
    photoUrl ||
    rawData.studentPhotoUrl ||
    rawData.profilePhotoUrl ||
    null;

  // Compute clean initials for placeholder
  const getInitials = (text) => {
    if (!text || typeof text !== 'string' || text === '—') return 'ST';
    const clean = text.trim();
    if (!clean) return 'ST';
    const parts = clean.split(/\s+/).filter(Boolean);
    if (parts.length === 1) {
      return parts[0].substring(0, Math.min(2, parts[0].length)).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const appLogoUrl = '/logo.png';

  const hasPhoto =
    resolvedPhoto &&
    typeof resolvedPhoto === 'string' &&
    resolvedPhoto.trim() !== '' &&
    resolvedPhoto !== 'null' &&
    resolvedPhoto !== 'undefined' &&
    !photoError;

  return (
    <div
      className={`student-id-card-root relative w-full max-w-[360px] sm:max-w-[380px] bg-white rounded-[22px] overflow-hidden border border-[#DBEAFE] shadow-[0_15px_35px_rgba(37,99,235,0.12)] select-none text-[#0F172A] font-sans transition-all duration-300 ${className}`}
      style={{
        WebkitPrintColorAdjust: 'exact',
        printColorAdjust: 'exact',
      }}
    >
      {/* ======================================================== */}
      {/* 1. BLUE HEADER: Primary Blue with Logo & College Title    */}
      {/* ======================================================== */}
      <div
        className="px-5 pt-6 pb-5 text-center text-white relative rounded-t-[21px]"
        style={{
          background: 'linear-gradient(180deg, #1D4ED8 0%, #2563EB 100%)',
        }}
      >
        {/* Subtle decorative header overlay */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 pointer-events-none" />

        {/* Logo Container: Clean white rounded container */}
        <div className="w-13 h-13 sm:w-14 sm:h-14 bg-white rounded-xl p-1.5 shadow-sm border border-white/40 flex items-center justify-center mx-auto mb-2.5">
          {!logoError ? (
            <img
              src={appLogoUrl}
              alt="Student Management System Logo"
              className="w-full h-full object-contain"
              loading="eager"
              onError={() => setLogoError(true)}
            />
          ) : (
            <div className="w-full h-full rounded-lg bg-blue-50 flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-[#2563EB]" />
            </div>
          )}
        </div>

        {/* Prominent Application / Institution Name */}
        <h1 className="text-sm sm:text-[16px] font-black tracking-wider uppercase text-white leading-tight">
          STUDENT MANAGEMENT SYSTEM
        </h1>

        {/* Card Title */}
        <p className="text-[10px] sm:text-[11px] font-bold tracking-[0.22em] uppercase text-blue-100 mt-1">
          STUDENT IDENTITY CARD
        </p>
      </div>

      {/* ======================================================== */}
      {/* 2. CARD BODY: Photo + Clean Vertical Student Information  */}
      {/* ======================================================== */}
      <div className="p-5 sm:p-6 flex flex-col items-center bg-white">
        
        {/* Student Photo / Clean Initials Placeholder */}
        <div className="flex justify-center -mt-2 mb-4">
          {hasPhoto ? (
            <img
              src={resolvedPhoto}
              alt={resolvedName}
              onError={() => setPhotoError(true)}
              className="w-[115px] h-[125px] object-cover rounded-[18px] border-[3px] border-[#DBEAFE] shadow-sm"
              loading="eager"
            />
          ) : (
            <div
              className="w-[115px] h-[125px] rounded-[18px] border-[3px] border-[#DBEAFE] bg-[#F8FAFC] flex items-center justify-center shadow-sm select-none"
              title={resolvedName}
            >
              <span className="text-2xl sm:text-3xl font-black text-[#2563EB] tracking-wider">
                {getInitials(resolvedName)}
              </span>
            </div>
          )}
        </div>

        {/* Student Name */}
        <div className="w-full text-center pb-3 border-b border-[#DBEAFE]">
          <span className="text-[11px] font-bold text-[#2563EB] uppercase tracking-wider block">
            STUDENT NAME
          </span>
          <p className="text-base sm:text-[18px] font-black text-[#0F172A] leading-tight break-words max-w-full px-2 mt-1">
            {resolvedName}
          </p>
        </div>

        {/* Student ID */}
        <div className="w-full text-center py-3 border-b border-[#DBEAFE]">
          <span className="text-[11px] font-bold text-[#2563EB] uppercase tracking-wider block">
            STUDENT ID
          </span>
          <p className="font-mono text-sm sm:text-[15px] font-bold text-[#0F172A] tracking-wider mt-0.5">
            {resolvedId}
          </p>
        </div>

        {/* Admission Number */}
        <div className="w-full text-center pt-3 pb-1">
          <span className="text-[11px] font-bold text-[#2563EB] uppercase tracking-wider block">
            ADMISSION NUMBER
          </span>
          <p className="font-mono text-sm sm:text-[15px] font-bold text-[#0F172A] tracking-wider mt-0.5">
            {resolvedAdmNo}
          </p>
        </div>

      </div>

      {/* ======================================================== */}
      {/* 3. BOTTOM SECTION: GROUP + ACADEMIC YEAR (Two Columns)    */}
      {/* ======================================================== */}
      <div className="bg-[#F8FAFC] border-t border-[#DBEAFE] px-4 py-3.5 sm:py-4 grid grid-cols-2 text-center">
        {/* Left Column: GROUP */}
        <div className="border-r border-[#DBEAFE] pr-2">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#2563EB] block">
            GROUP
          </span>
          <p className="text-sm sm:text-base font-black text-[#0F172A] tracking-wide mt-0.5 truncate">
            {resolvedGroup}
          </p>
        </div>

        {/* Right Column: ACADEMIC YEAR */}
        <div className="pl-2">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#2563EB] block">
            ACADEMIC YEAR
          </span>
          <p className="text-sm sm:text-base font-black text-[#0F172A] tracking-wide mt-0.5 truncate">
            {resolvedYear}
          </p>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. OPTIONAL BOTTOM ACCENT: Minimal Blue Footer Stripe     */}
      {/* ======================================================== */}
      <div className="h-1.5 bg-[#2563EB] w-full rounded-b-[21px]" />
    </div>
  );
};

export default StudentIdCard;
