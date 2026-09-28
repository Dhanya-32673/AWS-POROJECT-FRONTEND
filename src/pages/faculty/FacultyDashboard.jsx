import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FacultyLayout from '../../layouts/FacultyLayout';
import FacultyHeroBanner from '../../components/faculty/FacultyHeroBanner';
import FacultyStatsCards from '../../components/faculty/FacultyStatsCards';
import FacultyAssignedStudentsTable from '../../components/faculty/FacultyAssignedStudentsTable';
import ExportExcelButton from '../../components/students/ExportExcelButton';
import ImportStudentsModal from '../../components/students/ImportStudentsModal';
import dashboardService from '../../services/dashboardService';
import { useDataRefresh } from '../../utils/dataSync';
import { Loader2, UserPlus, FileSpreadsheet } from 'lucide-react';
import { usePageTitle } from '../../hooks/usePageTitle';

export const FacultyDashboard = () => {
  usePageTitle('Faculty Dashboard');
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [importModalOpen, setImportModalOpen] = useState(false);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const data = await dashboardService.getFacultySummary();
      setSummary(data);
    } catch (err) {
      console.error('Failed to load faculty summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);
  useDataRefresh(['dashboard'], fetchSummary);

  const assignedCount = typeof summary?.assignedStudentsCount === 'number'
    ? summary.assignedStudentsCount
    : typeof summary?.assignedStudents === 'number'
    ? summary.assignedStudents
    : Array.isArray(summary?.assignedStudents)
    ? summary.assignedStudents.length
    : 0;

  const totalDocsCount = summary?.totalDocumentsCount ?? summary?.totalCertificates ?? 0;
  const pendingDocsCount = summary?.pendingDocumentsCount ?? summary?.pendingDocuments ?? 0;

  const studentList = Array.isArray(summary?.assignedStudents)
    ? summary.assignedStudents
    : Array.isArray(summary?.recentStudents)
    ? summary.recentStudents
    : [];

  return (
    <FacultyLayout>
      <div className="space-y-8 font-sans">
        {/* Banner Welcome Card */}
        <FacultyHeroBanner />

        {/* Student Section Operations Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight">
              Student Section Operations
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Manage, register, or bulk import students assigned to your section
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <button
              id="faculty-add-student-btn"
              onClick={() => navigate('/admin/students/add')}
              className="flex-1 sm:flex-none py-2.5 px-4 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition flex items-center justify-center space-x-2 cursor-pointer min-h-[44px]"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Student</span>
            </button>

            <button
              id="faculty-import-students-btn"
              onClick={() => setImportModalOpen(true)}
              className="flex-1 sm:flex-none py-2.5 px-4 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-500/20 transition flex items-center justify-center space-x-2 cursor-pointer min-h-[44px]"
              title="Bulk import students into your assigned section (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Import Students</span>
            </button>

            <div className="flex-1 sm:flex-none">
              <ExportExcelButton />
            </div>
          </div>
        </div>

        {/* Loading Spinner State */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
            <p className="text-xs font-semibold">Loading assigned students and certificate statistics...</p>
          </div>
        ) : (
          <>
            {/* KPI Stat Cards Grid */}
            <FacultyStatsCards
              assignedCount={assignedCount}
              totalDocsCount={totalDocsCount}
              pendingDocsCount={pendingDocsCount}
            />

            {/* Assigned Students Table */}
            <FacultyAssignedStudentsTable studentList={studentList} />
          </>
        )}

        {/* Bulk Student Import Modal */}
        <ImportStudentsModal
          isOpen={importModalOpen}
          onClose={() => setImportModalOpen(false)}
          onSuccess={fetchSummary}
        />
      </div>
    </FacultyLayout>
  );
};

export default FacultyDashboard;
