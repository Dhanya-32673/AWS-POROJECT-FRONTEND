import React, { useState, useEffect, useMemo } from 'react';
import AdminLayout from '../../../layouts/AdminLayout';
import FacultyLayout from '../../../layouts/FacultyLayout';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import academicService from '../../../services/academicService';
import SectionMembersModal from '../../../components/academic/SectionMembersModal';
import AssignStudentsModal from '../../../components/academic/AssignStudentsModal';
import DeleteConfirmationModal from '../../../components/common/DeleteConfirmationModal';
import { usePageTitle } from '../../../hooks/usePageTitle';
import { 
  Layers, Plus, Download, Users, UserX, CheckCircle2, 
  Search, Filter, X, Edit, Trash2, Eye, UserPlus, 
  Power, AlertCircle, RefreshCw, ChevronRight, BarChart3
} from 'lucide-react';
import { formatBranchGroup, formatIntermediateYear } from '../../../utils/studentDataFormatter';

export const SectionManagement = () => {
  usePageTitle('Section Management');
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const rawRole = (
    typeof user?.role === 'string'
      ? user.role
      : user?.role?.roleName || user?.role?.name || ''
  ).replace('ROLE_', '').toUpperCase();
  const isAdmin = rawRole === 'ADMIN' || rawRole === 'SUPER_ADMIN';
  const Layout = isAdmin ? AdminLayout : FacultyLayout;

  // Data States
  const [sections, setSections] = useState([]);
  const [stats, setStats] = useState({
    totalSections: 0,
    totalStudentsAssigned: 0,
    unassignedStudents: 0,
    activeSections: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Search & Filter States
  const [searchName, setSearchName] = useState('');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('ALL');
  const [selectedGroup, setSelectedGroup] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [viewingSection, setViewingSection] = useState(null);
  const [assigningSection, setAssigningSection] = useState(null);
  const [deletingSection, setDeletingSection] = useState(null);
  const [exporting, setExporting] = useState(false);

  // Form State for Create / Edit
  const [formData, setFormData] = useState({
    name: '',
    academicYear: '2026-2027',
    branchGroup: 'MPC',
    intermediateYear: '1st Year',
    capacity: 60,
    active: true,
    description: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [formSubmitting, setFormSubmitting] = useState(false);

  useEffect(() => {
    loadData(true);
  }, []);

  const loadData = async (initial = false) => {
    if (initial) setLoading(true);
    else setRefreshing(true);
    setError('');

    try {
      const [sectionsData, statsData] = await Promise.all([
        academicService.getAllSections(true),
        academicService.getSectionStats(),
      ]);
      setSections(Array.isArray(sectionsData) ? sectionsData : []);
      if (statsData) {
        setStats({
          totalSections: statsData.totalSections ?? sectionsData?.length ?? 0,
          totalStudentsAssigned: statsData.totalStudentsAssigned ?? 0,
          unassignedStudents: statsData.unassignedStudents ?? 0,
          activeSections: statsData.activeSections ?? 0,
        });
      }
    } catch (err) {
      console.error('Failed to load section data:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to load sections from server';
      setError(msg);
      showError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Distinct Filter Options derived from real records
  const academicYears = useMemo(() => {
    const set = new Set(['2026-2027', '2026-2028', '2025-2026']);
    sections.forEach((s) => {
      if (s.academicYear) set.add(s.academicYear.trim());
    });
    return Array.from(set).sort().reverse();
  }, [sections]);

  const groups = useMemo(() => {
    const set = new Set(['MPC', 'BiPC', 'MEC', 'CEC', 'HEC']);
    sections.forEach((s) => {
      if (s.branchGroup) set.add(s.branchGroup.trim());
    });
    return Array.from(set).sort();
  }, [sections]);

  // Filtered Sections
  const filteredSections = useMemo(() => {
    return sections.filter((sec) => {
      // Name Search
      if (searchName.trim()) {
        const q = searchName.toLowerCase().trim();
        const sName = (sec.name || sec.sectionName || '').toLowerCase();
        if (!sName.includes(q)) return false;
      }
      // Academic Year
      if (selectedAcademicYear !== 'ALL') {
        if ((sec.academicYear || '').trim() !== selectedAcademicYear) return false;
      }
      // Group
      if (selectedGroup !== 'ALL') {
        const g = (sec.branchGroup || sec.group || '').trim().toUpperCase();
        if (g !== selectedGroup.toUpperCase()) return false;
      }
      // Status
      if (selectedStatus !== 'ALL') {
        const isActive = sec.active !== false;
        if (selectedStatus === 'ACTIVE' && !isActive) return false;
        if (selectedStatus === 'INACTIVE' && isActive) return false;
      }
      return true;
    });
  }, [sections, searchName, selectedAcademicYear, selectedGroup, selectedStatus]);

  const handleClearFilters = () => {
    setSearchName('');
    setSelectedAcademicYear('ALL');
    setSelectedGroup('ALL');
    setSelectedStatus('ALL');
  };

  const hasActiveFilters = searchName || selectedAcademicYear !== 'ALL' || selectedGroup !== 'ALL' || selectedStatus !== 'ALL';

  // Open Create Form
  const handleOpenCreateModal = () => {
    setFormData({
      name: '',
      academicYear: '2026-2027',
      branchGroup: 'MPC',
      intermediateYear: '1st Year',
      capacity: 60,
      active: true,
      description: '',
    });
    setFormErrors({});
    setShowCreateModal(true);
  };

  // Open Edit Form
  const handleOpenEditModal = (sec) => {
    setEditingSection(sec);
    setFormData({
      name: sec.name || sec.sectionName || '',
      academicYear: sec.academicYear || '2026-2027',
      branchGroup: sec.branchGroup || sec.group || 'MPC',
      intermediateYear: sec.intermediateYear || sec.year || '1st Year',
      capacity: sec.capacity || 60,
      active: sec.active !== false,
      description: sec.description || '',
    });
    setFormErrors({});
  };

  // Validate Form
  const validateForm = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Section name is required (e.g. Section A)';
    if (!formData.academicYear.trim()) errs.academicYear = 'Academic year is required';
    if (!formData.branchGroup) errs.branchGroup = 'Group / Stream is required';
    if (!formData.intermediateYear) errs.intermediateYear = 'Year of study is required';
    if (!formData.capacity || Number(formData.capacity) <= 0) {
      errs.capacity = 'Capacity must be a positive integer';
    } else if (editingSection) {
      const assigned = editingSection.totalStudents || editingSection.studentCount || 0;
      if (Number(formData.capacity) < assigned) {
        errs.capacity = `Capacity cannot be lower than currently assigned students (${assigned})`;
      }
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submit Create or Edit
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!validateForm() || formSubmitting) return;

    setFormSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        academicYear: formData.academicYear.trim(),
        branchGroup: formData.branchGroup,
        intermediateYear: formData.intermediateYear,
        capacity: Number(formData.capacity),
        active: Boolean(formData.active),
        description: formData.description?.trim() || '',
      };

      if (editingSection) {
        await academicService.updateSection(editingSection.id, payload);
        showSuccess(`Section ${payload.name} updated successfully!`);
        setEditingSection(null);
      } else {
        await academicService.createSection(payload);
        showSuccess(`Section ${payload.name} created successfully!`);
        setShowCreateModal(false);
      }
      await loadData(false);
    } catch (err) {
      console.error('Failed saving section:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to save section';
      showError(msg);
    } finally {
      setFormSubmitting(false);
    }
  };

  // Toggle Active Status
  const handleToggleStatus = async (sec) => {
    try {
      const newStatus = !sec.active;
      await academicService.toggleSectionStatus(sec.id, newStatus);
      showSuccess(`Section ${sec.name} is now ${newStatus ? 'Active' : 'Inactive'}.`);
      await loadData(false);
    } catch (err) {
      console.error('Failed toggling status:', err);
      showError(err.response?.data?.message || err.message || 'Failed to update section status');
    }
  };

  // Delete Section
  const handleConfirmDelete = async () => {
    if (!deletingSection) return;
    const assigned = deletingSection.totalStudents || deletingSection.studentCount || 0;
    if (assigned > 0) {
      showError(`Cannot delete ${deletingSection.name}. It has ${assigned} student(s) assigned.`);
      setDeletingSection(null);
      return;
    }

    try {
      await academicService.deleteSection(deletingSection.id);
      showSuccess(`Section ${deletingSection.name} deleted successfully.`);
      setDeletingSection(null);
      await loadData(false);
    } catch (err) {
      console.error('Failed deleting section:', err);
      showError(err.response?.data?.message || err.message || 'Failed to delete section');
    }
  };

  // Export Sections to Excel
  const handleExportSections = async () => {
    setExporting(true);
    try {
      const response = await academicService.exportSectionsExcel();
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `Bhashyam_Academic_Sections_${new Date().toISOString().slice(0, 10)}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      showSuccess('Sections exported to Excel successfully!');
    } catch (err) {
      console.error('Backend Excel export failed, creating CSV fallback:', err);
      try {
        const headers = ["ID", "Section Name", "Academic Year", "Group / Stream", "Year of Study", "Assigned Students", "Capacity", "Status", "Assigned Faculty", "Description"];
        const rows = filteredSections.map((sec) => [
          `"${sec.id || ''}"`,
          `"${sec.name || ''}"`,
          `"${sec.academicYear || ''}"`,
          `"${sec.branchGroup || ''}"`,
          `"${sec.intermediateYear || ''}"`,
          `"${sec.totalStudents || 0}"`,
          `"${sec.capacity || 60}"`,
          `"${sec.active !== false ? 'Active' : 'Inactive'}"`,
          `"${sec.assignedFacultyName || 'Not Assigned'}"`,
          `"${sec.description || ''}"`
        ]);
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Bhashyam_Academic_Sections_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showSuccess('Sections exported successfully!');
      } catch (fallbackErr) {
        showError('Failed to export sections');
      }
    } finally {
      setExporting(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6 font-sans">
        
        {/* Page Header */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="p-2.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-2xl shadow-xs">
                <Layers className="w-6 h-6" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Section Management
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Create, organize, and manage academic sections and student allocations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={handleExportSections}
              disabled={exporting || sections.length === 0}
              className="flex-1 sm:flex-none py-2.5 px-4 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 rounded-xl shadow-xs transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 min-h-[44px]"
            >
              <Download className="w-4 h-4 text-blue-600" />
              <span>{exporting ? 'Exporting...' : 'Export Sections'}</span>
            </button>

            {isAdmin && (
              <button
                onClick={handleOpenCreateModal}
                className="flex-1 sm:flex-none py-2.5 px-4 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/25 transition flex items-center justify-center space-x-2 cursor-pointer min-h-[44px]"
              >
                <Plus className="w-4 h-4" />
                <span>Create Section</span>
              </button>
            )}

            <button
              onClick={() => loadData(false)}
              disabled={refreshing}
              className="p-2.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center border border-slate-200 dark:border-slate-800"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Dashboard Statistics Cards (4 Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Total Sections */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center space-x-4 transition hover:shadow-md">
            <div className="w-13 h-13 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Total Sections
              </span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                {stats.totalSections}
              </div>
            </div>
          </div>

          {/* Card 2: Total Students Assigned */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center space-x-4 transition hover:shadow-md">
            <div className="w-13 h-13 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Students Assigned
              </span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                {stats.totalStudentsAssigned}
              </div>
            </div>
          </div>

          {/* Card 3: Unassigned Students */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center space-x-4 transition hover:shadow-md">
            <div className="w-13 h-13 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-100 dark:border-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <UserX className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Unassigned Students
              </span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                {stats.unassignedStudents}
              </div>
            </div>
          </div>

          {/* Card 4: Active Sections */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center space-x-4 transition hover:shadow-md">
            <div className="w-13 h-13 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Active Sections
              </span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                {stats.activeSections}
              </div>
            </div>
          </div>

        </div>

        {/* Search and Filters Section */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search section name (e.g. Section A, MPC)..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
              />
              {searchName && (
                <button
                  onClick={() => setSearchName('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Academic Year Filter */}
              <select
                value={selectedAcademicYear}
                onChange={(e) => setSelectedAcademicYear(e.target.value)}
                className="py-2.5 px-3 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-700 dark:text-slate-300 cursor-pointer min-w-[130px]"
              >
                <option value="ALL">All Academic Years</option>
                {academicYears.map((ay) => (
                  <option key={ay} value={ay}>{ay}</option>
                ))}
              </select>

              {/* Group Filter */}
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="py-2.5 px-3 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-700 dark:text-slate-300 cursor-pointer min-w-[110px]"
              >
                <option value="ALL">All Groups</option>
                {groups.map((grp) => (
                  <option key={grp} value={grp}>{grp}</option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="py-2.5 px-3 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-700 dark:text-slate-300 cursor-pointer min-w-[110px]"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="py-2.5 px-3 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/40 rounded-2xl border border-rose-100 dark:border-rose-900/50 transition cursor-pointer flex items-center space-x-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Clear Filters</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Section List / Table Container */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Academic Sections Directory
              </h2>
              <span className="px-2 py-0.5 text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 rounded-full">
                {filteredSections.length}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <div className="w-9 h-9 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-bold text-slate-500">Loading academic sections...</p>
            </div>
          ) : error ? (
            <div className="p-6 text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{error}</p>
              <button
                onClick={() => loadData(true)}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl"
              >
                Retry Loading
              </button>
            </div>
          ) : filteredSections.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-16 h-16 bg-blue-50 dark:bg-slate-800 text-blue-600 rounded-3xl mx-auto flex items-center justify-center">
                <Layers className="w-8 h-8 opacity-60" />
              </div>
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-200">
                {hasActiveFilters ? 'No sections match the selected filters' : 'No academic sections created yet'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {hasActiveFilters
                  ? 'Try clearing or changing your filters to see more results.'
                  : 'Start by creating your first academic section to allocate students.'}
              </p>
              {hasActiveFilters ? (
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 text-xs font-bold text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition"
                >
                  Clear Filters
                </button>
              ) : (
                isAdmin && (
                  <button
                    onClick={handleOpenCreateModal}
                    className="px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition inline-flex items-center space-x-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Section</span>
                  </button>
                )
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 uppercase tracking-wider text-[10px] font-black">
                    <th className="py-3.5 px-4">Section Name</th>
                    <th className="py-3.5 px-4">Academic Year</th>
                    <th className="py-3.5 px-4">Group</th>
                    <th className="py-3.5 px-4">Year</th>
                    <th className="py-3.5 px-4 min-w-[160px]">Students / Capacity</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right min-w-[200px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredSections.map((sec) => {
                    const assigned = sec.totalStudents || sec.studentCount || 0;
                    const cap = sec.capacity || 60;
                    const pct = cap > 0 ? Math.min(100, Math.round((assigned / cap) * 100)) : 0;
                    
                    // Capacity status color
                    let barColor = 'bg-blue-600';
                    let badgeColor = 'text-blue-600 bg-blue-50';
                    if (pct >= 100) {
                      barColor = 'bg-rose-500';
                      badgeColor = 'text-rose-600 bg-rose-50';
                    } else if (pct >= 80) {
                      barColor = 'bg-amber-500';
                      badgeColor = 'text-amber-600 bg-amber-50';
                    }

                    return (
                      <tr 
                        key={sec.id}
                        className="hover:bg-blue-50/30 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3.5 px-4">
                          <div className="font-extrabold text-slate-900 dark:text-white text-sm">
                            {sec.name}
                          </div>
                          {sec.description && (
                            <div className="text-[11px] text-slate-500 truncate max-w-xs">
                              {sec.description}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                          {sec.academicYear}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 text-[11px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded-md">
                            {formatBranchGroup(sec.branchGroup)}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                          {formatIntermediateYear(sec.intermediateYear)}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-extrabold text-slate-800 dark:text-slate-200">
                                {assigned} / {cap}
                              </span>
                              <span className={`px-1.5 py-0.2 rounded font-extrabold text-[10px] ${badgeColor}`}>
                                {pct}%
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 text-[11px] font-bold rounded-lg ${
                            sec.active !== false
                              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}>
                            {sec.active !== false ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            
                            {/* View Students */}
                            <button
                              onClick={() => setViewingSection(sec)}
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
                              title="View Students"
                            >
                              <Users className="w-4 h-4" />
                            </button>

                            {/* Assign / Manage Students */}
                            {isAdmin && (
                              <button
                                onClick={() => setAssigningSection(sec)}
                                className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
                                title="Manage / Assign Students"
                              >
                                <UserPlus className="w-4 h-4" />
                              </button>
                            )}

                            {/* Edit Section */}
                            {isAdmin && (
                              <button
                                onClick={() => handleOpenEditModal(sec)}
                                className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
                                title="Edit Section"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            )}

                            {/* Toggle Status */}
                            {isAdmin && (
                              <button
                                onClick={() => handleToggleStatus(sec)}
                                className={`p-1.5 rounded-lg transition cursor-pointer ${
                                  sec.active !== false
                                    ? 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                                }`}
                                title={sec.active !== false ? 'Deactivate Section' : 'Activate Section'}
                              >
                                <Power className="w-4 h-4" />
                              </button>
                            )}

                            {/* Safe Delete */}
                            {isAdmin && (
                              <button
                                onClick={() => setDeletingSection(sec)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition cursor-pointer"
                                title="Delete Section"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}

                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

        </div>

      </div>

      {/* CREATE SECTION MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
            
            <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-950/40">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    Create New Section
                  </h3>
                  <p className="text-xs text-slate-500">
                    Add a new academic section for student allocation.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 p-2 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
              
              {/* Section Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Section Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Section A, Section B, Section C"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 ${
                    formErrors.name ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                  }`}
                />
                {formErrors.name && (
                  <p className="text-[11px] text-rose-500 mt-1 font-semibold">{formErrors.name}</p>
                )}
              </div>

              {/* Academic Year & Group Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Academic Year <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.academicYear}
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                    className="w-full px-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold"
                  >
                    <option value="2026-2027">2026-2027</option>
                    <option value="2026-2028">2026-2028</option>
                    <option value="2025-2026">2025-2026</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Group / Stream <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.branchGroup}
                    onChange={(e) => setFormData({ ...formData, branchGroup: e.target.value })}
                    className="w-full px-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold"
                  >
                    <option value="MPC">MPC</option>
                    <option value="BiPC">BiPC</option>
                    <option value="MEC">MEC</option>
                    <option value="CEC">CEC</option>
                    <option value="HEC">HEC</option>
                  </select>
                </div>
              </div>

              {/* Year of Study & Capacity Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Year of Study <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.intermediateYear}
                    onChange={(e) => setFormData({ ...formData, intermediateYear: e.target.value })}
                    className="w-full px-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Max Student Capacity <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className={`w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 ${
                      formErrors.capacity ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                    }`}
                  />
                  {formErrors.capacity && (
                    <p className="text-[11px] text-rose-500 mt-1 font-semibold">{formErrors.capacity}</p>
                  )}
                </div>
              </div>

              {/* Status Toggle */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Section Status
                </label>
                <div className="flex items-center space-x-3 mt-1">
                  <label className="flex items-center space-x-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="radio"
                      name="activeStatus"
                      checked={formData.active === true}
                      onChange={() => setFormData({ ...formData, active: true })}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>Active</span>
                  </label>
                  <label className="flex items-center space-x-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="radio"
                      name="activeStatus"
                      checked={formData.active === false}
                      onChange={() => setFormData({ ...formData, active: false })}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>Inactive</span>
                  </label>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Description / Notes (Optional)
                </label>
                <textarea
                  rows="2"
                  placeholder="Optional section notes..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600/20"
                />
              </div>

              {/* Modal Buttons */}
              <div className="pt-2 flex items-center justify-end space-x-2.5">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      name: '',
                      academicYear: '2026-2027',
                      branchGroup: 'MPC',
                      intermediateYear: '1st Year',
                      capacity: 60,
                      active: true,
                      description: '',
                    });
                    setFormErrors({});
                  }}
                  className="px-3.5 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 rounded-xl transition cursor-pointer"
                >
                  Reset Form
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition cursor-pointer disabled:opacity-50"
                >
                  {formSubmitting ? 'Creating...' : 'Create Section'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* EDIT SECTION MODAL */}
      {editingSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
            
            <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-950/40">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <Edit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    Edit {editingSection.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Currently has {editingSection.totalStudents || editingSection.studentCount || 0} assigned student(s).
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingSection(null)}
                className="text-slate-400 hover:text-slate-600 p-2 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
              
              {/* Section Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Section Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 ${
                    formErrors.name ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                  }`}
                />
                {formErrors.name && (
                  <p className="text-[11px] text-rose-500 mt-1 font-semibold">{formErrors.name}</p>
                )}
              </div>

              {/* Academic Year & Group Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Academic Year <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.academicYear}
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                    className="w-full px-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold"
                  >
                    <option value="2026-2027">2026-2027</option>
                    <option value="2026-2028">2026-2028</option>
                    <option value="2025-2026">2025-2026</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Group / Stream <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.branchGroup}
                    onChange={(e) => setFormData({ ...formData, branchGroup: e.target.value })}
                    className="w-full px-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold"
                  >
                    <option value="MPC">MPC</option>
                    <option value="BiPC">BiPC</option>
                    <option value="MEC">MEC</option>
                    <option value="CEC">CEC</option>
                    <option value="HEC">HEC</option>
                  </select>
                </div>
              </div>

              {/* Year of Study & Capacity Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Year of Study <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.intermediateYear}
                    onChange={(e) => setFormData({ ...formData, intermediateYear: e.target.value })}
                    className="w-full px-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Max Student Capacity <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={editingSection.totalStudents || 1}
                    max="500"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className={`w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 ${
                      formErrors.capacity ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                    }`}
                  />
                  {formErrors.capacity && (
                    <p className="text-[11px] text-rose-500 mt-1 font-semibold">{formErrors.capacity}</p>
                  )}
                </div>
              </div>

              {/* Status Toggle */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Section Status
                </label>
                <div className="flex items-center space-x-3 mt-1">
                  <label className="flex items-center space-x-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="radio"
                      name="editActiveStatus"
                      checked={formData.active === true}
                      onChange={() => setFormData({ ...formData, active: true })}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>Active</span>
                  </label>
                  <label className="flex items-center space-x-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="radio"
                      name="editActiveStatus"
                      checked={formData.active === false}
                      onChange={() => setFormData({ ...formData, active: false })}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>Inactive</span>
                  </label>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Description / Notes (Optional)
                </label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600/20"
                />
              </div>

              {/* Modal Buttons */}
              <div className="pt-2 flex items-center justify-end space-x-2.5">
                <button
                  type="button"
                  onClick={() => setEditingSection(null)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition cursor-pointer disabled:opacity-50"
                >
                  {formSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* VIEW SECTION MEMBERS MODAL */}
      {viewingSection && (
        <SectionMembersModal
          section={viewingSection}
          onClose={() => setViewingSection(null)}
          onUpdated={() => loadData(false)}
          onOpenAssignModal={(sec) => setAssigningSection(sec)}
        />
      )}

      {/* ASSIGN STUDENTS MODAL */}
      {assigningSection && (
        <AssignStudentsModal
          section={assigningSection}
          onClose={() => setAssigningSection(null)}
          onAssigned={() => loadData(false)}
        />
      )}

      {/* DELETE SECTION CONFIRMATION */}
      {deletingSection && (
        <DeleteConfirmationModal
          isOpen={!!deletingSection}
          onClose={() => setDeletingSection(null)}
          onConfirm={handleConfirmDelete}
          title={`Delete ${deletingSection.name}?`}
          message={
            (deletingSection.totalStudents || deletingSection.studentCount || 0) > 0
              ? `WARNING: This section currently has ${deletingSection.totalStudents || deletingSection.studentCount} assigned student(s). You must move or remove all students before this section can be deleted.`
              : `Are you sure you want to permanently delete section '${deletingSection.name}'? This action cannot be undone.`
          }
          confirmText={(deletingSection.totalStudents || deletingSection.studentCount || 0) > 0 ? "Cannot Delete" : "Delete Section"}
          confirmVariant="danger"
          disabled={(deletingSection.totalStudents || deletingSection.studentCount || 0) > 0}
        />
      )}

    </Layout>
  );
};

export default SectionManagement;
