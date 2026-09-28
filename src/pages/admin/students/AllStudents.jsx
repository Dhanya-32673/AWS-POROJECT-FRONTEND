import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../../layouts/AdminLayout';
import FacultyLayout from '../../../layouts/FacultyLayout';
import { useAuth } from '../../../context/AuthContext';
import StudentStatusBadge from '../../../components/students/StudentStatusBadge';
import studentService from '../../../services/studentService';
import ExportExcelButton from '../../../components/students/ExportExcelButton';
import StudentAvatar from '../../../components/common/StudentAvatar';
import {
  Users,
  UserPlus,
  Search,
  Eye,
  Edit3,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  FileSpreadsheet,
  X
} from 'lucide-react';
import ImportStudentsModal from '../../../components/students/ImportStudentsModal';

import { AnimatePresence, motion } from 'framer-motion';
import { useDebounce } from '../../../hooks/useDebounce';
import { useDataRefresh } from '../../../utils/dataSync';
import { formatSectionName, formatBranchGroup } from '../../../utils/studentDataFormatter';
import { useDeleteAnimation } from '../../../hooks/useDeleteAnimation';
import DeleteConfirmModal from '../../../components/common/DeleteConfirmModal';
import AnimatedDeleteWrapper from '../../../components/common/AnimatedDeleteWrapper';
import { usePageTitle } from '../../../hooks/usePageTitle';

export const AllStudents = () => {
  usePageTitle('Students');
  const navigate = useNavigate();
  const { user } = useAuth();
  const rawRole = (typeof user?.role === 'string' ? user.role : user?.role?.roleName || user?.role?.name || '').replace('ROLE_', '').toUpperCase();
  const isAdmin = rawRole === 'ADMIN';
  const Layout = isAdmin ? AdminLayout : FacultyLayout;

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [successNotification, setSuccessNotification] = useState('');

  // Selection State for Multi-Student Selection
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Filtering & Pagination state
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [campus, setCampus] = useState('');
  const [group, setGroup] = useState('');
  const [groups, setGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [section, setSection] = useState('');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const officialCampuses = [
    "TITANIC", "SUSRUTHA", "DHANVANTARI", "GIRLS", "VAIDEHI", "MEDEX",
    "AIIMS CCO", "CCO", "ABDUL KALAM", "DCO", "INDRA BHAVAN", "APARNA",
    "VISWAKARMA", "VASISTA", "GARUDA", "GCO", "ADITHYA CO", "VAARAHI"
  ];

  // Selection calculations based on currently visible students on active page
  const visibleStudentIds = students.map((s) => String(s.studentId || s.id));
  const isAllSelected = visibleStudentIds.length > 0 && visibleStudentIds.every((id) => selectedStudentIds.includes(id));
  const isSomeSelected = visibleStudentIds.some((id) => selectedStudentIds.includes(id));
  const isIndeterminate = isSomeSelected && !isAllSelected;

  const toggleStudentSelection = (studentId) => {
    const id = String(studentId);
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedStudentIds((prev) => prev.filter((id) => !visibleStudentIds.includes(id)));
    } else {
      setSelectedStudentIds((prev) => Array.from(new Set([...prev, ...visibleStudentIds])));
    }
  };

  const clearSelection = () => {
    setSelectedStudentIds([]);
  };

  const selectedStudentsList = students.filter((s) => selectedStudentIds.includes(String(s.studentId || s.id)));

  // Dynamically load available groups from database
  useEffect(() => {
    let isMounted = true;
    const loadGroups = async () => {
      setLoadingGroups(true);
      try {
        const data = await studentService.getStudentGroups();
        if (isMounted && Array.isArray(data)) {
          const cleanGroups = Array.from(
            new Set(data.map((g) => (typeof g === 'string' ? g.trim() : '').toUpperCase()).filter(Boolean))
          ).sort();
          setGroups((prev) => Array.from(new Set([...prev, ...cleanGroups])).sort());
        }
      } catch (err) {
        console.error('Failed to load groups:', err);
      } finally {
        if (isMounted) setLoadingGroups(false);
      }
    };
    loadGroups();
    return () => {
      isMounted = false;
    };
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data = await studentService.getStudents({
        page,
        size: 10,
        campus: campus || undefined,
        group: group || undefined,
        department: group || undefined,
        section: section || undefined,
        status: status || undefined,
        search: debouncedSearch || undefined,
      });

      const fetchedList = data.content || [];
      setStudents(fetchedList);
      setTotalPages(data.totalPages || 1);
      setTotalElements(data.totalElements || 0);

      const studentGroups = fetchedList
        .map((s) => (s.branchGroup || s.group || s.department || '').trim().toUpperCase())
        .filter(Boolean);
      if (studentGroups.length > 0) {
        setGroups((prev) => Array.from(new Set([...prev, ...studentGroups])).sort());
      }
    } catch (err) {
      setError('Failed to fetch students. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page, campus, group, section, status, debouncedSearch]);
  useDataRefresh(['students'], fetchStudents);

  const { confirmDelete, closeModal, handleProceedDelete, modalState } = useDeleteAnimation();

  // Individual Delete Handler
  const handleDeleteStudentClick = (st) => {
    const targetId = String(st.studentId || st.id);
    confirmDelete({
      id: targetId,
      item: st,
      title: 'Delete this student?',
      message: (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Are you sure you want to delete this student?</p>
          <div className="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs space-y-1">
            <p className="font-bold text-slate-900 dark:text-white text-sm">{st.fullName}</p>
            <p className="font-mono text-blue-600 dark:text-blue-400">Student ID: {st.studentId}</p>
            <p className="font-mono text-slate-500 dark:text-slate-400">Admission Number: {st.admissionNumber || 'N/A'}</p>
          </div>
          <div className="bg-amber-50 dark:bg-amber-950/40 p-3 rounded-xl border border-amber-200 dark:border-amber-800/50 text-xs text-amber-800 dark:text-amber-300 space-y-1">
            <p className="font-semibold">This action will permanently remove:</p>
            <ul className="list-disc list-inside space-y-0.5 text-xs text-amber-700 dark:text-amber-300">
              <li>Student profile</li>
              <li>Student login account</li>
              <li>Student-owned authentication/session data</li>
              <li>Student-owned documents & certificates</li>
            </ul>
          </div>
          <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">This will permanently delete the student profile and their login account.</p>
        </div>
      ),
      confirmText: 'Delete Student',
      deleteApiFn: (id) => studentService.deleteStudent(id),
      onOptimisticRemove: (id) => {
        setStudents((prev) => prev.filter((s) => String(s.studentId || s.id) !== String(id)));
        setSelectedStudentIds((prev) => prev.filter((item) => item !== String(id)));
        setTotalElements((prev) => Math.max(0, prev - 1));
        setSuccessNotification('Student and login account deleted successfully.');
        setTimeout(() => setSuccessNotification(''), 4000);
      },
      onFinalized: () => {
        fetchStudents();
      }
    });
  };

  // Bulk Delete Handler
  const handleBulkDeleteClick = () => {
    if (selectedStudentIds.length === 0) return;
    setBulkDeleteModalOpen(true);
  };

  const handleProceedBulkDelete = async () => {
    if (selectedStudentIds.length === 0) return;
    setIsBulkDeleting(true);
    try {
      const result = await studentService.deleteStudentsBulk(selectedStudentIds);
      const count = result?.count || selectedStudentIds.length;
      setSelectedStudentIds([]);
      setBulkDeleteModalOpen(false);
      setSuccessNotification(`${count} student${count !== 1 ? 's' : ''} and their login account${count !== 1 ? 's were' : ' was'} deleted successfully.`);
      setTimeout(() => setSuccessNotification(''), 4000);
      fetchStudents();
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to delete selected students. No changes were made.');
    } finally {
      setIsBulkDeleting(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-5 sm:space-y-6 font-sans">
        
        {/* Top Header Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-2 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl">
                <Users className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {isAdmin ? 'Student Directory' : 'Assigned Students'}
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Manage student enrollment records, sections, and certificates ({totalElements} total enrolled)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <button
              id="add-student-btn"
              onClick={() => navigate('/admin/students/add')}
              className="flex-1 sm:flex-none py-2.5 px-4 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition flex items-center justify-center space-x-2 cursor-pointer min-h-[44px]"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Student</span>
            </button>

            <button
              id="import-students-excel-btn"
              onClick={() => setImportModalOpen(true)}
              className="flex-1 sm:flex-none py-2.5 px-4 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-500/20 transition flex items-center justify-center space-x-2 cursor-pointer min-h-[44px]"
              title={isAdmin ? "Import students from Excel (.xlsx)" : "Import students into your assigned section (.xlsx)"}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Import Students</span>
            </button>

            <div className="flex-1 sm:flex-none">
              <ExportExcelButton />
            </div>
          </div>
        </div>

        {/* Success Banner */}
        {successNotification && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center justify-between shadow-xs">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{successNotification}</span>
            </div>
            <button
              onClick={() => setSuccessNotification('')}
              className="p-1 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-lg text-emerald-600 transition"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Selection Toolbar Bar (Shows when 1 or more students are selected) */}
        <AnimatePresence>
          {isAdmin && selectedStudentIds.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-blue-50/90 dark:bg-blue-950/70 border border-blue-200/80 dark:border-blue-800 p-3.5 rounded-2xl flex items-center justify-between shadow-xs"
            >
              <div className="flex items-center space-x-2.5">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                  {selectedStudentIds.length}
                </span>
                <span className="text-xs font-bold text-blue-950 dark:text-blue-200">
                  {selectedStudentIds.length === 1 ? '1 student selected' : `${selectedStudentIds.length} students selected`}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={clearSelection}
                  className="px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-blue-100/60 dark:hover:bg-blue-900/50 rounded-xl transition cursor-pointer"
                >
                  Clear Selection
                </button>

                <button
                  type="button"
                  onClick={handleBulkDeleteClick}
                  disabled={isBulkDeleting}
                  className="py-1.5 px-3.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-xl shadow-xs shadow-rose-500/20 transition flex items-center space-x-1.5 cursor-pointer min-h-[36px]"
                  aria-label="Delete selected students"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isBulkDeleting ? 'Deleting...' : 'Delete Selected'}</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filter & Search Bar */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search by ID, Full Name, Admission No, Roll No..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 min-h-[44px]"
              />
            </div>

            <div className="grid grid-cols-1 xs:grid-cols-4 sm:flex sm:items-center gap-2 w-full md:w-auto">
              <select
                id="campus-filter"
                value={campus}
                onChange={(e) => {
                  setCampus(e.target.value);
                  setPage(0);
                }}
                className="w-full sm:w-auto px-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-300 focus:outline-none min-h-[44px] cursor-pointer"
              >
                <option value="">All Campuses</option>
                {officialCampuses.map((cmp) => (
                  <option key={cmp} value={cmp}>
                    {cmp}
                  </option>
                ))}
              </select>

              <select
                id="group-filter"
                value={group}
                onChange={(e) => {
                  setGroup(e.target.value);
                  setPage(0);
                }}
                disabled={loadingGroups}
                className="w-full sm:w-auto px-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-300 focus:outline-none min-h-[44px] cursor-pointer disabled:opacity-60"
              >
                <option value="">All Groups</option>
                {groups.map((grp) => (
                  <option key={grp} value={grp}>
                    {grp}
                  </option>
                ))}
              </select>

              <select
                id="status-filter"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(0);
                }}
                className="w-full sm:w-auto px-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-300 focus:outline-none min-h-[44px] cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="PASSED_OUT">Passed Out</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
          </div>
        </div>

        {/* Student List View: Mobile Stacked Cards (< md) + Desktop Table (md+) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          
          {/* Loading State */}
          {loading ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <span className="inline-block animate-spin rounded-full h-7 w-7 border-2 border-blue-600 border-t-transparent" />
              <p className="text-xs font-semibold">Loading student directory...</p>
            </div>
          ) : students.length === 0 ? (
            /* Empty State */
            <div className="py-16 text-center text-slate-400 p-6">
              <div className="flex flex-col items-center justify-center space-y-3 max-w-sm mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-500 shadow-inner">
                  <Users className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    {!isAdmin ? 'No students assigned to you yet.' : 'No student profiles found.'}
                  </p>
                  <p className="text-xs text-slate-400">
                    {!isAdmin
                      ? 'Contact college administration to assign sections or add new students.'
                      : 'Try adjusting your search query or filter criteria.'}
                  </p>
                </div>
                {(search || group || section || status) && (
                  <button
                    onClick={() => {
                      setSearch('');
                      setGroup('');
                      setSection('');
                      setStatus('');
                      setPage(0);
                    }}
                    className="mt-3 px-4 py-2 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* MOBILE STACKED CARDS (< md) */}
              <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                <AnimatePresence>
                  {students.map((st) => {
                    const stId = String(st.studentId || st.id);
                    const isSelected = selectedStudentIds.includes(stId);
                    return (
                      <AnimatedDeleteWrapper
                        key={stId}
                        as="div"
                        className={`p-4 space-y-3 transition ${
                          isSelected
                            ? 'bg-blue-50/70 dark:bg-blue-950/40'
                            : 'bg-white dark:bg-slate-900 hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center space-x-3 min-w-0">
                            {isAdmin && (
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleStudentSelection(stId)}
                                className="w-4.5 h-4.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer shrink-0 mt-0.5"
                                aria-label={`Select ${st.fullName}`}
                              />
                            )}
                            <StudentAvatar
                              src={st.profilePhotoUrl}
                              name={st.fullName}
                              studentId={st.studentId}
                              size="md"
                            />
                            <div className="min-w-0">
                              <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{st.fullName}</h4>
                              <p className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">{st.studentId}</p>
                              <p className="text-[11px] text-slate-400 truncate">
                                Adm: <strong className="font-mono text-slate-700 dark:text-slate-300">{st.admissionNumber || '—'}</strong>
                              </p>
                            </div>
                          </div>
                          <StudentStatusBadge status={st.status} />
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl">
                          <div>
                            <span className="text-[10px] text-slate-400 block uppercase font-extrabold">Group & Year</span>
                            <span className="font-bold text-blue-700 dark:text-blue-300 truncate block">
                              {formatBranchGroup(st.branchGroup || st.academicDetail?.branchGroup)}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block uppercase font-extrabold">Section</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
                              Section {formatSectionName(st.section || st.academicDetail?.section)}
                            </span>
                          </div>
                        </div>

                        {/* Mobile Action Buttons Bar */}
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => navigate(`/admin/students/${st.studentId || st.id}`)}
                            className="flex-1 py-2 px-3 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 text-blue-700 dark:text-blue-300 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 min-h-[44px] cursor-pointer"
                            aria-label="View profile"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View</span>
                          </button>
                          {isAdmin && (
                            <>
                              <button
                                onClick={() => navigate(`/admin/students/${st.studentId || st.id}/edit`)}
                                className="py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 min-h-[44px] cursor-pointer"
                                title="Edit Student"
                                aria-label="Edit Student"
                              >
                                <Edit3 className="w-4 h-4" />
                                <span className="hidden xs:inline">Edit</span>
                              </button>
                              <button
                                onClick={() => handleDeleteStudentClick(st)}
                                className="py-2 px-3 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 min-h-[44px] cursor-pointer"
                                title="Delete Student"
                                aria-label="Delete Student"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span className="hidden xs:inline">Delete</span>
                              </button>
                            </>
                          )}
                        </div>
                      </AnimatedDeleteWrapper>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* DESKTOP TABLE VIEW (md+) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-extrabold uppercase text-[11px] tracking-wider whitespace-nowrap">
                    <tr>
                      {isAdmin && (
                        <th className="py-3.5 px-4 text-center w-12">
                          <input
                            type="checkbox"
                            checked={isAllSelected}
                            ref={(input) => {
                              if (input) {
                                input.indeterminate = isIndeterminate;
                              }
                            }}
                            onChange={handleSelectAll}
                            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                            aria-label="Select all students"
                          />
                        </th>
                      )}
                      <th className="py-3.5 px-6">STUDENT ID</th>
                      <th className="py-3.5 px-4 min-w-[160px]">STUDENT NAME</th>
                      <th className="py-3.5 px-4">ADMISSION NUMBER</th>
                      <th className="py-3.5 px-4">GROUP & YEAR</th>
                      <th className="py-3.5 px-4">SECTION</th>
                      <th className="py-3.5 px-4">STATUS</th>
                      {isAdmin && <th className="py-3.5 px-4 text-center">DELETE</th>}
                      <th className="py-3.5 px-4 text-right pr-6 min-w-[100px]">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    <AnimatePresence>
                      {students.map((st) => {
                        const stId = String(st.studentId || st.id);
                        const isSelected = selectedStudentIds.includes(stId);
                        return (
                          <AnimatedDeleteWrapper
                            key={stId}
                            as="tr"
                            className={`transition ${
                              isSelected
                                ? 'bg-blue-50/70 dark:bg-blue-950/40 hover:bg-blue-100/60 dark:hover:bg-blue-900/50'
                                : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/50'
                            }`}
                          >
                            {isAdmin && (
                              <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleStudentSelection(stId)}
                                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                                  aria-label={`Select ${st.fullName}`}
                                />
                              </td>
                            )}
                            <td className="py-3.5 px-6 font-mono font-bold text-blue-600 dark:text-blue-400">
                              {st.studentId}
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="flex items-center space-x-3">
                                <StudentAvatar
                                  src={st.profilePhotoUrl}
                                  name={st.fullName}
                                  studentId={st.studentId}
                                  size="sm"
                                />
                                <div>
                                  <span className="font-bold text-slate-900 dark:text-white block">{st.fullName}</span>
                                  <span className="text-[10px] text-blue-500 font-bold">{st.hostelDayScholar === 'HOSTEL' ? 'Hostel' : 'Day Scholar'}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                              {st.admissionNumber || '—'}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded-md text-[10px] font-extrabold">
                                {formatBranchGroup(st.branchGroup || st.academicDetail?.branchGroup)}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">
                              {formatSectionName(st.section || st.academicDetail?.section)}
                            </td>
                            <td className="py-3.5 px-4">
                              <StudentStatusBadge status={st.status} />
                            </td>
                            {isAdmin && (
                              <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => handleDeleteStudentClick(st)}
                                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-xl transition cursor-pointer min-w-[36px] min-h-[36px] inline-flex items-center justify-center"
                                  title="Delete Student"
                                  aria-label="Delete student"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            )}
                            <td className="py-3.5 px-4 text-right pr-6 whitespace-nowrap">
                              <div className="inline-flex items-center justify-end space-x-1">
                                <button
                                  onClick={() => navigate(`/admin/students/${st.studentId || st.id}`)}
                                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded-xl transition cursor-pointer min-w-[36px] min-h-[36px] inline-flex items-center justify-center"
                                  title="View Student Profile"
                                  aria-label="View Student Profile"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>

                                {isAdmin && (
                                  <button
                                    onClick={() => navigate(`/admin/students/${st.studentId || st.id}/edit`)}
                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded-xl transition cursor-pointer min-w-[36px] min-h-[36px] inline-flex items-center justify-center"
                                    title="Edit Student Profile"
                                    aria-label="Edit Student Profile"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </AnimatedDeleteWrapper>
                        );
                      })}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Page <strong className="text-slate-800 dark:text-slate-200">{page + 1}</strong> of <strong className="text-slate-800 dark:text-slate-200">{totalPages}</strong> ({totalElements} items)
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

      {/* Single Student Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        onConfirm={handleProceedDelete}
        title={modalState.title}
        message={modalState.message}
        confirmText={modalState.confirmText || 'Delete Student'}
        itemName={modalState.item?.fullName || modalState.item?.name || modalState.id}
      />

      {/* Bulk Student Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={bulkDeleteModalOpen}
        onClose={() => !isBulkDeleting && setBulkDeleteModalOpen(false)}
        onConfirm={handleProceedBulkDelete}
        isDeleting={isBulkDeleting}
        title={`Delete ${selectedStudentIds.length} Selected Student${selectedStudentIds.length !== 1 ? 's' : ''}?`}
        confirmText={isBulkDeleting ? 'Deleting students...' : `Delete ${selectedStudentIds.length} ${selectedStudentIds.length === 1 ? 'Student' : 'Students'}`}
        message={
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              You are about to delete <strong className="text-slate-900 dark:text-white font-bold">{selectedStudentIds.length}</strong> {selectedStudentIds.length === 1 ? 'student profile and linked login account' : 'student profiles and linked login accounts'}. This action cannot be undone.
            </p>
            {selectedStudentsList.length > 0 && (
              <div className="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs space-y-1.5 max-h-40 overflow-y-auto">
                <p className="text-[11px] font-extrabold uppercase text-slate-400">Selected Students:</p>
                {selectedStudentsList.map((st) => (
                  <div key={st.studentId || st.id} className="flex items-center justify-between font-semibold text-slate-800 dark:text-slate-200">
                    <span>• {st.fullName}</span>
                    <span className="font-mono text-blue-600 dark:text-blue-400 text-[11px]">{st.studentId}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="bg-amber-50 dark:bg-amber-950/40 p-3 rounded-xl border border-amber-200 dark:border-amber-800/50 text-xs text-amber-800 dark:text-amber-300 space-y-1">
              <p className="font-semibold">This action will permanently remove:</p>
              <ul className="list-disc list-inside space-y-0.5 text-xs text-amber-700 dark:text-amber-300">
                <li>Selected student profiles</li>
                <li>Linked login accounts & credentials</li>
                <li>Associated certificates & documents</li>
              </ul>
            </div>
            <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">
              This will permanently delete the selected student profiles and their linked login accounts.
            </p>
          </div>
        }
      />

      {/* Bulk Student Import from Excel Modal */}
      <ImportStudentsModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onSuccess={() => {
          fetchStudents();
        }}
      />
    </Layout>
  );
};

export default AllStudents;
