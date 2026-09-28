import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, LogIn } from 'lucide-react';
import { StudentManagementLogo } from '../../components/common/StudentManagementLogo';
import { usePageTitle } from '../../hooks/usePageTitle';

export const Unauthorized = () => {
  usePageTitle('Access Denied');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 text-slate-800 dark:text-slate-100">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 dark:border-slate-800 text-center space-y-6 animate-fadeIn">
        <div className="flex justify-center">
          <StudentManagementLogo variant="full" size="lg" />
        </div>

        <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            Access Restricted
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            You do not have the required permissions to access this area of Student Management System.
          </p>
        </div>

        <div className="pt-2">
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Return to Login</span>
          </Link>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800 pt-4 text-[11px] text-slate-400 font-medium">
          © 2026 Student Management System
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
