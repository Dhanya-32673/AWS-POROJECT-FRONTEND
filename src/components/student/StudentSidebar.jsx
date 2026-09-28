import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  User,
  Award,
  KeyRound,
  LogOut,
  X,
  GraduationCap
} from 'lucide-react';
import { StudentManagementLogo } from '../common/StudentManagementLogo';

export const StudentSidebar = ({ mobileOpen, setMobileOpen }) => {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  // Auto-close drawer on route navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, setMobileOpen]);

  // Handle ESC key to close mobile drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mobileOpen) {
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen, setMobileOpen]);

  // Prevent background scroll on mobile drawer
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

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const navItems = [
    {
      name: 'Dashboard',
      path: '/student/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'My Profile',
      path: '/student/profile',
      icon: User,
    },
    {
      name: 'My Certificates',
      path: '/student/certificates',
      icon: Award,
    },
    {
      name: 'Change Password',
      path: '/student/change-password',
      icon: KeyRound,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 z-40 lg:hidden backdrop-blur-sm transition-opacity duration-200"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 bottom-0 left-0 z-50 w-[275px] max-w-[85vw] bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 flex flex-col transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none h-screen border-r border-slate-200 dark:border-slate-800 shrink-0 select-none ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-blue-600 bg-blue-600 text-white flex items-center justify-between shadow-sm">
          <Link to="/student/dashboard" className="flex items-center space-x-3 group min-h-[44px] min-w-0">
            <StudentManagementLogo variant="sidebar" size="md" />
          </Link>

          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-white/90 hover:text-white p-2 rounded-xl hover:bg-white/10 transition min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer shrink-0"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Portal Tag */}
        <div className="px-5 py-2.5 bg-blue-50/70 dark:bg-blue-950/30 border-b border-blue-100/60 dark:border-blue-900/30 flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-wider uppercase text-blue-700 dark:text-blue-300">
            Student Portal
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
            Read-Only
          </span>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 text-xs font-semibold scrollbar-thin">
          <span className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 block mb-2">
            STUDENT MENU
          </span>

          {navItems.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3.5 px-3.5 py-3 rounded-2xl transition-all duration-150 min-h-[44px] ${
                  active
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    active
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-semibold">{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Bottom Logout Button */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/60 font-bold transition min-h-[44px] cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default StudentSidebar;
