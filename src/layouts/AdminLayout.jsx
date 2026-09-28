import React, { useState, useEffect, useRef } from 'react';
import { useClickOutside, createToggleHandler } from '../hooks/useClickOutside';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { StudentManagementLogo } from '../components/common/StudentManagementLogo';
import { APP_COPYRIGHT } from '../constants/branding';
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  UserPlus,
  Search,
  Award,
  FileText,
  UploadCloud,
  Clock,
  AlertCircle,
  ShieldCheck,
  Building2,
  Bell,
  LogOut,
  User,
  Key,
  Menu,
  X,
  ChevronDown,
  Sun,
  Moon,
  Calendar
} from 'lucide-react';

export const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [studentsOpen, setStudentsOpen] = useState(true);
  const [certificatesOpen, setCertificatesOpen] = useState(true);
  const [facultyOpen, setFacultyOpen] = useState(true);

  // Popover States
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Refs for click-outside detection
  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  useClickOutside([
    { ref: notificationRef, isOpen: notificationsOpen, setOpen: setNotificationsOpen },
    { ref: profileRef, isOpen: profileDropdownOpen, setOpen: setProfileDropdownOpen },
  ]);

  // Mutual exclusion toggle handlers
  const toggleNotifications = createToggleHandler(setNotificationsOpen, notificationsOpen, [setProfileDropdownOpen]);
  const toggleProfile = createToggleHandler(setProfileDropdownOpen, profileDropdownOpen, [setNotificationsOpen]);

  const [globalSearch, setGlobalSearch] = useState('');

  const isActive = (path) => location.pathname === path;

  // Auto-close mobile drawer on route change & unlock scroll
  useEffect(() => {
    setMobileOpen(false);
    setMobileSearchOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  // Global Search Submit Shortcut
  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && globalSearch.trim()) {
      navigate(`/admin/students?search=${encodeURIComponent(globalSearch.trim())}`);
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex font-sans transition-colors duration-200">

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 z-40 lg:hidden backdrop-blur-sm animate-fadeIn transition-opacity"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar (Responsive Desktop Sticky + Mobile Slide-In Drawer) */}
      <aside
        className={`fixed lg:sticky top-0 bottom-0 left-0 z-50 w-[85vw] max-w-xs sm:w-64 bg-white/95 dark:bg-slate-950/95 lg:bg-blue-50/80 lg:dark:bg-slate-950 text-slate-700 dark:text-slate-300 flex flex-col transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none h-screen border-r border-slate-200/80 dark:border-slate-800/80 lg:border-blue-100/90 shrink-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Header Logo Card */}
        <div className="p-4 border-b border-blue-600 bg-blue-600 text-white flex items-center justify-between shadow-md">
          <Link to="/admin/dashboard" className="flex items-center space-x-3 group min-h-[40px] min-w-0">
            <StudentManagementLogo variant="sidebar" size="md" />
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-white/90 hover:text-white p-2 rounded-xl hover:bg-white/10 transition min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer shrink-0"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Navigation Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs font-semibold scrollbar-thin">

          {/* Main Group */}
          <div className="space-y-1">
            <span className="px-3 text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-2">
              CORE OPERATIONS
            </span>
            <Link
              to="/admin/dashboard"
              className={`flex items-center space-x-3.5 px-3.5 py-3 rounded-2xl transition-all min-h-[44px] ${
                isActive('/admin/dashboard')
                  ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/30'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-blue-100/70 dark:hover:bg-slate-800/60 hover:text-blue-700 dark:hover:text-white'
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                isActive('/admin/dashboard') ? 'bg-white/20 text-white' : 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
              }`}>
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <span className="text-sm font-bold">Dashboard</span>
            </Link>
          </div>

          {/* Student Management Accordion Group */}
          <div className="space-y-1">
            <button
              onClick={() => setStudentsOpen(!studentsOpen)}
              className="w-full flex items-center justify-between px-3 py-2 text-blue-900/70 dark:text-blue-400 hover:text-blue-900 dark:hover:text-white text-[11px] font-extrabold uppercase tracking-widest cursor-pointer min-h-[38px]"
            >
              <span>Student Module</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${studentsOpen ? 'rotate-180' : ''}`} />
            </button>
            {studentsOpen && (
              <div className="space-y-1 pl-1">
                <Link
                  to="/admin/students"
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition min-h-[42px] ${
                    isActive('/admin/students')
                      ? 'bg-blue-600 text-white font-extrabold shadow-md shadow-blue-500/25'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-blue-100/70 dark:hover:bg-slate-800/60 hover:text-blue-700 dark:hover:text-white'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${isActive('/admin/students') ? 'bg-white/20 text-white' : 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'}`}>
                    <Users className="w-4 h-4" />
                  </div>
                  <span>All Students</span>
                </Link>

                <Link
                  to="/admin/students/add"
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition min-h-[42px] ${
                    isActive('/admin/students/add')
                      ? 'bg-blue-600 text-white font-extrabold shadow-md shadow-blue-500/25'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-blue-100/70 dark:hover:bg-slate-800/60 hover:text-blue-700 dark:hover:text-white'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${isActive('/admin/students/add') ? 'bg-white/20 text-white' : 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'}`}>
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <span>Add New Student</span>
                </Link>
              </div>
            )}
          </div>

          {/* Certificate Management Accordion Group */}
          <div className="space-y-1">
            <button
              onClick={() => setCertificatesOpen(!certificatesOpen)}
              className="w-full flex items-center justify-between px-3 py-2 text-blue-900/70 dark:text-blue-400 hover:text-blue-900 dark:hover:text-white text-[11px] font-extrabold uppercase tracking-widest cursor-pointer min-h-[38px]"
            >
              <span>Certificate Hub</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${certificatesOpen ? 'rotate-180' : ''}`} />
            </button>
            {certificatesOpen && (
              <div className="space-y-1 pl-1">
                <Link
                  to="/admin/certificates"
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition min-h-[42px] ${
                    isActive('/admin/certificates')
                      ? 'bg-blue-600 text-white font-extrabold shadow-md shadow-blue-500/25'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-blue-100/70 dark:hover:bg-slate-800/60 hover:text-blue-700 dark:hover:text-white'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${isActive('/admin/certificates') ? 'bg-white/20 text-white' : 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'}`}>
                    <Award className="w-4 h-4" />
                  </div>
                  <span>All Certificates</span>
                </Link>

                <Link
                  to="/admin/certificates/upload"
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition min-h-[42px] ${
                    isActive('/admin/certificates/upload')
                      ? 'bg-blue-600 text-white font-extrabold shadow-md shadow-blue-500/25'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-blue-100/70 dark:hover:bg-slate-800/60 hover:text-blue-700 dark:hover:text-white'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${isActive('/admin/certificates/upload') ? 'bg-white/20 text-white' : 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'}`}>
                    <UploadCloud className="w-4 h-4" />
                  </div>
                  <span>Upload Certificate</span>
                </Link>

                <Link
                  to="/admin/certificates/pending"
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition min-h-[42px] ${
                    isActive('/admin/certificates/pending')
                      ? 'bg-blue-600 text-white font-extrabold shadow-md shadow-blue-500/25'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-blue-100/70 dark:hover:bg-slate-800/60 hover:text-blue-700 dark:hover:text-white'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${isActive('/admin/certificates/pending') ? 'bg-white/20 text-white' : 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'}`}>
                    <Clock className="w-4 h-4" />
                  </div>
                  <span>Pending Documents</span>
                </Link>

                <Link
                  to="/admin/certificates/missing"
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition min-h-[42px] ${
                    isActive('/admin/certificates/missing')
                      ? 'bg-blue-600 text-white font-extrabold shadow-md shadow-blue-500/25'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-blue-100/70 dark:hover:bg-slate-800/60 hover:text-blue-700 dark:hover:text-white'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${isActive('/admin/certificates/missing') ? 'bg-white/20 text-white' : 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'}`}>
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <span>Missing Documents</span>
                </Link>

                <Link
                  to="/admin/certificates/types"
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition min-h-[42px] ${
                    isActive('/admin/certificates/types')
                      ? 'bg-blue-600 text-white font-extrabold shadow-md shadow-blue-500/25'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-blue-100/70 dark:hover:bg-slate-800/60 hover:text-blue-700 dark:hover:text-white'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${isActive('/admin/certificates/types') ? 'bg-white/20 text-white' : 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'}`}>
                    <FileText className="w-4 h-4" />
                  </div>
                  <span>Certificate Types</span>
                </Link>
              </div>
            )}
          </div>

          {/* Campus & Management Accordion */}
          <div className="space-y-1">
            <button
              onClick={() => setFacultyOpen(!facultyOpen)}
              className="w-full flex items-center justify-between px-3 py-2 text-blue-900/70 dark:text-blue-400 hover:text-blue-900 dark:hover:text-white text-[11px] font-extrabold uppercase tracking-widest cursor-pointer min-h-[38px]"
            >
              <span>Campus & Management</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${facultyOpen ? 'rotate-180' : ''}`} />
            </button>
            {facultyOpen && (
              <div className="space-y-1 pl-1">
                <Link
                  to="/admin/academic/campus"
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition min-h-[42px] ${
                    isActive('/admin/academic/campus') || isActive('/admin/academic/sections')
                      ? 'bg-blue-600 text-white font-extrabold shadow-md shadow-blue-500/25'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-blue-100/70 dark:hover:bg-slate-800/60 hover:text-blue-700 dark:hover:text-white'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${isActive('/admin/academic/campus') || isActive('/admin/academic/sections') ? 'bg-white/20 text-white' : 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'}`}>
                    <Building2 className="w-4 h-4" />
                  </div>
                  <span>Campus Management</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Footer User Info */}
        <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 lg:border-blue-100 bg-white/95 dark:bg-slate-900/95 flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            <img
              src={user?.profilePhotoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'Admin')}&background=2563eb&color=fff`}
              alt={user?.fullName || 'User'}
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'Admin')}&background=2563eb&color=fff`;
              }}
              className="w-9 h-9 rounded-xl object-cover border-2 border-blue-600 shadow-xs shrink-0"
            />
            <div className="truncate">
              <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">{user?.fullName || 'Administrator'}</span>
              <span className="text-[10px] text-blue-600 font-extrabold block">SUPER ADMIN</span>
            </div>
          </div>
          <button
            onClick={async () => {
              await logout();
              navigate('/login');
            }}
            className="p-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
            title="Sign Out"
            aria-label="Sign Out"
          >
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </div>
      </aside>

      {/* Main Right Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">

        {/* Floating Enterprise Top Navbar */}
        <header className="h-16 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">

          {/* Left Section: Mobile Menu + Brand + Global Search */}
          <div className="flex items-center space-x-2 sm:space-x-4 flex-1 max-w-2xl min-w-0">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0 cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Brand in Header */}
            <StudentManagementLogo variant="header" size="sm" linkTo="/admin/dashboard" className="shrink-0" />

            {/* Global Search Input (Desktop) */}
            <div className="relative w-full max-w-md hidden sm:block">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Global search students, roll numbers... (Enter)"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                onKeyDown={handleSearchSubmit}
                className="w-full pl-10 pr-12 py-2 text-xs bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
              />
              <span className="absolute right-3 top-2.5 px-1.5 py-0.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md text-[10px] font-mono text-slate-400 shadow-xs hidden md:inline-block">
                Ctrl+K
              </span>
            </div>

            {/* Mobile Search Toggle Button */}
            <button
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="sm:hidden p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0 cursor-pointer"
              aria-label="Toggle search"
            >
              <Search className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Right Section: Date + Theme Toggle + Notifications + User Dropdown */}
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
              aria-label="Toggle color theme"
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
                    <span className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">System Notifications</span>
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-bold text-[10px]">2 New</span>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                      <div className="flex items-center justify-between text-blue-600 font-bold">
                        <span>New Certificate Request</span>
                        <span className="text-[10px] text-slate-400 font-normal">10m ago</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 text-[11px]">Priya Sharma uploaded SSC Memo PDF for verification.</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                      <div className="flex items-center justify-between text-emerald-600 font-bold">
                        <span>Section Capacity Updated</span>
                        <span className="text-[10px] text-slate-400 font-normal">1h ago</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 text-[11px]">Section A capacity expanded to 60 students.</p>
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
                aria-label="User menu"
              >
                <img
                  src={user?.profilePhotoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'Admin')}&background=2563eb&color=fff`}
                  alt={user?.fullName || 'User Profile'}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'Admin')}&background=2563eb&color=fff`;
                  }}
                  className="w-8 h-8 rounded-xl object-cover border-2 border-blue-600 shadow-xs"
                />
                <div className="hidden md:block text-left">
                  <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate max-w-[120px]">{user?.fullName || 'Administrator'}</p>
                  <p className="text-[10px] text-blue-600 font-extrabold">SUPER ADMIN</p>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 hidden md:block transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 max-w-[calc(100vw-32px)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl py-2 z-50 text-xs animate-dropdown-enter" role="menu">
                  <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                    <p className="font-extrabold text-slate-900 dark:text-white truncate">{user?.fullName || 'Administrator'}</p>
                    <p className="text-slate-400 text-[11px] truncate">{user?.email || 'admin@studentmanagementsystem.com'}</p>
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

        {/* Mobile Search Input Overlay (When toggled on mobile) */}
        {mobileSearchOpen && (
          <div className="sm:hidden p-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 animate-fadeIn">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                autoFocus
                placeholder="Search students, roll numbers... (Enter)"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                onKeyDown={handleSearchSubmit}
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>
        )}

        {/* Main Content Render Area */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 overflow-y-auto pb-safe">{children}</main>

        {/* Footer */}
        <footer className="px-6 py-4 border-t border-slate-200/60 dark:border-slate-800/60 text-center text-xs text-slate-400 dark:text-slate-500 font-medium">
          {APP_COPYRIGHT}
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;
