import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, UserPlus, Eye, X, AlertCircle, UserX, Download, 
  Search, ChevronLeft, ChevronRight, CheckCircle2, Layers 
} from 'lucide-react';
import { academicService } from '../../services/academicService';
import { formatBranchGroup, formatIntermediateYear } from '../../utils/studentDataFormatter';
import DeleteConfirmationModal from '../common/DeleteConfirmationModal';
import { useToast } from '../../context/ToastContext';

export const SectionMembersModal = ({ section, onClose, onUpdated, onOpenAssignModal }) => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selection and actions
  const [selectedIds, setSelectedIds] = useState([]);
  const [studentToRemove, setStudentToRemove] = useState(null);
  const [showBulkUnassignConfirm, setShowBulkUnassignConfirm] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const sectionId = section?.id;
  const sectionName = section?.name || section?.sectionName || 'Section';
  const group = section?.branchGroup || section?.group || 'General';
  const year = section?.intermediateYear || section?.year || '1st Year';
  const academicYear = section?.academicYear || '2026-2027';
  const capacity = section?.capacity || 60;

  useEffect(() => {
    fetchMembers();
  }, [sectionId]);

  const fetchMembers = async () => {
    if (!sectionId) return;
    setLoading(true);
    setError('');
    try {
      const data = await academicService.getSectionMembers(sectionId);
      setMembers(Array.isArray(data) ? data : []);
      setSelectedIds([]);
      setCurrentPage(1);
    } catch (err) {
      console.error('Failed to load section members:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to load section members';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Filtered members by search
  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return members;
    const q = searchQuery.toLowerCase().trim();
    return members.filter((m) => {
      const name = (m.fullName || m.name || '').toLowerCase();
      const sId = (m.studentId || '').toLowerCase();
      const adm = (m.admissionNumber || '').toLowerCase();
      const email = (m.emailAddress1 || m.email || '').toLowerCase();
      return name.includes(q) || sId.includes(q) || adm.includes(q) || email.includes(q);
    });
  }, [members, searchQuery]);

  // Paginated members
  const totalPages = Math.ceil(filteredMembers.length / pageSize) || 1;
  const paginatedMembers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredMembers.slice(start, start + pageSize);
  }, [filteredMembers, currentPage, pageSize]);

  // Selection handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredMembers.map((m) => m.studentId || m.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Single remove
  const handleConfirmRemoveSingle = async () => {
    if (!studentToRemove || removing) return;
    setRemoving(true);
    try {
      const targetId = studentToRemove.studentId || studentToRemove.id;
      const sName = studentToRemove.fullName || studentToRemove.name || 'Student';
      await academicService.removeStudentFromSection(sectionId, targetId);
      showSuccess(`${sName} removed from ${sectionName}.`);
      setStudentToRemove(null);
      await fetchMembers();
      if (onUpdated) onUpdated();
    } catch (err) {
      console.error('Failed to remove student from section:', err);
      showError(err.response?.data?.message || err.message || 'Failed to remove student');
    } finally {
      setRemoving(false);
    }
  };

  // Bulk remove
  const handleConfirmBulkRemove = async () => {
    if (selectedIds.length === 0 || removing) return;
    setRemoving(true);
    setShowBulkUnassignConfirm(false);
    try {
      await academicService.removeStudentsFromSection(sectionId, selectedIds);
      showSuccess(`${selectedIds.length} student(s) unassigned from ${sectionName}.`);
      setSelectedIds([]);
      await fetchMembers();
      if (onUpdated) onUpdated();
    } catch (err) {
      console.error('Failed bulk removing students:', err);
      showError(err.response?.data?.message || err.message || 'Failed to unassign selected students');
    } finally {
      setRemoving(false);
    }
  };

  // Export to Excel
  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const response = await academicService.exportSectionStudentsExcel(sectionId);
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `${sectionName.replace(/\s+/g, '_')}_Students.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      showSuccess(`Exported ${sectionName} students to Excel.`);
    } catch (err) {
      console.error('Backend Excel export failed, creating CSV fallback:', err);
      try {
        // Fallback: Client-side CSV
        const headers = ["Student ID", "Full Name", "Admission Number", "Group", "Year", "Academic Year", "Mobile", "Email", "Status"];
        const rows = members.map(m => [
          `"${m.studentId || ''}"`,
          `"${m.fullName || ''}"`,
          `"${m.admissionNumber || ''}"`,
          `"${m.branchGroup || ''}"`,
          `"${m.intermediateYear || ''}"`,
          `"${m.academicYear || ''}"`,
          `"${m.mobileNumber || ''}"`,
          `"${m.emailAddress1 || ''}"`,
          `"${m.status || 'ACTIVE'}"`
        ]);
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${sectionName.replace(/\s+/g, '_')}_Students.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showSuccess(`Exported ${sectionName} students successfully.`);
      } catch (fallbackErr) {
        showError('Failed to export students');
      }
    } finally {
      setExporting(false);
    }
  };

  const assignedCount = members.length;
  const capacityPct = capacity > 0 ? Math.min(100, Math.round((assignedCount / capacity) * 100)) : 0;
  const capacityColor = capacityPct >= 100 ? 'text-rose-600 bg-rose-50 border-rose-200' : capacityPct >= 80 ? 'text-amber-600 bg-amber-50 border-amber-200' : 'text-blue-600 bg-blue-50 border-blue-200';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Top Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/60 dark:bg-slate-950/40">
          <div className="flex items-start sm:items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {sectionName}
                </h2>
                <span className={`px-2.5 py-0.5 text-xs font-black rounded-lg border ${capacityColor}`}>
                  {assignedCount} / {capacity} Students ({capacityPct}%)
                </span>
                <span className={`px-2 py-0.5 text-[11px] font-extrabold rounded-lg ${section?.active !== false ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'}`}>
                  {section?.active !== false ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-2">
                <span><strong>Group:</strong> {formatBranchGroup(group)}</span>
                <span>•</span>
                <span><strong>Year:</strong> {formatIntermediateYear(year)}</span>
                <span>•</span>
                <span><strong>Academic Year:</strong> {academicYear}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={handleExportExcel}
              disabled={exporting || members.length === 0}
              className="px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 rounded-xl transition flex items-center space-x-1.5 cursor-pointer shadow-xs disabled:opacity-50"
              title="Export section students to Excel"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>{exporting ? 'Exporting...' : 'Export'}</span>
            </button>

            {onOpenAssignModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAssignModal(section);
                }}
                disabled={assignedCount >= capacity}
                className="px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Assign Students</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar & Actions Ribbon */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search students by name, ID, or admission..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {selectedIds.length > 0 && (
              <button
                onClick={() => setShowBulkUnassignConfirm(true)}
                disabled={removing}
                className="px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-xl transition flex items-center space-x-1.5 cursor-pointer"
              >
                <UserX className="w-3.5 h-3.5" />
                <span>Remove Selected ({selectedIds.length})</span>
              </button>
            )}
            <span className="text-xs text-slate-500 font-semibold">
              Showing {filteredMembers.length} {filteredMembers.length === 1 ? 'student' : 'students'}
            </span>
          </div>
        </div>

        {/* Content Table */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-thin">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-bold text-slate-500">Loading section members...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 text-rose-700 dark:text-rose-400 rounded-2xl flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
              <button
                onClick={fetchMembers}
                className="text-xs font-extrabold underline hover:text-rose-900 cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-16 h-16 bg-blue-50 dark:bg-slate-800 text-blue-600 rounded-3xl mx-auto flex items-center justify-center">
                <Users className="w-8 h-8 opacity-60" />
              </div>
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-200">
                {searchQuery ? 'No matching students found' : 'No students assigned yet'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {searchQuery
                  ? 'Try adjusting your search criteria.'
                  : `Assign eligible ${formatBranchGroup(group)} students to ${sectionName}.`}
              </p>
              {!searchQuery && onOpenAssignModal && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenAssignModal(section);
                  }}
                  className="mt-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition cursor-pointer inline-flex items-center space-x-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Assign Students Now</span>
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider text-[10px] font-black">
                    <th className="py-3 px-3.5 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === filteredMembers.length && filteredMembers.length > 0}
                        onChange={handleSelectAll}
                        className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer w-3.5 h-3.5"
                      />
                    </th>
                    <th className="py-3 px-3.5">Student ID</th>
                    <th className="py-3 px-3.5">Student Name</th>
                    <th className="py-3 px-3.5">Admission No.</th>
                    <th className="py-3 px-3.5">Group / Stream</th>
                    <th className="py-3 px-3.5">Academic Year</th>
                    <th className="py-3 px-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {paginatedMembers.map((student) => {
                    const sId = student.studentId || student.id;
                    const isSelected = selectedIds.includes(sId);
                    return (
                      <tr
                        key={sId}
                        className={`hover:bg-blue-50/40 dark:hover:bg-slate-800/40 transition-colors ${
                          isSelected ? 'bg-blue-50/70 dark:bg-blue-950/30' : ''
                        }`}
                      >
                        <td className="py-3 px-3.5 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelect(sId)}
                            className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer w-3.5 h-3.5"
                          />
                        </td>
                        <td className="py-3 px-3.5 font-mono font-bold text-blue-600 dark:text-blue-400">
                          {student.studentId || 'N/A'}
                        </td>
                        <td className="py-3 px-3.5">
                          <div className="font-extrabold text-slate-900 dark:text-white">
                            {student.fullName || 'Student'}
                          </div>
                          {student.emailAddress1 && (
                            <div className="text-[11px] text-slate-500 truncate max-w-xs">
                              {student.emailAddress1}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3.5 font-semibold text-slate-600 dark:text-slate-300">
                          {student.admissionNumber || '—'}
                        </td>
                        <td className="py-3 px-3.5">
                          <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 rounded-md font-bold text-[11px]">
                            {student.branchGroup || group}
                          </span>
                        </td>
                        <td className="py-3 px-3.5 text-slate-600 dark:text-slate-400">
                          {student.academicYear || academicYear}
                        </td>
                        <td className="py-3 px-3.5 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => {
                                onClose();
                                navigate(`/admin/students/${student.studentId || student.id}`);
                              }}
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition"
                              title="View Student Profile"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setStudentToRemove(student)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
                              title="Remove from Section"
                            >
                              <UserX className="w-4 h-4" />
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

        {/* Pagination & Footer */}
        {totalPages > 1 && !loading && (
          <div className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
            <div className="text-xs text-slate-500 font-semibold">
              Page {currentPage} of {totalPages} ({filteredMembers.length} students)
            </div>
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-40 transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-40 transition cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Single Unassign Confirmation Modal */}
      {studentToRemove && (
        <DeleteConfirmationModal
          isOpen={!!studentToRemove}
          onClose={() => setStudentToRemove(null)}
          onConfirm={handleConfirmRemoveSingle}
          title="Remove Student from Section?"
          message={`Are you sure you want to remove ${studentToRemove.fullName || 'this student'} from ${sectionName}? The student will be set to 'Unassigned' and their record will remain intact.`}
          confirmText={removing ? "Removing..." : "Remove from Section"}
          confirmVariant="danger"
        />
      )}

      {/* Bulk Unassign Confirmation Modal */}
      {showBulkUnassignConfirm && (
        <DeleteConfirmationModal
          isOpen={showBulkUnassignConfirm}
          onClose={() => setShowBulkUnassignConfirm(false)}
          onConfirm={handleConfirmBulkRemove}
          title={`Remove ${selectedIds.length} Student(s)?`}
          message={`Are you sure you want to remove the ${selectedIds.length} selected student(s) from ${sectionName}? They will be marked as 'Unassigned' and remain available in the student directory.`}
          confirmText={removing ? "Removing..." : "Remove Selected"}
          confirmVariant="danger"
        />
      )}
    </div>
  );
};

export default SectionMembersModal;
