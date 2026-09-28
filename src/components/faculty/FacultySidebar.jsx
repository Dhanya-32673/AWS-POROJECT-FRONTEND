import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
  LogOut,
  X,
  ChevronDown
} from 'lucide-react';
import { StudentManagementLogo } from '../common/StudentManagementLogo';

export const FacultySidebar = ({ mobileOpen, setMobileOpen }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [studentsOpen, setStudentsOpen] = React.useState(true);
  const [certificatesOpen, setCertificatesOpen] = React.useState(true);

  const isActive = (path) => location.pathname === path;

  // Auto-close drawer on navigation
  useEffect(() => {
    setMobileOpen(false);
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

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 z-40 lg:hidden backdrop-blur-sm animate-fadeIn transition-opacity"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Faculty Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 bottom-0 left-0 z-50 w-[85vw] max-w-xs sm:w-64 bg-white/95 dark:bg-slate-950/95 lg:bg-blue-50/80 lg:dark:bg-slate-950 text-slate-700 dark:text-slate-300 flex flex-col transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none h-screen border-r border-slate-200/80 dark:border-slate-800/80 lg:border-blue-100/90 shrink-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Header Logo Card */}
        <div className="p-4 border-b border-blue-600 bg-blue-600 text-white flex items-center justify-between shadow-md">
          <Link to="/faculty/dashboard" className="flex items-center space-x-3 group min-h-[40px] min-w-0">
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
              to="/faculty/dashboard"
              className={`flex items-center space-x-3.5 px-3.5 py-3 rounded-2xl transition-all min-h-[44px] ${
                isActive('/faculty/dashboard')
                  ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/30'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-blue-100/70 dark:hover:bg-slate-800/60 hover:text-blue-700 dark:hover:text-white'
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                isActive('/faculty/dashboard') ? 'bg-white/20 text-white' : 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
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
              <span>My Students</span>
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
                  <span>Assigned Students</span>
                </Link>

                <Link
                  to="/faculty/students/search"
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition min-h-[42px] ${
                    isActive('/faculty/students/search')
                      ? 'bg-blue-600 text-white font-extrabold shadow-md shadow-blue-500/25'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-blue-100/70 dark:hover:bg-slate-800/60 hover:text-blue-700 dark:hover:text-white'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${isActive('/faculty/students/search') ? 'bg-white/20 text-white' : 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'}`}>
                    <Search className="w-4 h-4" />
                  </div>
                  <span>Search Directory</span>
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
                  <span>Add Student</span>
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
                  <span>Pending Review</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Footer User Info */}
        <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 lg:border-blue-100 bg-white/95 dark:bg-slate-900/95 flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            <img
              src={user?.profilePhotoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'Faculty')}&background=2563eb&color=fff`}
              alt={user?.fullName || 'Faculty'}
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'Faculty')}&background=2563eb&color=fff`;
              }}
              className="w-9 h-9 rounded-xl object-cover border-2 border-blue-600 shadow-xs shrink-0"
            />
            <div className="truncate">
              <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">{user?.fullName || 'Faculty Member'}</span>
              <span className="text-[10px] text-blue-600 font-extrabold block">FACULTY</span>
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
    </>
  );
};

export default FacultySidebar;
