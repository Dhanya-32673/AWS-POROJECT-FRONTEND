import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronRight, ArrowLeft, AlertCircle, UserPlus, ShieldCheck } from 'lucide-react';
import StudentForm from '../../../components/students/StudentForm';
import studentService from '../../../services/studentService';
import AdminLayout from '../../../layouts/AdminLayout';
import FacultyLayout from '../../../layouts/FacultyLayout';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { usePageTitle } from '../../../hooks/usePageTitle';

export const AddStudent = () => {
  usePageTitle('Add Student');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const Layout = user?.role === 'FACULTY' ? FacultyLayout : AdminLayout;

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (formData, photoFile) => {
    setSubmitting(true);
    setError('');
    try {
      const createdStudent = await studentService.createStudent(formData);
      if (photoFile && createdStudent?.studentId) {
        try {
          await studentService.uploadStudentPhoto(createdStudent.studentId, photoFile);
        } catch (photoErr) {
          console.warn('Photo upload warning on create:', photoErr);
          showError('Student record was created, but photo failed to upload. You can re-upload the photo via Edit Student.');
        }
      }
      showSuccess('Student registered successfully. Student Portal account created.');
      navigate(`/admin/students/${createdStudent.studentId}`);
    } catch (err) {
      console.error('Failed to create student:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to create student. Check duplicate Roll Number or Email.';
      setError(msg);
      showError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6 font-sans">

        {/* Banner Header */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-600 to-blue-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-500/25 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
          <div className="space-y-2 relative z-10 text-center sm:text-left">
            <nav className="flex items-center gap-1.5 text-[11px] text-blue-200 font-medium">
              <Link to="/admin/dashboard" className="hover:text-white transition">Dashboard</Link>
              <ChevronRight className="w-3 h-3" />
              <Link to="/admin/students" className="hover:text-white transition">Students</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-white font-bold">Add Student</span>
            </nav>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Enroll New Student</h1>
            <p className="text-xs sm:text-sm text-blue-100 font-medium">
              Fill in all required fields to create a new student record in the system.
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/students')}
            className="relative z-10 flex items-center justify-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-2xl shadow-lg transition shrink-0 cursor-pointer w-full sm:w-auto min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4 text-blue-600" />
            <span>Back to All Students</span>
          </button>
        </div>

        {/* Automatic Account Information Banner */}
        <div className="p-4 bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 rounded-2xl flex items-start gap-3 text-xs text-indigo-900 dark:text-indigo-200">
          <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Automatic Student Portal Account Creation:</span>
            <p className="text-indigo-700 dark:text-indigo-300 mt-0.5">
              A Student Portal account will be automatically created using the student's Primary Registered Email. The student will use their Date of Birth (DD-MM-YYYY) as their initial password and will be required to change it upon first login.
            </p>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center">
              <UserPlus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wide">Student Registration Form</h2>
              <p className="text-xs text-slate-400">All fields marked with * are required</p>
            </div>
          </div>
          <div className="p-6">
            <StudentForm
              onSubmit={handleSubmit}
              onCancel={() => navigate('/admin/students')}
              submitting={submitting}
            />
          </div>
        </div>

      </div>
    </Layout>
  );
};

export default AddStudent;
