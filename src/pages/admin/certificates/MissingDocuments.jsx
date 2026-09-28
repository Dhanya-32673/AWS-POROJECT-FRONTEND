import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../../layouts/AdminLayout';
import FacultyLayout from '../../../layouts/FacultyLayout';
import { useAuth } from '../../../context/AuthContext';
import certificateService from '../../../services/certificateService';
import facultyService from '../../../services/facultyService';
import { useDataRefresh } from '../../../utils/dataSync';
import { formatSectionName, formatBranchGroup } from '../../../utils/studentDataFormatter';
import StudentAvatar from '../../../components/common/StudentAvatar';
import UploadCertificateModal from '../../../components/certificates/UploadCertificateModal';
import {
  AlertCircle,
  Plus,
  Search,
  CheckCircle2,
  Users,
  FileWarning,
  ShieldCheck,
  RotateCcw,
  Upload,
  FilterX
} from 'lucide-react';
import { useDebounce } from '../../../hooks/useDebounce';
import { usePageTitle } from '../../../hooks/usePageTitle';

export const MissingDocuments = () => {
  usePageTitle('Missing Documents');
  const navigate = useNavigate();
  const { user } = useAuth();
  const rawRole = (typeof user?.role === 'string' ? user.role : user?.role?.roleName || user?.role?.name || '').replace('ROLE_', '').toUpperCase();
  const isAdmin = rawRole === 'ADMIN';
  const Layout = isAdmin ? AdminLayout : FacultyLayout;

  const [auditData, setAuditData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filter State
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [groupFilter, setGroupFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');

  // Modal State for instant student-specific upload
  const [uploadModalStudent, setUploadModalStudent] = useState(null);
  const [uploadModalDocTypeId, setUploadModalDocTypeId] = useState(null);

  // Faculty assignments for dropdown filtering
  const [facultyAssignments, setFacultyAssignments] = useState([]);

  useEffect(() => {
    if (!isAdmin) {
      facultyService.getCurrentFacultyAssignments()
        .then((data) => setFacultyAssignments((data || []).filter(a => a.active)))
        .catch((err) => console.error('Failed to load faculty assignments:', err));
    }
  }, [isAdmin]);

  const allGroups = ['MPC', 'BiPC', 'MEC', 'CEC', 'HEC'];
  const allYears = ['1st Year', '2nd Year'];
  const allSections = ['A', 'B', 'C', 'D'];

  const availableGroups = !isAdmin && facultyAssignments.length > 0
    ? Array.from(new Set(facultyAssignments.map(a => a.branchGroup)))
    : allGroups;

  const availableYears = !isAdmin && facultyAssignments.length > 0
    ? Array.from(new Set(facultyAssignments.map(a => a.intermediateYear)))
    : allYears;

  const availableSections = !isAdmin && facultyAssignments.length > 0
    ? Array.from(new Set(facultyAssignments.map(a => a.section)))
    : allSections;

  const fetchMissingAudit = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await certificateService.getMissingCertificatesAudit({
        search: debouncedSearch || undefined,
        group: groupFilter || undefined,
        year: yearFilter || undefined,
        section: sectionFilter || undefined,
      });
      setAuditData(data || null);
    } catch (err) {
      console.error('Failed to load missing certificates audit:', err);
      setError(err.response?.data?.message || 'Unable to load missing certificates audit from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMissingAudit();
  }, [debouncedSearch, groupFilter, yearFilter, sectionFilter]);

  useDataRefresh(['certificates', 'students'], fetchMissingAudit);

  const resetFilters = () => {
    setSearch('');
    setGroupFilter('');
    setYearFilter('');
    setSectionFilter('');
  };

  const hasActiveFilters = Boolean(search || groupFilter || yearFilter || sectionFilter);
  const missingStudentsList = auditData?.studentsWithMissing || [];
  const totalActiveStudents = auditData?.totalActiveStudents || 0;
  const compliantCount = auditData?.compliantStudentsCount || 0;
  const missingCount = auditData?.missingStudentsCount || 0;
  const complianceRate = auditData?.compliancePercentage ?? (totalActiveStudents > 0 ? 0 : 100);

  return (
    <Layout>
      <div className="space-y-5 sm:space-y-6 font-sans">
        
        {/* Banner Card Header */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 rounded-3xl p-5 sm:p-8 text-white shadow-xl shadow-blue-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2 text-left">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-blue-100 border border-white/20 inline-block">
                Mandatory Compliance Audit
              </span>
              <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 rounded-full text-[10px] font-bold">
                Live Database Calculation
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight leading-tight">
              Missing Student Certificates
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 font-medium max-w-xl">
              {!isAdmin
                ? 'Auditing mandatory academic certificate submissions for active students in your assigned sections.'
                : 'Real-time database audit tracking mandatory certificate submissions, missing documents, and compliance across college departments.'}
            </p>
          </div>
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg shrink-0">
            <FileWarning className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
        </div>

        {/* Audit Metric KPI Summary Deck */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          
          {/* Card 1: Compliance Rate */}
          <div className="bg-white dark:bg-slate-900 p-3 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1.5 sm:space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
                Compliance Rate
              </span>
              <span className={`p-1 sm:p-1.5 rounded-lg shrink-0 ${complianceRate === 100 ? 'bg-emerald-50 text-emerald-600' : complianceRate >= 75 ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </span>
            </div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white">
                {complianceRate}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  complianceRate === 100 ? 'bg-emerald-500' : complianceRate >= 75 ? 'bg-blue-600' : 'bg-amber-500'
                }`}
                style={{ width: `${complianceRate}%` }}
              />
            </div>
          </div>

          {/* Card 2: Total Active Students */}
          <div className="bg-white dark:bg-slate-900 p-3 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1.5 sm:space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
                Enrolled Students
              </span>
              <span className="p-1 sm:p-1.5 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 shrink-0">
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </span>
            </div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white">
                {totalActiveStudents}
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-400">Active</span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">In audit scope</p>
          </div>

          {/* Card 3: Fully Compliant */}
          <div className="bg-white dark:bg-slate-900 p-3 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1.5 sm:space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
                Fully Compliant
              </span>
              <span className="p-1 sm:p-1.5 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </span>
            </div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-xl sm:text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                {compliantCount}
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-400">Students</span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-emerald-600 dark:text-emerald-400 font-medium truncate">All mandatory docs uploaded</p>
          </div>

          {/* Card 4: Action Required (Missing) */}
          <div className="bg-white dark:bg-slate-900 p-3 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1.5 sm:space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
                Missing Docs
              </span>
              <span className="p-1 sm:p-1.5 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 shrink-0">
                <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </span>
            </div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-xl sm:text-3xl font-black font-mono text-rose-600 dark:text-rose-400">
                {missingCount}
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-400">Students</span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-rose-600 dark:text-rose-400 font-medium truncate">Pending mandatory uploads</p>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search by Student ID, Name, or Roll Number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 min-h-[44px]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:flex lg:items-center gap-2 w-full md:w-auto">
              <select
                value={groupFilter}
                onChange={(e) => setGroupFilter(e.target.value)}
                className="w-full sm:w-auto px-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-300 focus:outline-none min-h-[44px]"
              >
                <option value="">All Groups</option>
                {availableGroups.map(grp => (
                  <option key={grp} value={grp}>{grp}</option>
                ))}
              </select>

              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="w-full sm:w-auto px-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-300 focus:outline-none min-h-[44px]"
              >
                <option value="">All Years</option>
                {availableYears.map(yr => (
                  <option key={yr} value={yr}>{yr}</option>
                ))}
              </select>

              <select
                value={sectionFilter}
                onChange={(e) => setSectionFilter(e.target.value)}
                className="w-full sm:w-auto px-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-300 focus:outline-none min-h-[44px]"
              >
                <option value="">All Sections</option>
                {availableSections.map(sec => (
                  <option key={sec} value={sec}>Section {sec}</option>
                ))}
              </select>

              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="w-full sm:w-auto px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition flex items-center justify-center space-x-1 cursor-pointer min-h-[44px]"
                  title="Reset all filters"
                >
                  <FilterX className="w-3.5 h-3.5 mr-1" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Missing Certificates List Container */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          
          {loading ? (
            <div className="p-16 text-center text-slate-400 space-y-3">
              <span className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-blue-600 border-t-transparent" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Auditing mandatory document compliance from database...</p>
            </div>
          ) : error ? (
            <div className="p-16 text-center max-w-md mx-auto space-y-3">
              <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
              <h3 className="text-sm font-black text-slate-900 dark:text-white">Audit Error</h3>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{error}</p>
              <button
                onClick={fetchMissingAudit}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition inline-flex items-center space-x-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Audit</span>
              </button>
            </div>
          ) : missingStudentsList.length === 0 ? (
            // EITHER 100% COMPLIANT OR EMPTY FILTER MATCH
            hasActiveFilters && totalActiveStudents > 0 ? (
              <div className="p-16 text-center max-w-md mx-auto space-y-3">
                <ShieldCheck className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No matching students with missing certificates</h3>
                <p className="text-xs text-slate-400">All students matching the selected filter criteria have completed their mandatory document submissions.</p>
                <button
                  onClick={resetFilters}
                  className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            ) : totalActiveStudents === 0 ? (
              <div className="p-16 text-center max-w-md mx-auto space-y-2">
                <Users className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No active students enrolled</h3>
                <p className="text-xs text-slate-400">Add active students to the system to begin certificate compliance tracking.</p>
              </div>
            ) : (
              <div className="p-16 text-center space-y-3 max-w-lg mx-auto">
                <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">100% Certificate Compliance Verified</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  All <strong className="text-slate-800 dark:text-slate-200">{totalActiveStudents} active enrolled students</strong> have successfully submitted all required mandatory certificates. No pending document warnings!
                </p>
              </div>
            )
          ) : (
            <>
              {/* MOBILE STACKED CARDS (< md) */}
              <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                {missingStudentsList.map((st) => (
                  <div key={st.id || st.studentId} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center space-x-3 min-w-0">
                        <StudentAvatar
                          src={st.profilePhotoUrl}
                          name={st.fullName}
                          studentId={st.studentId}
                          size="md"
                        />
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{st.fullName}</h4>
                          <p className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">{st.studentId}</p>
                          <p className="text-[10px] text-slate-400">
                            {formatBranchGroup(st.branchGroup)} • Section {formatSectionName(st.section)}
                          </p>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 shrink-0">
                        {st.missingCount} Missing
                      </span>
                    </div>

                    {/* Missing Badges */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Missing Mandatory Certificates:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {st.missingCertificates?.map((mc) => (
                          <span
                            key={mc.id || mc.code}
                            className="px-2 py-0.5 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-900/60 rounded-lg text-[10px] font-bold inline-flex items-center space-x-1"
                          >
                            <AlertCircle className="w-2.5 h-2.5" />
                            <span>{mc.name}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-600 dark:text-slate-400">
                          {st.uploadedCount} of {st.totalRequiredCount} Submitted
                        </span>
                        <span className="text-blue-600 font-mono">{st.completionPercentage}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full"
                          style={{ width: `${st.completionPercentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Action */}
                    <button
                      onClick={() => {
                        setUploadModalStudent(st);
                        setUploadModalDocTypeId(st.missingCertificates?.[0]?.id || null);
                      }}
                      className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 min-h-[44px] cursor-pointer shadow-xs"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Missing Certificate</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* DESKTOP TABLE (md+) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-extrabold uppercase text-[11px] tracking-wider whitespace-nowrap">
                    <tr>
                      <th className="px-4 py-3.5">Student ID</th>
                      <th className="px-4 py-3.5">Student Name</th>
                      <th className="px-4 py-3.5">Group & Year</th>
                      <th className="px-4 py-3.5">Section</th>
                      <th className="px-4 py-3.5">Missing Mandatory Certificates</th>
                      <th className="px-4 py-3.5">Compliance Progress</th>
                      <th className="px-4 py-3.5 text-right pr-6">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {missingStudentsList.map((st) => (
                      <tr key={st.id || st.studentId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                        <td className="px-4 py-3.5 font-mono font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                          {st.studentId}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center space-x-2.5">
                            <StudentAvatar
                              src={st.profilePhotoUrl}
                              name={st.fullName}
                              studentId={st.studentId}
                              size="sm"
                            />
                            <div className="min-w-0">
                              <span className="font-bold text-slate-900 dark:text-white block truncate">{st.fullName}</span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {st.admissionNumber ? `Adm: ${st.admissionNumber}` : (st.rollNumber ? `Roll: ${st.rollNumber}` : '')}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded-md text-[10px] font-extrabold">
                            {formatBranchGroup(st.branchGroup)}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                          {formatSectionName(st.section)}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex flex-wrap gap-1.5 max-w-sm">
                            {st.missingCertificates?.map((mc) => (
                              <span
                                key={mc.id || mc.code}
                                className="px-2 py-0.5 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-900/60 rounded-md text-[10px] font-bold inline-flex items-center space-x-1"
                              >
                                <AlertCircle className="w-2.5 h-2.5 shrink-0" />
                                <span>{mc.name}</span>
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400">
                              <span>{st.uploadedCount}/{st.totalRequiredCount} Uploaded</span>
                              <span className="font-mono text-blue-600">{st.completionPercentage}%</span>
                            </div>
                            <div className="w-28 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-600 rounded-full"
                                style={{ width: `${st.completionPercentage}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-right pr-6 whitespace-nowrap">
                          <button
                            onClick={() => {
                              setUploadModalStudent(st);
                              setUploadModalDocTypeId(st.missingCertificates?.[0]?.id || null);
                            }}
                            className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl inline-flex items-center space-x-1.5 shadow-xs cursor-pointer min-h-[36px] transition"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload Missing</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Upload Certificate Modal for direct student-specific upload */}
      {uploadModalStudent && (
        <UploadCertificateModal
          student={uploadModalStudent}
          prefilledStudentId={uploadModalStudent.studentId}
          prefilledDocumentTypeId={uploadModalDocTypeId}
          onClose={() => {
            setUploadModalStudent(null);
            setUploadModalDocTypeId(null);
          }}
          onUploaded={() => {
            fetchMissingAudit();
          }}
        />
      )}
    </Layout>
  );
};

export default MissingDocuments;
