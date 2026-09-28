import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { StudentManagementLogo } from '../../components/common/StudentManagementLogo';
import { usePageTitle } from '../../hooks/usePageTitle';

export const NotFound = () => {
  usePageTitle('Page Not Found');
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 text-slate-800 dark:text-slate-100">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 dark:border-slate-800 text-center space-y-6 animate-fadeIn">
        <div className="flex justify-center">
          <StudentManagementLogo variant="full" size="lg" />
        </div>

        <div className="space-y-2">
          <span className="text-5xl sm:text-6xl font-black text-blue-600 dark:text-blue-400 tracking-tight">
            404
          </span>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            Page Not Found
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            The page you are looking for does not exist in Student Management System or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
          <Link
            to="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Back to Login</span>
          </Link>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800 pt-4 text-[11px] text-slate-400 font-medium">
          © 2026 Student Management System
        </div>
      </div>
    </div>
  );
};

export default NotFound;
