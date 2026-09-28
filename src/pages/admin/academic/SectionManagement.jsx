import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../../layouts/AdminLayout';
import FacultyLayout from '../../../layouts/FacultyLayout';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import academicService from '../../../services/academicService';
import CampusStudentsModal from '../../../components/academic/SectionMembersModal';
import { Plus, Users, Edit, Trash2, Search, AlertCircle, CheckCircle2, X, Building2 } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { useDataRefresh } from '../../../utils/dataSync';
import { useApiCache, invalidateCache } from '../../../utils/useApiCache';
import { useDeleteAnimation } from '../../../hooks/useDeleteAnimation';
import DeleteConfirmModal from '../../../components/common/DeleteConfirmModal';
import AnimatedDeleteWrapper from '../../../components/common/AnimatedDeleteWrapper';
import DeleteLoadingOverlay from '../../../components/common/DeleteLoadingOverlay';
import { usePageTitle } from '../../../hooks/usePageTitle';

export const CampusManagement = () => {
  usePageTitle('Campus Management');
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const rawRole = (typeof user?.role === 'string' ? user.role : user?.role?.roleName || user?.role?.name || '').replace('ROLE_', '').toUpperCase();
  const isAdmin = rawRole === 'ADMIN';

  const Layout = isAdmin ? AdminLayout : FacultyLayout;

  const { data: rawCampuses, loading, refetch: fetchCampuses } = useApiCache(
    'official-campuses',
    () => academicService.getCampuses()
  );
  const campuses = rawCampuses || [];

  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Modals
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingCampus, setEditingCampus] = useState(null);
  const [selectedCampusForStudents, setSelectedCampusForStudents] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    displayOrder: 1,
    active: true,
  });
  const [submitting, setSubmitting] = useState(false);

  useDataRefresh(['campuses', 'sections', 'students'], () => {
    invalidateCache('official-campuses');
    fetchCampuses();
  });

  const handleOpenAddModal = () => {
    setEditingCampus(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      displayOrder: campuses.length + 1,
      active: true,
    });
    setShowFormModal(true);
  };

  const handleOpenEditModal = (camp) => {
    setEditingCampus(camp);
    setFormData({
      name: camp.name || '',
      code: camp.code || '',
      description: camp.description || '',
      displayOrder: camp.displayOrder || 1,
      active: camp.active !== false,
    });
    setShowFormModal(true);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      if (editingCampus) {
        await academicService.updateCampus(editingCampus.id, formData);
        showSuccess(`Campus ${formData.name} updated successfully!`);
      } else {
        await academicService.createCampus(formData);
        showSuccess(`New Campus ${formData.name} created successfully!`);
      }
      invalidateCache('official-campuses');
      fetchCampuses();
      setShowFormModal(false);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to save campus';
      setError(msg);
      showError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const { confirmDelete, closeModal, handleProceedDelete, modalState, isDeleting, showOverlay } = useDeleteAnimation();

  const handleDeleteCampusClick = (camp) => {
    const enrolledCount = camp.totalStudents ?? camp.studentCount ?? 0;
    if (enrolledCount > 0) {
      showError(`Cannot delete Campus ${camp.name}: ${enrolledCount} student(s) currently enrolled. Please reallocate students first.`);
      return;
    }

    confirmDelete({
      id: camp.id,
      item: camp,
      title: 'Deactivate Campus',
      message: `Are you sure you want to deactivate Campus ${camp.name || ''}?`,
      deleteApiFn: (id) => academicService.deleteCampus(id),
      onOptimisticRemove: () => {
        invalidateCache('official-campuses');
        fetchCampuses();
      },
      onRestore: () => {
        invalidateCache('official-campuses');
        fetchCampuses();
      },
      onFinalized: () => {
        setSuccessMessage('Campus deactivated successfully.');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    });
  };

  const filteredCampuses = campuses.filter((camp) => {
    const q = searchQuery.toLowerCase();
    return (
      camp.name?.toLowerCase().includes(q) ||
      camp.code?.toLowerCase().includes(q) ||
      camp.description?.toLowerCase().includes(q)
    );
  });

  return (
    <Layout>
      <div className="space-y-5 sm:space-y-6 font-sans">
        
        {/* Banner Welcome Card */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-600 to-blue-500 rounded-3xl p-5 sm:p-8 text-white shadow-xl shadow-blue-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2 text-left">
            <span className="px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-blue-100 border border-white/20 inline-block">
              Campus Infrastructure
            </span>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight leading-tight">
              Campus Management
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 font-medium max-w-xl">
              Manage master campus locations, student enrollments, and academic allocations across the institution.
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={handleOpenAddModal}
              className="w-full sm:w-auto py-2.5 sm:py-3 px-4 sm:px-5 text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 rounded-2xl shadow-lg transition flex items-center justify-center space-x-2 cursor-pointer shrink-0 min-h-[44px]"
            >
              <Plus className="w-4 h-4 text-blue-600" />
              <span>Create New Campus</span>
            </button>
          )}
        </div>

        {/* Notifications */}
        {successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-xs text-emerald-700 font-bold flex items-center justify-between animate-fadeIn">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage('')}><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Search Bar */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search campus name, code, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 min-h-[44px]"
            />
          </div>
        </div>

        {/* Campuses Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {loading ? (
            <div className="col-span-full py-12 text-center text-slate-400">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-2" />
              <p className="text-xs font-bold">Loading campus allocations...</p>
            </div>
          ) : filteredCampuses.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-400 font-medium">
              No campuses found matching your search.
            </div>
          ) : (
            <AnimatePresence>
              {filteredCampuses.map((camp) => {
                const count = Number(camp.totalStudents ?? camp.studentCount ?? 0);
                return (
                  <AnimatedDeleteWrapper
                    key={camp.id}
                    as="div"
                    className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 hover:shadow-md transition"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-sm border border-blue-200 dark:border-blue-900/40">
                          {camp.name?.charAt(0) || 'C'}
                        </div>
                        <div>
                          <h3 className="text-base font-black text-slate-900 dark:text-white">{camp.name}</h3>
                          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-extrabold block">
                            MASTER CAMPUS #{camp.displayOrder || camp.id}
                          </span>
                        </div>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        camp.active !== false ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {camp.active !== false ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between text-slate-500">
                        <span>Campus Code:</span>
                        <strong className="text-slate-900 dark:text-white font-mono">{camp.code || camp.name}</strong>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Campus Type:</span>
                        <strong className="text-slate-900 dark:text-white font-semibold">Master Campus</strong>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Enrolled Students:</span>
                        <strong className="text-blue-600 dark:text-blue-400 font-mono text-sm">
                          {count} {count === 1 ? 'Student' : 'Students'}
                        </strong>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <button
                        onClick={() => setSelectedCampusForStudents(camp)}
                        className="px-3.5 py-2 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-bold hover:bg-blue-100 transition inline-flex items-center space-x-1.5 cursor-pointer min-h-[44px]"
                      >
                        <Users className="w-4 h-4" />
                        <span>View Students</span>
                      </button>

                      {isAdmin && (
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleOpenEditModal(camp)}
                            className="p-2.5 text-slate-400 hover:text-blue-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer min-w-[44px] min-h-[44px] inline-flex items-center justify-center"
                            title="Edit Campus"
                            aria-label="Edit Campus"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCampusClick(camp)}
                            className="p-2.5 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer min-w-[44px] min-h-[44px] inline-flex items-center justify-center"
                            title="Delete Campus"
                            aria-label="Delete Campus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </AnimatedDeleteWrapper>
                );
              })}
            </AnimatePresence>
          )}
        </div>

        {/* Campus Students Modal */}
        {selectedCampusForStudents && (
          <CampusStudentsModal
            campus={selectedCampusForStudents}
            onClose={() => setSelectedCampusForStudents(null)}
            onUpdated={() => {
              invalidateCache('official-campuses');
              fetchCampuses();
            }}
          />
        )}

        {/* Live Crumple & Toss 3D Animation Overlay */}
        <DeleteLoadingOverlay isVisible={showOverlay} item={modalState.item} durationMs={1200} />

        {/* Glassmorphic Delete Confirm Modal */}
        <DeleteConfirmModal
          isOpen={modalState.isOpen}
          title={modalState.title}
          message={modalState.message}
          onConfirm={handleProceedDelete}
          onClose={closeModal}
          isDeleting={isDeleting}
        />

        {/* Form Modal */}
        {showFormModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white dark:bg-slate-900 w-[calc(100%-32px)] max-w-md max-h-[90vh] overflow-y-auto p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-xs">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  {editingCampus ? 'Edit Campus' : 'Create New Campus'}
                </h3>
                <button onClick={() => setShowFormModal(false)} className="p-1.5 min-w-[36px] min-h-[36px] flex items-center justify-center">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSubmitForm} className="space-y-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Campus Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                    placeholder="e.g. VAIDEHI"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Campus Code</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                    placeholder="e.g. VAIDEHI"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-white"
                    placeholder="Campus facilities or notes..."
                  />
                </div>

                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="checkbox"
                    id="campus-active-toggle"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="campus-active-toggle" className="font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                    Active Status
                  </label>
                </div>

                <div className="pt-3 border-t flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowFormModal(false)}
                    className="px-4 py-2 border rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : editingCampus ? 'Save Changes' : 'Create Campus'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
};

export const SectionManagement = CampusManagement;
export default CampusManagement;
