import React, { useEffect, useState } from 'react';
import AdminLayout from '../../../layouts/AdminLayout';
import FacultyLayout from '../../../layouts/FacultyLayout';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { useDataRefresh } from '../../../utils/dataSync';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import certificateService from '../../../services/certificateService';
import { FileText, Plus, Edit3, Trash2, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { usePageTitle } from '../../../hooks/usePageTitle';

export const CertificateTypes = () => {
  usePageTitle('Certificate Types');
  const { user } = useAuth();
  const rawRole = (typeof user?.role === 'string' ? user.role : user?.role?.roleName || user?.role?.name || '').replace('ROLE_', '').toUpperCase();
  const isAdmin = rawRole === 'ADMIN';
  const Layout = isAdmin ? AdminLayout : FacultyLayout;

  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    category: 'ACADEMIC',
    isMandatory: true,
  });

  const fetchTypes = async () => {
    setLoading(true);
    try {
      const data = await certificateService.getDocumentTypes();
      setTypes(data || []);
    } catch (err) {
      console.error('Failed to load document types:', err);
      setError('Failed to load certificate types');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTypes();
  }, []);
  useDataRefresh(['certificates'], fetchTypes);

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      category: 'ACADEMIC',
      isMandatory: true,
    });
    setError('');
    setShowModal(true);
  };

  const handleOpenEditModal = (type) => {
    setEditingId(type.id);
    setFormData({
      name: type.name || '',
      code: type.code || '',
      description: type.description || '',
      category: type.category || 'ACADEMIC',
      isMandatory: type.isMandatory !== false && type.requiredByDefault !== false,
    });
    setError('');
    setShowModal(true);
  };

  const { showSuccess, showError } = useToast();
  const [typeToDelete, setTypeToDelete] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        name: formData.name,
        code: formData.code,
        description: formData.description,
        category: formData.category,
        isMandatory: formData.isMandatory,
        requiredByDefault: formData.isMandatory,
        active: true,
      };

      if (editingId) {
        await certificateService.updateDocumentType(editingId, payload);
        showSuccess('Certificate type updated successfully');
      } else {
        await certificateService.createDocumentType(payload);
        showSuccess('Certificate type created successfully');
      }

      setShowModal(false);
    } catch (err) {
      console.error('Save failed:', err);
      const msg = err.response?.data?.message || 'Failed to save certificate type';
      setError(msg);
      showError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!typeToDelete) return;
    const { id, name } = typeToDelete;
    setDeleteLoadingId(id);
    setError('');
    try {
      await certificateService.deleteDocumentType(id);
      showSuccess(`Certificate type "${name}" deleted successfully`);
      setTypeToDelete(null);
      setTypes((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
      const msg = err.response?.data?.message || 'Failed to delete certificate type.';
      setError(msg);
      showError(msg);
    } finally {
      setDeleteLoadingId(null);
    }
  };

  return (
    <Layout>
      <div className="space-y-5 sm:space-y-6 font-sans pb-12">
        
        {/* Banner Welcome Card */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-600 to-blue-500 rounded-3xl p-5 sm:p-8 text-white shadow-xl shadow-blue-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2 text-left">
            <span className="px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-blue-100 border border-white/20 inline-block">
              Certificate Configuration
            </span>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight leading-tight">
              Certificate Types Directory
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 font-medium max-w-xl">
              {isAdmin ? 'Define required academic document types, mandatory submission criteria, and codes.' : 'Directory of official college document types and submission categories.'}
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={handleOpenAddModal}
              className="w-full sm:w-auto py-2.5 sm:py-3 px-4 sm:px-5 text-xs font-extrabold text-slate-900 bg-white hover:bg-slate-100 rounded-2xl shadow-lg transition flex items-center justify-center space-x-2 cursor-pointer shrink-0 min-h-[44px]"
            >
              <Plus className="w-4 h-4 text-blue-600" />
              <span>Add Certificate Type</span>
            </button>
          )}
        </div>

        {/* Notifications */}
        {error && (
          <div className="p-4 bg-rose-50 text-rose-800 rounded-2xl border border-rose-200 text-xs font-extrabold flex items-center space-x-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Table Container Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-400">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-2" />
              <p className="text-xs font-bold">Loading document types...</p>
            </div>
          ) : (
            <>
              {/* MOBILE STACKED CARDS (< md) */}
              <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                {types.map((type) => (
                  <div key={type.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center space-x-2.5">
                        <div className="p-2 bg-blue-50 dark:bg-blue-950/60 rounded-xl text-blue-600">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">{type.name}</h4>
                          <p className="text-xs font-mono font-bold text-blue-600">{type.code}</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 rounded-full text-[10px] font-extrabold">
                        ACTIVE
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-extrabold">Category</span>
                        <span className="font-bold text-blue-700 dark:text-blue-300">{type.category || 'ACADEMIC'}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block uppercase font-extrabold">Requirement</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {type.isMandatory !== false && type.requiredByDefault !== false ? (
                            <span className="text-emerald-600 font-extrabold">Mandatory</span>
                          ) : (
                            <span className="text-slate-400">Optional</span>
                          )}
                        </span>
                      </div>
                    </div>

                    {isAdmin && (
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => handleOpenEditModal(type)}
                          className="flex-1 py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 min-h-[44px] cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => setTypeToDelete(type)}
                          disabled={deleteLoadingId === type.id}
                          className="flex-1 py-2 px-3 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 min-h-[44px] cursor-pointer disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* DESKTOP TABLE (md+) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-extrabold uppercase text-[11px] tracking-wider whitespace-nowrap">
                    <tr>
                      <th className="px-6 py-3.5">Code</th>
                      <th className="px-4 py-3.5">Certificate Type Name</th>
                      <th className="px-4 py-3.5">Category</th>
                      <th className="px-4 py-3.5">Mandatory</th>
                      <th className="px-4 py-3.5">Status</th>
                      {isAdmin && <th className="px-4 py-3.5 text-right pr-6">Action</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {types.map((type) => (
                      <tr key={type.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                        <td className="px-6 py-3.5 font-mono font-bold text-blue-600 dark:text-blue-400">{type.code}</td>
                        <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                          <span>{type.name}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded-md text-[10px] font-extrabold">
                            {type.category || 'ACADEMIC'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-bold">
                          {type.isMandatory !== false && type.requiredByDefault !== false ? (
                            <span className="text-emerald-600 font-extrabold">YES</span>
                          ) : (
                            <span className="text-slate-400">OPTIONAL</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 rounded-full text-[10px] font-extrabold">
                            ACTIVE
                          </span>
                        </td>
                        {isAdmin && (
                          <td className="px-4 py-3.5 text-right pr-6 whitespace-nowrap">
                            <div className="flex items-center justify-end space-x-1">
                              <button
                                onClick={() => handleOpenEditModal(type)}
                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer min-w-[36px] min-h-[36px] inline-flex items-center justify-center"
                                title="Edit Certificate Type"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setTypeToDelete(type)}
                                disabled={deleteLoadingId === type.id}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer disabled:opacity-50 min-w-[36px] min-h-[36px] inline-flex items-center justify-center"
                                title="Delete Certificate Type"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Create / Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white dark:bg-slate-900 w-[calc(100%-32px)] max-w-md max-h-[90vh] overflow-y-auto p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  {editingId ? 'Edit Certificate Type' : 'Add New Certificate Type'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Certificate Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Aadhaar Card"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Unique Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/\s+/g, '_') })}
                    placeholder="e.g. AADHAAR_DOC"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold focus:ring-2 focus:ring-blue-500 outline-none min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none min-h-[44px]"
                  >
                    <option value="ACADEMIC">Academic (e.g. SSC, Marks Memos)</option>
                    <option value="IDENTITY">Identity (e.g. Aadhaar, Voter Card)</option>
                    <option value="RESERVATION">Reservation (e.g. Caste, Income, EWS)</option>
                    <option value="SPECIAL">Special (e.g. Sports, NCC, Medical)</option>
                    <option value="OTHER">Other / Miscellaneous</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Description (optional)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description or guidelines for student upload..."
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="checkbox"
                    id="isMandatory"
                    checked={formData.isMandatory}
                    onChange={(e) => setFormData({ ...formData, isMandatory: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded-md border-slate-300 focus:ring-blue-500"
                  />
                  <label htmlFor="isMandatory" className="font-bold text-slate-700 dark:text-slate-300 select-none">
                    Mandatory submission for all students
                  </label>
                </div>

                <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="w-full sm:w-auto px-4 py-2.5 font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl min-h-[44px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full sm:w-auto px-5 py-2.5 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md disabled:opacity-50 cursor-pointer min-h-[44px]"
                  >
                    {saving ? 'Saving...' : editingId ? 'Update Type' : 'Create Type'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={!!typeToDelete}
          onClose={() => setTypeToDelete(null)}
          onConfirm={handleConfirmDelete}
          title="Delete Certificate Type"
          message={`Are you sure you want to permanently delete "${typeToDelete?.name}"? Existing student files of this type may no longer have a valid type mapping.`}
          confirmText="Yes, Delete"
          cancelText="Cancel"
          danger
        />

      </div>
    </Layout>
  );
};

export default CertificateTypes;
