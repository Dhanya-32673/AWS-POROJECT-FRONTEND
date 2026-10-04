import React from 'react';
import { createPortal } from 'react-dom';
import { 
  X, User, Mail, Phone, Calendar, Briefcase, GraduationCap, 
  Layers, Users, Trash2, Plus, CheckCircle2, AlertCircle, Edit, MapPin 
} from 'lucide-react';

export const FacultyProfileModal = ({ 
  isOpen, 
  onClose, 
  faculty, 
  onEdit, 
  onOpenAssign, 
  onRemoveAssignment,
  onToggleStatus 
}) => {
  if (!isOpen || !faculty) return null;

  const assignments = faculty.assignments || [];
  const activeAssignments = assignments.filter((a) => a.active);

  const modalContent = (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col my-auto max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3.5rem)]">
        {/* Header */}
        <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-blue-500/20 bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3.5 sm:space-x-4 min-w-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center text-lg sm:text-xl font-bold shadow-lg overflow-hidden shrink-0">
              {faculty.photoUrl ? (
                <img
                  src={faculty.photoUrl}
                  alt={faculty.fullName}
                  className="w-full h-full object-cover rounded-2xl"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              ) : (
                <span>{faculty.fullName?.charAt(0) || 'F'}</span>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black tracking-tight truncate">{faculty.fullName}</h2>
                <span className={`px-2 py-0.5 text-[10px] sm:text-[11px] font-bold rounded-md uppercase tracking-wider ${
                  faculty.status === 'ACTIVE' ? 'bg-emerald-400/25 text-emerald-100 border border-emerald-300/40' : 'bg-rose-400/25 text-rose-100 border border-rose-300/40'
                }`}>
                  {faculty.status}
                </span>
              </div>
              <p className="text-xs text-blue-100 mt-0.5 truncate font-medium">
                {faculty.designation} • {faculty.department}
              </p>
              <div className="text-[11px] font-mono text-blue-200/90 mt-0.5">
                ID: {faculty.facultyId} {faculty.employeeId ? `• Emp ID: ${faculty.employeeId}` : ''}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 shrink-0 ml-2">
            <button
              onClick={() => {
                onClose();
                onEdit(faculty);
              }}
              className="px-3 py-1.5 text-xs font-bold text-white bg-white/20 hover:bg-white/30 border border-white/30 rounded-xl transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
              title="Edit Faculty Profile"
            >
              <Edit className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Edit Profile</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition shrink-0 cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 flex-1 min-h-0">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-blue-50/60 dark:bg-slate-800/60 rounded-xl border border-blue-100/80 dark:border-slate-700/80">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-semibold">Assigned Sections</span>
              <span className="text-lg font-black text-blue-600 dark:text-blue-400 mt-0.5 block">{activeAssignments.length}</span>
            </div>
            <div className="p-3.5 bg-blue-50/60 dark:bg-slate-800/60 rounded-xl border border-blue-100/80 dark:border-slate-700/80">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-semibold">Total Students</span>
              <span className="text-lg font-black text-blue-600 dark:text-blue-400 mt-0.5 block">{faculty.assignedStudentCount ?? 0}</span>
            </div>
            <div className="p-3.5 bg-blue-50/60 dark:bg-slate-800/60 rounded-xl border border-blue-100/80 dark:border-slate-700/80">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-semibold">Primary Group</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white mt-1 block">{faculty.primaryGroup || 'General'}</span>
            </div>
            <div className="p-3.5 bg-blue-50/60 dark:bg-slate-800/60 rounded-xl border border-blue-100/80 dark:border-slate-700/80">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-semibold">Employment</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white mt-1 block">{faculty.employmentType || 'Permanent'}</span>
            </div>
          </div>

          {/* Contact & Personal Information */}
          <div className="bg-slate-50/80 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center space-x-2">
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span>Contact & Personal Details</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-6 text-xs">
              <div className="flex items-center space-x-2.5 text-slate-600 dark:text-slate-300">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-semibold text-slate-500">Email:</span>
                <span className="font-bold text-slate-900 dark:text-white truncate">{faculty.email}</span>
              </div>
              <div className="flex items-center space-x-2.5 text-slate-600 dark:text-slate-300">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-semibold text-slate-500">Phone:</span>
                <span className="font-bold text-slate-900 dark:text-white">{faculty.mobileNumber || 'N/A'}</span>
              </div>
              {faculty.alternateMobile && (
                <div className="flex items-center space-x-2.5 text-slate-600 dark:text-slate-300">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-semibold text-slate-500">Alt Phone:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{faculty.alternateMobile}</span>
                </div>
              )}
              <div className="flex items-center space-x-2.5 text-slate-600 dark:text-slate-300">
                <GraduationCap className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-semibold text-slate-500">Qualification:</span>
                <span className="font-bold text-slate-900 dark:text-white">{faculty.qualification || 'N/A'}</span>
              </div>
              <div className="flex items-center space-x-2.5 text-slate-600 dark:text-slate-300">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-semibold text-slate-500">Joining Date:</span>
                <span className="font-bold text-slate-900 dark:text-white">{faculty.joiningDate ? String(faculty.joiningDate).split('T')[0] : 'N/A'}</span>
              </div>
              {faculty.dateOfBirth && (
                <div className="flex items-center space-x-2.5 text-slate-600 dark:text-slate-300">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-semibold text-slate-500">Date of Birth:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{String(faculty.dateOfBirth).split('T')[0]}</span>
                </div>
              )}
              <div className="flex items-center space-x-2.5 text-slate-600 dark:text-slate-300">
                <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-semibold text-slate-500">Experience:</span>
                <span className="font-bold text-slate-900 dark:text-white">{faculty.experience || 'N/A'}</span>
              </div>
              <div className="flex items-center space-x-2.5 text-slate-600 dark:text-slate-300">
                <User className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-semibold text-slate-500">Gender:</span>
                <span className="font-bold text-slate-900 dark:text-white">{faculty.gender || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Residential Address Card */}
          {(faculty.address || faculty.city || faculty.district || faculty.state || faculty.pinCode) && (
            <div className="bg-slate-50/80 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80 text-xs">
              <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2 flex items-center space-x-2">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>Residential Address</span>
              </h3>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                {[faculty.address, faculty.city, faculty.district, faculty.state].filter(Boolean).join(', ')}
                {faculty.pinCode ? ` - ${faculty.pinCode}` : ''}
              </p>
            </div>
          )}

          {/* Assigned Sections Table */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <span>Assigned Sections & Subjects</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Classes and student cohorts currently supervised by this faculty
                </p>
              </div>
              <button
                onClick={() => onOpenAssign(faculty)}
                className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Assign Section</span>
              </button>
            </div>

            {assignments.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                <Layers className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No Academic Sections Assigned</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Click "Assign Section" above to attach a section to this faculty member.</p>
              </div>
            ) : (
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3">Section</th>
                      <th className="py-2.5 px-3">Group</th>
                      <th className="py-2.5 px-3">Year</th>
                      <th className="py-2.5 px-3">Session</th>
                      <th className="py-2.5 px-3">Subject</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {assignments.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition">
                        <td className="py-2.5 px-3 font-bold text-blue-600 dark:text-blue-400">
                          {a.section}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                          {a.branchGroup}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                          {a.intermediateYear}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                          {a.academicYear}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300 font-medium">
                          {a.subjectName || 'Core Subject'}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => onRemoveAssignment(faculty.id, a.id)}
                            className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition cursor-pointer"
                            title="Remove section assignment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 sm:px-6 sm:py-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/90 dark:bg-slate-900/90 shrink-0">
          <div>
            <button
              onClick={() => onToggleStatus(faculty.id, faculty.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                faculty.status === 'ACTIVE'
                  ? 'text-amber-700 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200'
                  : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200'
              }`}
            >
              {faculty.status === 'ACTIVE' ? 'Deactivate Faculty' : 'Activate Faculty'}
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                onClose();
                onEdit(faculty);
              }}
              className="px-4 py-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900/60 transition cursor-pointer flex items-center space-x-1.5"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/25 transition cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};

export default FacultyProfileModal;
