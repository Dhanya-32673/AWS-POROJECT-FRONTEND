import React, { useEffect, useState } from 'react';
import AdminLayout from '../../../layouts/AdminLayout';
import academicService from '../../../services/academicService';
import { Layers, Users, BookOpen, AlertCircle, Trash2 } from 'lucide-react';
import DeleteConfirmationModal from '../../../components/common/DeleteConfirmationModal';

import { useToast } from '../../../context/ToastContext';
import { useDataRefresh } from '../../../utils/dataSync';
import { usePageTitle } from '../../../hooks/usePageTitle';

export const GroupManagement = () => {
  usePageTitle('Academic Groups');
  const { showSuccess, showError } = useToast();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groupToDelete, setGroupToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const data = await academicService.getAllGroups();
      setGroups(data || []);
    } catch (err) {
      console.error('Failed to load groups:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);
  useDataRefresh(['groups'], fetchGroups);

  const handleConfirmDelete = async () => {
    if (!groupToDelete || deleting) return;
    const targetId = groupToDelete.id;
    setDeleting(true);
    setError('');
    try {
      await academicService.deleteGroup(targetId);
      showSuccess('Academic group deleted successfully');
      setGroupToDelete(null);
      setGroups((prev) => prev.filter((g) => g.id !== targetId));
    } catch (err) {
      console.error('Failed to delete group:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to delete group';
      setError(msg);
      showError(msg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-5 sm:space-y-6 font-sans">
        
        {/* Banner Welcome Card */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-600 to-blue-500 rounded-3xl p-5 sm:p-8 text-white shadow-xl shadow-blue-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2 text-left">
            <span className="px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-blue-100 border border-white/20 inline-block">
              Academic Streams & Curriculum
            </span>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight leading-tight">
              Academic Groups Directory
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 font-medium max-w-xl">
              Overview of intermediate academic streams (MPC, BiPC, MEC, CEC, HEC) and subject combinations.
            </p>
          </div>
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg shrink-0">
            <Layers className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Groups Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {loading ? (
            <div className="col-span-full py-12 text-center text-slate-400">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-2" />
              <p className="text-xs font-bold">Loading academic groups...</p>
            </div>
          ) : (
            groups.map((grp) => (
              <div key={grp.id || grp.code} className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 hover:shadow-md transition relative group">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-sm border border-blue-200 dark:border-blue-900/40">
                      {grp.code}
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white">{grp.name}</h3>
                      <span className="text-[10px] text-blue-600 dark:text-blue-400 font-extrabold block">STREAM CODE: {grp.code}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setGroupToDelete(grp)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
                      title="Delete Academic Group"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <span className="px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 rounded-full text-[10px] font-extrabold">
                      ACTIVE
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                  <p className="font-medium">{grp.description || 'Standard Intermediate Academic Curriculum'}</p>
                  <div className="flex justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                    <span>Compulsory Subjects:</span>
                    <strong className="text-slate-900 dark:text-white">{grp.subjects || 'English, Language & Core'}</strong>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {groupToDelete && (
        <DeleteConfirmationModal
          title={`Delete Group '${groupToDelete.code}'`}
          subtitle="Permanent Stream Deletion • Cannot Be Undone"
          entityDetails={[
            { label: 'Group Name', value: groupToDelete.name },
            { label: 'Group Code', value: groupToDelete.code },
            { label: 'Description', value: groupToDelete.description || 'N/A', fullWidth: true },
          ]}
          warningList={[
            'Permanent Removal of Group definition from Database',
            'Cannot delete if active students or sections are linked to this stream',
          ]}
          confirmationKeyword="DELETE GROUP"
          dangerButtonText="Delete Group"
          loading={deleting}
          onClose={() => setGroupToDelete(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </AdminLayout>
  );
};

export default GroupManagement;
