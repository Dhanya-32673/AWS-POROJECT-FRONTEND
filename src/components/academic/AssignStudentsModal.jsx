import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, UserPlus, X, CheckSquare, Square, Users, 
  AlertCircle, CheckCircle2, Filter, Layers, ArrowRight, Trash2 
} from 'lucide-react';
import { academicService } from '../../services/academicService';
import { useToast } from '../../context/ToastContext';
import { formatBranchGroup, formatIntermediateYear } from '../../utils/studentDataFormatter';

export const AssignStudentsModal = ({ section, onClose, onAssigned }) => {
  const { showSuccess, showError } = useToast();

  const sectionId = section?.id;
  const sectionName = section?.name || section?.sectionName || 'Section';
  const group = section?.branchGroup || section?.group || 'MPC';
  const year = section?.intermediateYear || section?.year || '1st Year';
  const academicYear = section?.academicYear || '2026-2027';
  const capacity = section?.capacity || 60;
  const currentAssigned = section?.totalStudents || section?.studentCount || 0;

  // Filter States
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState(group); // Default to section's group
  const [yearFilter, setYearFilter] = useState(year); // Default to section's year
  const [academicYearFilter, setAcademicYearFilter] = useState(academicYear);
  const [unassignedOnly, setUnassignedOnly] = useState(false);

  // Data States
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('available'); // 'available' | 'selected'

  // Remaining capacity calculation
  const remainingCapacity = Math.max(0, capacity - currentAssigned);
  const isOverCapacity = selectedStudents.length > remainingCapacity;

  useEffect(() => {
    fetchAvailable();
  }, [sectionId, groupFilter, yearFilter, academicYearFilter, unassignedOnly]);

  const fetchAvailable = async () => {
    if (!sectionId) return;
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (groupFilter && groupFilter !== 'ALL') params.branchGroup = groupFilter;
      if (yearFilter && yearFilter !== 'ALL') params.intermediateYear = yearFilter;
      if (academicYearFilter && academicYearFilter !== 'ALL') params.academicYear = academicYearFilter;
      if (unassignedOnly) params.unassignedOnly = true;

      const data = await academicService.getAvailableStudents(sectionId, params);
      setAvailableStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch available students:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch available students');
    } finally {
      setLoading(false);
    }
  };

  // Filtered available students by search query
  const filteredAvailable = useMemo(() => {
    if (!search.trim()) return availableStudents;
    const q = search.toLowerCase().trim();
    return availableStudents.filter((s) => {
      const name = (s.fullName || s.name || '').toLowerCase();
      const sId = (s.studentId || '').toLowerCase();
      const adm = (s.admissionNumber || '').toLowerCase();
      const email = (s.emailAddress1 || s.email || '').toLowerCase();
      return name.includes(q) || sId.includes(q) || adm.includes(q) || email.includes(q);
    });
  }, [availableStudents, search]);

  // Selection handlers
  const isStudentSelected = (student) => {
    const sId = student.studentId || student.id;
    return selectedStudents.some((s) => (s.studentId || s.id) === sId);
  };

  const toggleSelectStudent = (student) => {
    const sId = student.studentId || student.id;
    if (isStudentSelected(student)) {
      setSelectedStudents((prev) => prev.filter((s) => (s.studentId || s.id) !== sId));
    } else {
      setSelectedStudents((prev) => [...prev, student]);
    }
  };

  const handleSelectAllFiltered = () => {
    const newItems = [...selectedStudents];
    for (const student of filteredAvailable) {
      const sId = student.studentId || student.id;
      if (!newItems.some((s) => (s.studentId || s.id) === sId)) {
        newItems.push(student);
      }
    }
    setSelectedStudents(newItems);
  };

  const handleClearSelection = () => {
    setSelectedStudents([]);
  };

  const handleRemoveSelected = (studentId) => {
    setSelectedStudents((prev) => prev.filter((s) => (s.studentId || s.id) !== studentId));
  };

  // Submission
  const handleSubmitAssignment = async () => {
    if (selectedStudents.length === 0 || submitting) return;
    if (isOverCapacity) {
      showError(`Cannot assign ${selectedStudents.length} students. Only ${remainingCapacity} spot(s) remaining in ${sectionName}.`);
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const studentIds = selectedStudents.map((s) => s.studentId || s.id);
      await academicService.assignStudentsToSection(sectionId, studentIds);
      showSuccess(`Successfully assigned ${selectedStudents.length} student(s) to ${sectionName}.`);
      if (onAssigned) onAssigned();
      onClose();
    } catch (err) {
      console.error('Failed to assign students:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to assign students to section';
      setError(msg);
      showError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/60 dark:bg-slate-950/40">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Assign Students to {sectionName}
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-2">
                <span><strong>Target:</strong> {formatBranchGroup(group)} • {formatIntermediateYear(year)} ({academicYear})</span>
                <span>•</span>
                <span><strong>Capacity:</strong> {currentAssigned} / {capacity}</span>
                <span>•</span>
                <span className={`font-bold ${remainingCapacity > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {remainingCapacity} Available Spot{remainingCapacity !== 1 ? 's' : ''}
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer self-end sm:self-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Capacity Warning Banner */}
        {isOverCapacity && (
          <div className="px-4 sm:px-6 py-2.5 bg-rose-50 dark:bg-rose-950/40 border-b border-rose-200 text-rose-700 dark:text-rose-400 text-xs font-bold flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Capacity exceeded! You selected {selectedStudents.length} students, but only {remainingCapacity} spot(s) are remaining. Please unselect {selectedStudents.length - remainingCapacity} student(s).</span>
          </div>
        )}

        {/* Tabs: Available vs Selected */}
        <div className="px-4 sm:px-6 pt-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('available')}
              className={`pb-3 px-3 text-xs font-black border-b-2 transition flex items-center space-x-2 cursor-pointer ${
                activeTab === 'available'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <span>Available Students</span>
              <span className="px-2 py-0.5 text-[10px] bg-slate-100 dark:bg-slate-800 rounded-full font-bold">
                {filteredAvailable.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('selected')}
              className={`pb-3 px-3 text-xs font-black border-b-2 transition flex items-center space-x-2 cursor-pointer ${
                activeTab === 'selected'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <span>Selected for Assignment</span>
              <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${
                selectedStudents.length > 0 ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
              }`}>
                {selectedStudents.length}
              </span>
            </button>
          </div>

          {activeTab === 'available' && (
            <div className="flex items-center gap-2 pb-2">
              <button
                type="button"
                onClick={handleSelectAllFiltered}
                disabled={filteredAvailable.length === 0}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer disabled:opacity-40"
              >
                Select All Filtered
              </button>
              {selectedStudents.length > 0 && (
                <>
                  <span className="text-slate-300">•</span>
                  <button
                    type="button"
                    onClick={handleClearSelection}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
                  >
                    Clear All
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Filters Bar (Only on Available tab) */}
        {activeTab === 'available' && (
          <div className="p-3 sm:p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 flex flex-wrap items-center gap-2.5">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search name, student ID, admission..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600/20"
              />
            </div>

            <select
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
              className="py-1.5 px-3 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold cursor-pointer"
            >
              <option value="ALL">All Groups</option>
              <option value="MPC">MPC</option>
              <option value="BiPC">BiPC</option>
              <option value="MEC">MEC</option>
              <option value="CEC">CEC</option>
              <option value="HEC">HEC</option>
            </select>

            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="py-1.5 px-3 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold cursor-pointer"
            >
              <option value="ALL">All Study Years</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
            </select>

            <label className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={unassignedOnly}
                onChange={(e) => setUnassignedOnly(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer w-3.5 h-3.5"
              />
              <span>Unassigned Only</span>
            </label>
          </div>
        )}

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-thin">
          {activeTab === 'available' ? (
            loading ? (
              <div className="py-16 flex flex-col items-center justify-center space-y-3">
                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-bold text-slate-500">Loading available students...</p>
              </div>
            ) : error ? (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl flex items-center justify-between text-xs font-bold">
                <span>{error}</span>
                <button onClick={fetchAvailable} className="underline">Retry</button>
              </div>
            ) : filteredAvailable.length === 0 ? (
              <div className="py-16 text-center space-y-2">
                <Users className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No eligible students found</p>
                <p className="text-xs text-slate-500">Try changing group, academic year, or clearing the search filter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {filteredAvailable.map((student) => {
                  const sId = student.studentId || student.id;
                  const isSelected = isStudentSelected(student);
                  const currentSec = student.section || 'Unassigned';
                  const isUnassigned = !student.section || student.section.toLowerCase() === 'unassigned';

                  return (
                    <div
                      key={sId}
                      onClick={() => toggleSelectStudent(student)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-600 shadow-sm'
                          : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className={`p-1 rounded-lg shrink-0 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`}>
                          {isSelected ? <CheckSquare className="w-5 h-5 text-blue-600" /> : <Square className="w-5 h-5" />}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                            {student.fullName || 'Student'}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">
                            ID: <span className="text-blue-600 font-bold">{student.studentId || 'N/A'}</span> • Adm: {student.admissionNumber || '—'}
                          </div>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="px-1.5 py-0.5 text-[10px] bg-slate-100 dark:bg-slate-700 font-bold rounded">
                              {student.branchGroup || 'MPC'}
                            </span>
                            <span className="px-1.5 py-0.5 text-[10px] bg-slate-100 dark:bg-slate-700 font-bold rounded">
                              {student.intermediateYear || '1st Year'}
                            </span>
                            <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                              isUnassigned ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {isUnassigned ? 'Unassigned' : `In ${currentSec}`}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            selectedStudents.length === 0 ? (
              <div className="py-16 text-center space-y-2">
                <Users className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No students selected yet</p>
                <p className="text-xs text-slate-500">Go to the "Available Students" tab to select students for this section.</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between pb-2 text-xs font-bold text-slate-500">
                  <span>Selected Students ({selectedStudents.length})</span>
                  <button
                    onClick={handleClearSelection}
                    className="text-rose-600 hover:text-rose-700 cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                  {selectedStudents.map((student) => {
                    const sId = student.studentId || student.id;
                    return (
                      <div
                        key={sId}
                        className="p-3 bg-white dark:bg-slate-800 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition"
                      >
                        <div>
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {student.fullName || 'Student'}
                          </span>
                          <span className="text-xs font-mono text-blue-600 ml-2 font-bold">
                            ({student.studentId || 'N/A'})
                          </span>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {student.branchGroup} • {student.intermediateYear} • Current: {student.section || 'Unassigned'}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveSelected(sId)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition cursor-pointer"
                          title="Remove from selection"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs font-bold text-slate-600 dark:text-slate-300">
            Selected: <span className="text-blue-600 font-extrabold">{selectedStudents.length}</span> students | Remaining capacity: <span className={remainingCapacity >= selectedStudents.length ? 'text-emerald-600 font-extrabold' : 'text-rose-600 font-extrabold'}>{remainingCapacity}</span>
          </div>

          <div className="flex items-center space-x-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmitAssignment}
              disabled={selectedStudents.length === 0 || submitting || isOverCapacity}
              className="flex-1 sm:flex-none px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>{submitting ? 'Assigning...' : `Assign ${selectedStudents.length > 0 ? selectedStudents.length : ''} Students`}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AssignStudentsModal;
