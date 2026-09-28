import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { StudentPortalProvider } from '../context/StudentPortalContext';
import { StudentErrorBoundary } from '../components/student/StudentErrorBoundary';
import { StudentSidebar } from '../components/student/StudentSidebar';
import { StudentTopbar } from '../components/student/StudentTopbar';

const StudentLayoutContent = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex font-sans transition-colors duration-200">
      {/* Permanent on desktop, drawer on mobile */}
      <StudentSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden min-h-screen">
        <StudentTopbar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scrollbar-thin">
          <div className="max-w-7xl mx-auto space-y-6">
            <StudentErrorBoundary>
              {children || <Outlet />}
            </StudentErrorBoundary>
          </div>
        </main>

        <footer className="px-6 py-4 border-t border-slate-200/60 dark:border-slate-800/60 text-center text-xs text-slate-400 dark:text-slate-500 font-medium">
          © 2026 Student Management System. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export const StudentLayout = ({ children }) => {
  return (
    <StudentPortalProvider>
      <StudentLayoutContent>{children}</StudentLayoutContent>
    </StudentPortalProvider>
  );
};

export default StudentLayout;
