import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useStudentPortal } from '../../context/StudentPortalContext';
import { getStudentInitials } from '../../services/studentPortalService';
import { useClickOutside, createToggleHandler } from '../../hooks/useClickOutside';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Sun,
  Moon,
  LogOut,
  User,
  KeyRound,
  ChevronDown,
  GraduationCap
} from 'lucide-react';
import { StudentManagementLogo } from '../common/StudentManagementLogo';

export const StudentTopbar = ({ mobileOpen, setMobileOpen }) => {
  const { user, logout } = useAuth();
  const { student } = useStudentPortal();
  const { toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileRef = useRef(null);

  useClickOutside([
    { ref: profileRef, isOpen: profileDropdownOpen, setOpen: setProfileDropdownOpen }
  ]);

  const toggleProfile = createToggleHandler(setProfileDropdownOpen, profileDropdownOpen);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const studentName = student?.fullName || user?.fullName || user?.username || 'Student';
  const studentId = student?.studentId || user?.studentId || '';
  const profilePhotoUrl = student?.profilePhotoUrl;
  const initials = getStudentInitials(studentName);

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3 transition-colors">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto w-full">
        {/* Left Section: Mobile Drawer Toggle & Portal Header */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden text-slate-600 dark:text-slate-300 hover:text-blue-600 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
            aria-label="Toggle Navigation Drawer"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center space-x-2.5">
            <StudentManagementLogo variant="icon" size="sm" />
            <div>
              <h1 className="text-base sm:text-lg font-black text-slate-800 dark:text-white tracking-tight leading-tight">
                Student Portal
              </h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold tracking-wider uppercase hidden sm:block">
                STUDENT MANAGEMENT SYSTEM
              </p>
            </div>
          </div>
        </div>

        {/* Right Section: Theme Toggle & Profile Dropdown */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
          </button>

          {/* Student Profile Menu */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={toggleProfile}
              className="flex items-center space-x-2.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer border border-slate-200 dark:border-slate-800 min-h-[44px]"
              aria-expanded={profileDropdownOpen}
              aria-label="Student Account Menu"
            >
              {profilePhotoUrl ? (
                <img
                  src={profilePhotoUrl}
                  alt={studentName}
                  className="w-8 h-8 rounded-xl object-cover border border-blue-500/40 shrink-0"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                className={`w-8 h-8 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-xs tracking-wider uppercase shadow-sm shrink-0 ${
                  profilePhotoUrl ? 'hidden' : 'flex'
                }`}
              >
                {initials}
              </div>

              <div className="hidden md:block text-left pr-1 max-w-[140px]">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                  {studentName}
                </div>
                {studentId && (
                  <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate">
                    {studentId}
                  </div>
                )}
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block shrink-0" />
            </button>

            {/* Profile Dropdown */}
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{studentName}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{student?.email || user?.email || 'Student Account'}</p>
                  {studentId && (
                    <span className="inline-block mt-1.5 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-[10px] font-bold">
                      ID: {studentId}
                    </span>
                  )}
                </div>

                <div className="p-1 space-y-0.5">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      navigate('/student/profile');
                    }}
                    className="w-full flex items-center space-x-2.5 px-3 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer min-h-[40px]"
                  >
                    <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>My Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      navigate('/student/change-password');
                    }}
                    className="w-full flex items-center space-x-2.5 px-3 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer min-h-[40px]"
                  >
                    <KeyRound className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Change Password</span>
                  </button>

                  <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2.5 px-3 py-2.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition cursor-pointer min-h-[40px]"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default StudentTopbar;
