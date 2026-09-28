import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../../layouts/AdminLayout';
import FacultyLayout from '../../../layouts/FacultyLayout';
import { useAuth } from '../../../context/AuthContext';
import certificateService from '../../../services/certificateService';
import { formatSectionName, formatBranchGroup, formatIntermediateYear } from '../../../utils/studentDataFormatter';
import StudentCertificatesModal from '../../../components/certificates/StudentCertificatesModal';
import StudentAvatar from '../../../components/common/StudentAvatar';
import {
  Award,
  Search,
  FolderOpen,
  Edit3,
  ChevronLeft,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

import { useDebounce } from '../../../hooks/useDebounce';
import { useDataRefresh } from '../../../utils/dataSync';
import { usePageTitle } from '../../../hooks/usePageTitle';

export const AllCertificates = () => {
  usePageTitle('Certificates');
  const navigate = useNavigate();
  const { user } = useAuth();
  const rawRole = (typeof user?.role === 'string' ? user.role : user?.role?.roleName || user?.role?.name || '').replace('ROLE_', '').toUpperCase();
  const isAdmin = rawRole === 'ADMIN';

  const Layout = isAdmin ? AdminLayout : FacultyLayout;

  const [studentSummaries, setStudentSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Filters & Search State
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [groupFilter, setGroupFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('studentId');
  const [sortDir, setSortDir] = useState('asc');

  // Modal State
  const [selectedStudentForCertificates, setSelectedStudentForCertificates] = useState(null);

  const fetchStudentSummaries = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await certificateService.getStudentSummaries({
        page,
        size: 10,
        group: groupFilter || undefined,
        year: yearFilter || undefined,
        section: sectionFilter || undefined,
        status: statusFilter || undefined,
        search: debouncedSearch || undefined,
        sortBy,
        sortDir,
      });
      setStudentSummaries(data?.content || []);
      setTotalPages(data?.totalPages || 1);
      setTotalElements(data?.totalElements || 0);
    } catch (err) {
      console.error('Failed to load student certificate summaries:', err);
      setError('Unable to load certificate records. Please check server connectivity or try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentSummaries();
  }, [page, groupFilter, yearFilter, sectionFilter, statusFilter, debouncedSearch, sortBy, sortDir]);

  useDataRefresh(['certificates', 'students'], fetchStudentSummaries);

  return (
    <Layout>
      <div className="space-y-5 sm:space-y-6 font-sans">
        
        {/* Header Banner */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-2 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl">
                <Award className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Certificate Verification Hub
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Verify, track, and manage student certificates and mandatory compliance documents ({totalElements} records)
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => navigate('/admin/certificates/upload')}
              className="w-full sm:w-auto py-2.5 px-4 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition flex items-center justify-center space-x-2 cursor-pointer min-h-[44px]"
            >
              <span>+ Upload Certificate</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search by student name, ID, or roll number..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 min-h-[44px]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:flex lg:items-center gap-2 w-full md:w-auto">
              <select
                value={groupFilter}
                onChange={(e) => {
                  setGroupFilter(e.target.value);
                  setPage(0);
                }}
                className="w-full sm:w-auto px-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-300 focus:outline-none min-h-[44px]"
              >
                <option value="">All Groups</option>
                <option value="MPC">MPC</option>
                <option value="BiPC">BiPC</option>
                <option value="MEC">MEC</option>
                <option value="CEC">CEC</option>
                <option value="HEC">HEC</option>
              </select>

              <select
                value={sectionFilter}
                onChange={(e) => {
                  setSectionFilter(e.target.value);
                  setPage(0);
                }}
                className="w-full sm:w-auto px-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-300 focus:outline-none min-h-[44px]"
              >
                <option value="">All Sections</option>
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
                <option value="D">Section D</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(0);
                }}
                className="w-full sm:w-auto px-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-300 focus:outline-none min-h-[44px]"
              >
                <option value="">All Statuses</option>
                <option value="COMPLETED">Completed</option>
                <option value="PARTIALLY COMPLETED">Partially Completed</option>
                <option value="PENDING VERIFICATION">Pending Verification</option>
                <option value="NEEDS ATTENTION">Needs Attention</option>
              </select>
            </div>
          </div>
        </div>

        {/* Certificate Summaries Container */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          
          {loading ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <span className="inline-block animate-spin rounded-full h-7 w-7 border-2 border-blue-600 border-t-transparent" />
              <p className="text-xs font-semibold">Loading student certificate records...</p>
            </div>
          ) : error ? (
            <div className="py-16 text-center p-6 max-w-md mx-auto space-y-3">
              <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{error}</p>
              <button
                onClick={fetchStudentSummaries}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : studentSummaries.length === 0 ? (
            <div className="py-16 text-center p-6 max-w-md mx-auto space-y-3">
              <FolderOpen className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {!isAdmin ? "No students are assigned to your sections yet." : "No certificate records found."}
              </h4>
              <p className="text-xs text-slate-400">
                {!isAdmin ? "Contact Admin to assign sections to your faculty account." : "Try adjusting your search query or filters."}
              </p>
            </div>
          ) : (
            <>
              {/* MOBILE STACKED CARDS (< md) */}
              <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                {studentSummaries.map((st) => (
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
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase shrink-0 ${
                        st.overallStatus === 'COMPLETED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : st.overallStatus === 'PENDING VERIFICATION'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {st.overallStatus}
                      </span>
                    </div>

                    {/* Progress */}
                    <div className="space-y-1 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-600 dark:text-slate-400">
                          {st.uploadedCount} / {st.totalRequired} Uploaded
                        </span>
                        <span className="text-blue-600 font-mono">{st.completionPercentage}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-600 to-blue-500 rounded-full"
                          style={{ width: `${st.completionPercentage}%` }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedStudentForCertificates(st)}
                      className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 min-h-[44px] cursor-pointer shadow-xs"
                    >
                      <FolderOpen className="w-4 h-4" />
                      <span>View & Manage Certificates</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* DESKTOP TABLE VIEW (md+) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-extrabold uppercase text-[11px] tracking-wider whitespace-nowrap">
                    <tr>
                      <th className="py-3.5 px-4">Student ID</th>
                      <th className="py-3.5 px-4 min-w-[160px]">Student Name</th>
                      <th className="py-3.5 px-4">Adm No</th>
                      <th className="py-3.5 px-4">Group & Year</th>
                      <th className="py-3.5 px-4">Section</th>
                      <th className="py-3.5 px-4 min-w-[180px]">Certificates Progress</th>
                      <th className="py-3.5 px-4 min-w-[150px]">Overall Status</th>
                      <th className="py-3.5 px-4 text-right pr-6 min-w-[160px]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {studentSummaries.map((st) => (
                      <tr key={st.id || st.studentId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                          {st.studentId}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <StudentAvatar
                              src={st.profilePhotoUrl}
                              name={st.fullName}
                              studentId={st.studentId}
                              size="sm"
                            />
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white block whitespace-nowrap">{st.fullName}</span>
                              <span className="text-[10px] text-slate-400 font-mono block">{st.admissionNumber || 'N/A'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-medium text-slate-500 whitespace-nowrap">
                          {st.admissionNumber || 'N/A'}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center space-x-1.5">
                            <span className="px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded-md text-[10px] font-extrabold">
                              {formatBranchGroup(st.branchGroup)}
                            </span>
                            <span className="text-slate-500 font-semibold text-[11px]">
                              {formatIntermediateYear(st.intermediateYear)}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                          {formatSectionName(st.section)}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[11px] font-bold space-x-3">
                              <span className="text-slate-700 dark:text-slate-300 whitespace-nowrap">
                                {st.uploadedCount} / {st.totalRequired} Uploaded
                              </span>
                              <span className="text-blue-600 dark:text-blue-400 font-mono">{st.completionPercentage}%</span>
                            </div>
                            <div className="w-36 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-blue-600 to-blue-500 rounded-full"
                                style={{ width: `${st.completionPercentage}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase whitespace-nowrap ${
                            st.overallStatus === 'COMPLETED'
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200'
                              : st.overallStatus === 'PENDING VERIFICATION'
                              ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200'
                              : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200'
                          }`}>
                            {st.overallStatus}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right pr-6 whitespace-nowrap">
                          <button
                            onClick={() => setSelectedStudentForCertificates(st)}
                            className="py-1.5 px-3 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition inline-flex items-center space-x-1.5 cursor-pointer shadow-xs min-h-[36px]"
                          >
                            <FolderOpen className="w-3.5 h-3.5 shrink-0" />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Page <strong className="text-slate-800 dark:text-slate-200">{page + 1}</strong> of <strong className="text-slate-800 dark:text-slate-200">{totalPages}</strong>
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 transition cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 transition cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Student Certificates Detail Modal */}
      {selectedStudentForCertificates && (
        <StudentCertificatesModal
          student={selectedStudentForCertificates}
          onClose={() => setSelectedStudentForCertificates(null)}
          onUpdated={fetchStudentSummaries}
        />
      )}
    </Layout>
  );
};

export default AllCertificates;
