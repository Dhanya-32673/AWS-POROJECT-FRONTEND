import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useClickOutside, createToggleHandler } from '../../hooks/useClickOutside';
import {
  Menu,
  Search,
  Calendar,
  Sun,
  Moon,
  Bell,
  ChevronDown,
  User,
  Key,
  LogOut
} from 'lucide-react';
import { StudentManagementLogo } from '../common/StudentManagementLogo';

export const FacultyTopbar = ({ setMobileOpen }) => {
  const { user, logout } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();

  const [globalSearch, setGlobalSearch] = useState('');
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  useClickOutside([
    { ref: notificationRef, isOpen: notificationsOpen, setOpen: setNotificationsOpen },
    { ref: profileRef, isOpen: profileDropdownOpen, setOpen: setProfileDropdownOpen },
  ]);

  const toggleNotifications = createToggleHandler(setNotificationsOpen, notificationsOpen, [setProfileDropdownOpen]);
  const toggleProfile = createToggleHandler(setProfileDropdownOpen, profileDropdownOpen, [setNotificationsOpen]);

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && globalSearch.trim()) {
      navigate(`/faculty/students/search?query=${encodeURIComponent(globalSearch.trim())}`);
      setGlobalSearch('');
      setMobileSearchOpen(false);
    }
  };

  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <>
      <header className="h-16 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        
        {/* Left Section: Mobile Menu Toggle + Global Search */}
        <div className="flex items-center space-x-2 sm:space-x-4 flex-1 max-w-xl">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Brand in Header */}
          <StudentManagementLogo variant="header" size="sm" linkTo="/faculty/dashboard" className="shrink-0" />

          {/* Global Search Input (Desktop) */}
          <div className="relative w-full max-w-md hidden sm:block">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search assigned students by ID, name... (Enter)"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              onKeyDown={handleSearchSubmit}
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
            />
          </div>

          {/* Mobile Search Toggle */}
          <button
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="sm:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Toggle search"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>

        {/* Right Section: Date Badge + Theme Toggle + Notifications + User Dropdown */}
        <div className="flex items-center space-x-1.5 sm:space-x-3">
          
          {/* Current Date Badge */}
          <div className="hidden xl:flex items-center space-x-1.5 px-3 py-1.5 bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 rounded-xl border border-blue-200/60 dark:border-blue-900/40 text-xs font-bold">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>{currentDateFormatted}</span>
          </div>

          {/* Dark/Light Mode Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
          </button>

          {/* Notification Bell Popover */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={toggleNotifications}
              className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 relative transition cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-expanded={notificationsOpen}
              aria-haspopup="true"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse" />
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-[calc(100vw-32px)] sm:w-80 max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 z-50 text-xs animate-dropdown-enter space-y-3" role="menu">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Faculty Notifications</span>
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-bold text-[10px]">1 New</span>
                </div>
                <div className="space-y-2">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-blue-600 font-bold">
                      <span>Assigned Section Update</span>
                      <span className="text-[10px] text-slate-400 font-normal">Just now</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px]">3 new student documents await your verification.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Profile Avatar Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={toggleProfile}
              className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer min-h-[44px]"
              aria-expanded={profileDropdownOpen}
              aria-haspopup="true"
              aria-label="Faculty User Menu"
            >
              <img
                src={user?.profilePhotoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'Faculty')}&background=2563eb&color=fff`}
                alt={user?.fullName || 'Faculty Profile'}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'Faculty')}&background=2563eb&color=fff`;
                }}
                className="w-8 h-8 rounded-xl object-cover border-2 border-blue-600 shadow-xs"
              />
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate max-w-[120px]">{user?.fullName || 'Faculty Member'}</p>
                <p className="text-[10px] text-blue-600 font-extrabold">FACULTY</p>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 hidden md:block transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 max-w-[calc(100vw-32px)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl py-2 z-50 text-xs animate-dropdown-enter" role="menu">
                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                  <p className="font-extrabold text-slate-900 dark:text-white truncate">{user?.fullName || 'Faculty Member'}</p>
                  <p className="text-slate-400 text-[11px] truncate">{user?.email || 'faculty@studentmanagementsystem.com'}</p>
                </div>
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    navigate('/profile');
                  }}
                  className="w-full text-left px-4 py-2.5 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 font-semibold flex items-center space-x-2.5 cursor-pointer border-b border-slate-100 dark:border-slate-800 min-h-[40px]"
                >
                  <User className="w-4 h-4 text-blue-600" />
                  <span>My Profile</span>
                </button>
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    navigate('/profile?tab=password');
                  }}
                  className="w-full text-left px-4 py-2.5 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 font-semibold flex items-center space-x-2.5 cursor-pointer border-b border-slate-100 dark:border-slate-800 min-h-[40px]"
                >
                  <Key className="w-4 h-4 text-blue-600" />
                  <span>Change Password</span>
                </button>
                <button
                  onClick={async () => {
                    await logout();
                    navigate('/login');
                  }}
                  className="w-full text-left px-4 py-2.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 font-bold flex items-center space-x-2.5 cursor-pointer min-h-[40px]"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* Mobile Search Overlay */}
      {mobileSearchOpen && (
        <div className="sm:hidden p-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 animate-fadeIn">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              autoFocus
              placeholder="Search students by ID, name... (Enter)"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              onKeyDown={handleSearchSubmit}
              className="w-full pl-10 pr-4 py-2.5 sm:py-2 text-sm sm:text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default FacultyTopbar;
