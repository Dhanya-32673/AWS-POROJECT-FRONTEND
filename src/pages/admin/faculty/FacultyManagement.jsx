import React, { useState, useEffect, useMemo } from 'react';
import AdminLayout from '../../../layouts/AdminLayout';
import FacultyLayout from '../../../layouts/FacultyLayout';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import facultyService from '../../../services/facultyService';
import FacultyFormModal from './components/FacultyFormModal';
import FacultyProfileModal from './components/FacultyProfileModal';
import AssignSectionModal from './components/AssignSectionModal';
import FacultyAvatar from './components/FacultyAvatar';
import DeleteConfirmationModal from '../../../components/common/DeleteConfirmationModal';
import { usePageTitle } from '../../../hooks/usePageTitle';
import { 
  GraduationCap, Plus, Download, Users, UserCheck, Layers, 
  UserX, Search, Filter, X, Edit, Trash2, Eye, RefreshCw, 
  AlertCircle, ChevronRight, Phone, Mail, BookOpen, ShieldAlert
} from 'lucide-react';

export const FacultyManagement = () => {
  usePageTitle('Faculty Management');
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
  const [facultyList, setFacultyList] = useState([]);
  const [stats, setStats] = useState({
    totalFaculty: 0,
    activeFaculty: 0,
    assignedFaculty: 0,
    unassignedFaculty: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [viewingFaculty, setViewingFaculty] = useState(null);
  const [assigningFaculty, setAssigningFaculty] = useState(null);
  const [deletingFaculty, setDeletingFaculty] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [lastViewedFacultyId, setLastViewedFacultyId] = useState(null);

  useEffect(() => {
    loadData(true);
  }, []);

  const loadData = async (initial = false) => {
    if (initial) setLoading(true);
    else setRefreshing(true);
    setError('');

    try {
      const [listRes, statsRes] = await Promise.all([
        facultyService.getAllFaculty(),
        facultyService.getFacultyStats(),
      ]);

      const items = Array.isArray(listRes?.content) ? listRes.content : (Array.isArray(listRes) ? listRes : []);
      setFacultyList(items);

      if (statsRes) {
        setStats({
          totalFaculty: statsRes.totalFaculty ?? items.length,
          activeFaculty: statsRes.activeFaculty ?? 0,
          assignedFaculty: statsRes.assignedFaculty ?? 0,
          unassignedFaculty: statsRes.unassignedFaculty ?? 0,
        });
      }
    } catch (err) {
      console.error('Failed to load faculty data:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to load faculty data from server';
      setError(msg);
      showError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Filtered Faculty List
  const filteredFaculty = useMemo(() => {
    return facultyList.filter((f) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = f.fullName?.toLowerCase().includes(q);
        const matchesId = f.facultyId?.toLowerCase().includes(q) || f.employeeId?.toLowerCase().includes(q);
        const matchesEmail = f.email?.toLowerCase().includes(q);
        const matchesPhone = f.mobileNumber?.includes(q);
        if (!matchesName && !matchesId && !matchesEmail && !matchesPhone) return false;
      }

      // Group
      if (selectedGroup !== 'ALL') {
        if (f.primaryGroup?.toUpperCase() !== selectedGroup.toUpperCase()) return false;
      }

      // Status
      if (selectedStatus !== 'ALL') {
        if (f.status?.toUpperCase() !== selectedStatus.toUpperCase()) return false;
      }

      return true;
    });
  }, [facultyList, searchQuery, selectedGroup, selectedStatus]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedGroup('ALL');
    setSelectedStatus('ALL');
  };

  const hasActiveFilters = searchQuery !== '' || selectedGroup !== 'ALL' || selectedStatus !== 'ALL';

  // Create or Update Faculty
  const handleSaveFaculty = async (formData, id, photoFile) => {
    let savedFaculty;
    if (id) {
      savedFaculty = await facultyService.updateFaculty(id, formData);
      if (photoFile) {
        await facultyService.uploadFacultyPhoto(id, photoFile);
      }
      showSuccess('Faculty profile updated successfully');
    } else {
      savedFaculty = await facultyService.createFaculty(formData);
      if (photoFile && (savedFaculty?.id || savedFaculty?.data?.id)) {
        const targetId = savedFaculty?.id || savedFaculty?.data?.id;
        await facultyService.uploadFacultyPhoto(targetId, photoFile);
      }
      showSuccess('Faculty member created successfully');
    }
    await loadData(false);
    if (id && (viewingFaculty?.id === id || lastViewedFacultyId === id)) {
      const refreshed = await facultyService.getFacultyById(id);
      setViewingFaculty(refreshed);
      setLastViewedFacultyId(null);
    }
  };

  // Toggle Status
  const handleToggleStatus = async (facultyId, newStatus) => {
    try {
      await facultyService.toggleFacultyStatus(facultyId, newStatus);
      showSuccess(`Faculty status updated to ${newStatus}`);
      await loadData(false);
      if (viewingFaculty && viewingFaculty.id === facultyId) {
        setViewingFaculty((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      showError(err.response?.data?.message || 'Failed to update status');
    }
  };

  // Assign Section
  const handleAssignSection = async (facultyId, payload) => {
    await facultyService.addAssignment(facultyId, payload);
    showSuccess('Academic section assigned to faculty successfully');
    await loadData(false);
    // Refresh viewing faculty if currently opened
    if (viewingFaculty && viewingFaculty.id === facultyId) {
      const updated = await facultyService.getFacultyById(facultyId);
      setViewingFaculty(updated);
    }
  };

  // Remove Section Assignment
  const handleRemoveAssignment = async (facultyId, assignmentId) => {
    try {
      await facultyService.removeAssignment(facultyId, assignmentId);
      showSuccess('Section assignment removed');
      await loadData(false);
      if (viewingFaculty && viewingFaculty.id === facultyId) {
        const updated = await facultyService.getFacultyById(facultyId);
        setViewingFaculty(updated);
      }
    } catch (err) {
      console.error('Failed to remove assignment:', err);
      showError(err.response?.data?.message || 'Failed to remove assignment');
    }
  };

  // Safe Deletion
  const handleDeleteFaculty = async () => {
    if (!deletingFaculty) return;

    const activeAssignments = (deletingFaculty.assignments || []).filter((a) => a.active);
    if (activeAssignments.length > 0) {
      showError(`Cannot delete ${deletingFaculty.fullName} because they have ${activeAssignments.length} active section assignment(s). Please unassign sections first.`);
      setDeletingFaculty(null);
      return;
    }

    try {
      await facultyService.deleteFaculty(deletingFaculty.id);
      showSuccess(`Faculty ${deletingFaculty.fullName} deleted successfully`);
      setDeletingFaculty(null);
      await loadData(false);
    } catch (err) {
      console.error('Failed to delete faculty:', err);
      showError(err.response?.data?.message || 'Failed to delete faculty');
    }
  };

  // Export to Excel
  const handleExport = async () => {
    setExporting(true);
    try {
      await facultyService.exportFacultyToExcel({
        query: searchQuery,
        group: selectedGroup,
        status: selectedStatus,
      });
      showSuccess('Faculty directory exported to Excel successfully');
    } catch (err) {
      console.error('Export failed:', err);
      showError(err.message || 'Failed to export faculty directory');
    } finally {
      setExporting(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6 font-sans pb-12">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Faculty Management
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-full border border-blue-200 dark:border-blue-900">
                SICMS Academic
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Manage faculty profiles, academic assignments, and section responsibilities.
            </p>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => loadData(false)}
              disabled={refreshing}
              className="p-2.5 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer shadow-xs disabled:opacity-50"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
            </button>

            <button
              onClick={handleExport}
              disabled={exporting || loading}
              className="px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer shadow-xs flex items-center space-x-2 disabled:opacity-50"
            >
              {exporting ? (
                <span className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download className="w-4 h-4 text-blue-600" />
              )}
              <span>Export Faculty</span>
            </button>

            <button
              onClick={() => {
                setEditingFaculty(null);
                setShowAddModal(true);
              }}
              className="px-4 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/25 transition cursor-pointer flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Faculty</span>
            </button>
          </div>
        </div>

        {/* Dynamic Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Faculty */}
          <div className="bg-white dark:bg-slate-900 border border-blue-100/90 dark:border-slate-800/80 rounded-2xl p-4.5 shadow-xs hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Faculty</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Users className="w-4.5 h-4.5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {loading ? '...' : stats.totalFaculty}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                Registered teaching staff
              </span>
            </div>
          </div>

          {/* Card 2: Active Faculty */}
          <div className="bg-white dark:bg-slate-900 border border-blue-100/90 dark:border-slate-800/80 rounded-2xl p-4.5 shadow-xs hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Active Faculty</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <UserCheck className="w-4.5 h-4.5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {loading ? '...' : stats.activeFaculty}
              </span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-0.5">
                Eligible for assignments
              </span>
            </div>
          </div>

          {/* Card 3: Assigned Faculty */}
          <div className="bg-white dark:bg-slate-900 border border-blue-100/90 dark:border-slate-800/80 rounded-2xl p-4.5 shadow-xs hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Assigned Faculty</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Layers className="w-4.5 h-4.5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {loading ? '...' : stats.assignedFaculty}
              </span>
              <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold block mt-0.5">
                Supervising academic sections
              </span>
            </div>
          </div>

          {/* Card 4: Unassigned Faculty */}
          <div className="bg-white dark:bg-slate-900 border border-blue-100/90 dark:border-slate-800/80 rounded-2xl p-4.5 shadow-xs hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Unassigned Faculty</span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <UserX className="w-4.5 h-4.5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {loading ? '...' : stats.unassignedFaculty}
              </span>
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold block mt-0.5">
                Pending section allocation
              </span>
            </div>
          </div>
        </div>

        {/* Search & Multi-Filter Bar */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search faculty by name, ID, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Group Filter */}
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="ALL">All Streams</option>
              <option value="MPC">MPC</option>
              <option value="BiPC">BiPC</option>
              <option value="MEC">MEC</option>
              <option value="CEC">CEC</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition flex items-center space-x-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Faculty Table / Content */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center space-y-3">
              <span className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin inline-block" />
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Loading faculty members from database...</p>
            </div>
          ) : filteredFaculty.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <GraduationCap className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {hasActiveFilters ? 'No faculty found matching filters' : 'No faculty profiles registered yet'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                {hasActiveFilters
                  ? 'Try clearing the search query or switching your stream/status filter.'
                  : 'Click "+ Add Faculty" to create the first faculty profile and link section responsibilities.'}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-xl transition"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Faculty ID</th>
                    <th className="py-3.5 px-4">Faculty Name</th>
                    <th className="py-3.5 px-4">Email & Phone</th>
                    <th className="py-3.5 px-4">Department</th>
                    <th className="py-3.5 px-4">Assigned Sections</th>
                    <th className="py-3.5 px-4">Students</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredFaculty.map((f) => {
                    const activeAssignments = (f.assignments || []).filter((a) => a.active);

                    return (
                      <tr key={f.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                        {/* ID */}
                        <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                          {f.facultyId}
                        </td>

                        {/* Name & Designation */}
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <FacultyAvatar
                              src={f.photoUrl}
                              name={f.fullName}
                              size="w-9 h-9 text-xs"
                            />
                            <div className="truncate max-w-[180px]">
                              <span className="font-bold text-slate-900 dark:text-white block truncate">{f.fullName}</span>
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                                {f.designation} • {f.primaryGroup || 'General'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Email & Phone */}
                        <td className="py-3 px-4">
                          <div className="space-y-0.5 truncate max-w-[200px]">
                            <div className="flex items-center space-x-1.5 text-slate-700 dark:text-slate-300 truncate">
                              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">{f.email}</span>
                            </div>
                            <div className="flex items-center space-x-1.5 text-slate-500 dark:text-slate-400">
                              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{f.mobileNumber || 'N/A'}</span>
                            </div>
                          </div>
                        </td>

                        {/* Department */}
                        <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                          {f.department}
                        </td>

                        {/* Assigned Sections Badges */}
                        <td className="py-3 px-4">
                          {activeAssignments.length === 0 ? (
                            <span className="text-[11px] text-slate-400 italic">No sections</span>
                          ) : (
                            <div className="flex flex-wrap gap-1 max-w-[220px]">
                              {activeAssignments.map((a) => (
                                <span
                                  key={a.id}
                                  className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 rounded-md text-[10px] font-bold"
                                  title={`${a.branchGroup} - ${a.intermediateYear}, ${a.academicYear}`}
                                >
                                  {a.branchGroup}-{a.section}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>

                        {/* Assigned Student Count */}
                        <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">
                          <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-mono">
                            {f.assignedStudentCount ?? 0}
                          </span>
                        </td>

                        {/* Status Toggle */}
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleToggleStatus(f.id, f.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')}
                            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition cursor-pointer flex items-center space-x-1.5 ${
                              f.status === 'ACTIVE'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900'
                                : 'bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                            }`}
                            title="Click to toggle status"
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${f.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                            <span>{f.status}</span>
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => setViewingFaculty(f)}
                              className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition cursor-pointer"
                              title="View Faculty Profile"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setAssigningFaculty(f)}
                              className="p-1.5 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition cursor-pointer"
                              title="Assign Academic Section"
                            >
                              <Layers className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingFaculty(f);
                                setShowAddModal(true);
                              }}
                              className="p-1.5 text-slate-600 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
                              title="Edit Details"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeletingFaculty(f)}
                              className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition cursor-pointer"
                              title="Delete Faculty"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
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

        {/* Add / Edit Faculty Modal */}
        <FacultyFormModal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setEditingFaculty(null);
            setLastViewedFacultyId(null);
          }}
          onSave={handleSaveFaculty}
          editingFaculty={editingFaculty}
        />

        {/* View Profile Modal */}
        <FacultyProfileModal
          isOpen={Boolean(viewingFaculty)}
          onClose={() => {
            setViewingFaculty(null);
            setLastViewedFacultyId(null);
          }}
          faculty={viewingFaculty}
          onEdit={(f) => {
            setLastViewedFacultyId(f.id);
            setEditingFaculty(f);
            setShowAddModal(true);
          }}
          onOpenAssign={(f) => setAssigningFaculty(f)}
          onRemoveAssignment={handleRemoveAssignment}
          onToggleStatus={handleToggleStatus}
        />

        {/* Assign Section Modal */}
        <AssignSectionModal
          isOpen={Boolean(assigningFaculty)}
          onClose={() => setAssigningFaculty(null)}
          onAssign={handleAssignSection}
          faculty={assigningFaculty}
        />

        {/* Safe Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={Boolean(deletingFaculty)}
          onClose={() => setDeletingFaculty(null)}
          onConfirm={handleDeleteFaculty}
          title="Delete Faculty Profile?"
          itemName={deletingFaculty ? `${deletingFaculty.fullName} (${deletingFaculty.facultyId})` : ''}
          itemType="Faculty Member"
          entityPhoto={deletingFaculty?.photoUrl}
          description={
            deletingFaculty && (deletingFaculty.assignments || []).some((a) => a.active)
              ? `WARNING: This faculty member has active section assignments. Deletion is safely blocked until sections are unassigned.`
              : `Are you sure you want to permanently delete this faculty member? Their login account and personal data will be removed safely.`
          }
        />
      </div>
    </Layout>
  );
};

export default FacultyManagement;
