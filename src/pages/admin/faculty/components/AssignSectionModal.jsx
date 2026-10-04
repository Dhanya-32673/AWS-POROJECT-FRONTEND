import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Layers, BookOpen, AlertCircle, CheckCircle2 } from 'lucide-react';
import academicService from '../../../../services/academicService';
import FacultyAvatar from './FacultyAvatar';

export const AssignSectionModal = ({ isOpen, onClose, onAssign, faculty = null }) => {
  const [sections, setSections] = useState([]);
  const [loadingSections, setLoadingSections] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadSections();
      setSelectedSectionId('');
      setSubjectName('');
      setError('');
    }
  }, [isOpen]);

  const loadSections = async () => {
    setLoadingSections(true);
    try {
      const data = await academicService.getAllSections(true);
      setSections(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load sections:', err);
      setError('Failed to fetch available sections list');
    } finally {
      setLoadingSections(false);
    }
  };

  if (!isOpen || !faculty) return null;

  const selectedSection = sections.find((s) => String(s.id) === String(selectedSectionId));

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedSectionId) {
      setError('Please select an academic section');
      return;
    }

    if (!selectedSection) {
      setError('Invalid section selected');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        branchGroup: selectedSection.branchGroup,
        intermediateYear: selectedSection.intermediateYear,
        section: selectedSection.name,
        academicYear: selectedSection.academicYear,
        subjectName: subjectName.trim() || `${selectedSection.branchGroup} Core`
      };

      await onAssign(faculty.id, payload);
      onClose();
    } catch (err) {
      console.error('Assignment error:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to assign section to faculty';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col my-auto max-h-[calc(100vh-3rem)]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-blue-50/70 dark:bg-blue-950/40 shrink-0">
          <div className="flex items-center space-x-3">
            <FacultyAvatar
              src={faculty.photoUrl}
              name={faculty.fullName}
              size="w-10 h-10 text-sm"
              className="rounded-xl shadow-md shadow-blue-600/20"
            />
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Assign Section to Faculty
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {faculty.fullName} ({faculty.facultyId})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleAssign} className="p-6 space-y-5">
          {error && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl text-rose-700 dark:text-rose-400 text-xs flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Select Academic Section <span className="text-rose-500">*</span>
            </label>
            {loadingSections ? (
              <div className="flex items-center space-x-2 text-xs text-slate-500 p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <span className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span>Loading available sections...</span>
              </div>
            ) : (
              <select
                value={selectedSectionId}
                onChange={(e) => setSelectedSectionId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">-- Choose a Section --</option>
                {sections.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.name} ({sec.branchGroup} - {sec.intermediateYear}, {sec.academicYear})
                  </option>
                ))}
              </select>
            )}
          </div>

          {selectedSection && (
            <div className="p-3.5 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-xl space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span className="font-semibold">Stream / Group:</span>
                <span className="font-bold text-blue-700 dark:text-blue-400">{selectedSection.branchGroup}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span className="font-semibold">Year of Study:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedSection.intermediateYear}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span className="font-semibold">Academic Session:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedSection.academicYear}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span className="font-semibold">Current Capacity:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedSection.assignedStudents ?? 0} / {selectedSection.capacity ?? 60} Students</span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Subject / Course Taught
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <BookOpen className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="e.g. Mathematics IIA, Physics, Organic Chemistry"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Leave blank to default to core group subject.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedSectionId}
              className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/25 transition cursor-pointer flex items-center space-x-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Assigning...</span>
                </>
              ) : (
                <span>Confirm Assignment</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};

export default AssignSectionModal;
