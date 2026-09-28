import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import FacultyLayout from '../../layouts/FacultyLayout';
import { useAuth } from '../../context/AuthContext';
import ChangePasswordForm from '../../components/profile/ChangePasswordForm';
import { User, Key, ShieldCheck, Mail, Phone, Calendar, MapPin, Award, Building, UserCheck } from 'lucide-react';
import { usePageTitle } from '../../hooks/usePageTitle';

export const UserProfile = () => {
  usePageTitle('My Profile');
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'personal';

  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const rawRole = (typeof user?.role === 'string' ? user.role : user?.role?.roleName || user?.role?.name || '').replace('ROLE_', '').toUpperCase();
  const isAdmin = rawRole === 'ADMIN';

  const Layout = isAdmin ? AdminLayout : FacultyLayout;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-5 sm:space-y-6 font-sans">
        
        {/* Header Profile Banner Card */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-600 to-blue-500 rounded-3xl p-5 sm:p-8 text-white shadow-xl shadow-blue-500/25 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
          <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-5 text-center sm:text-left relative z-10">
            <img
              src={user?.profilePhotoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'User')}&background=2563eb&color=fff`}
              alt={user?.fullName || 'User Profile'}
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'User')}&background=2563eb&color=fff`;
              }}
              className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-white/40 shadow-lg shrink-0"
            />
            <div>
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {user?.fullName || 'User Profile'}
                </h1>
                <span className="px-3 py-0.5 bg-white/20 backdrop-blur-md text-white font-mono text-[10px] font-extrabold rounded-lg border border-white/20 uppercase">
                  {rawRole || 'USER'}
                </span>
              </div>
              <p className="text-xs text-blue-100 mt-1 flex items-center justify-center sm:justify-start space-x-1.5 font-medium">
                <Mail className="w-3.5 h-3.5 text-blue-200" />
                <span>{user?.email || 'admin@studentmanagementsystem.com'}</span>
              </p>
              <p className="text-xs text-blue-100 mt-1">
                Account Status: <strong className="text-emerald-300">ACTIVE</strong> • Account ID: <strong className="font-mono text-white">#{user?.id || 1}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Profile Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-1 sm:space-x-2 text-xs font-bold overflow-x-auto pb-0.5 scrollbar-none">
          <button
            onClick={() => setActiveTab('personal')}
            className={`py-2.5 sm:py-3 px-3.5 sm:px-5 rounded-t-2xl border-b-2 transition flex items-center space-x-2 cursor-pointer shrink-0 min-h-[44px] ${
              activeTab === 'personal'
                ? 'border-blue-600 text-blue-600 bg-white dark:bg-slate-900 shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Personal Information</span>
          </button>

          <button
            onClick={() => setActiveTab('password')}
            className={`py-2.5 sm:py-3 px-3.5 sm:px-5 rounded-t-2xl border-b-2 transition flex items-center space-x-2 cursor-pointer shrink-0 min-h-[44px] ${
              activeTab === 'password'
                ? 'border-blue-600 text-blue-600 bg-white dark:bg-slate-900 shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Change Password</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`py-2.5 sm:py-3 px-3.5 sm:px-5 rounded-t-2xl border-b-2 transition flex items-center space-x-2 cursor-pointer shrink-0 min-h-[44px] ${
              activeTab === 'security'
                ? 'border-blue-600 text-blue-600 bg-white dark:bg-slate-900 shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Security & Audit</span>
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === 'personal' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5 sm:space-y-6 text-xs animate-fadeIn">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-3">
              Personal & Account Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 block">Full Name</span>
                <p className="font-extrabold text-slate-900 dark:text-white text-sm">{user?.fullName || 'Administrator'}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 block">Email Address</span>
                <p className="font-bold text-blue-600 dark:text-blue-400">{user?.email || 'admin@studentmanagementsystem.com'}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 block">Assigned System Role</span>
                <p className="font-extrabold text-slate-900 dark:text-white uppercase">{rawRole || 'ADMIN'}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 block">Session Expiry</span>
                <p className="font-bold text-emerald-600 dark:text-emerald-400">1 Hour Inactivity Timeout Active</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'password' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs animate-fadeIn">
            <ChangePasswordForm />
          </div>
        )}

        {activeTab === 'security' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 text-xs animate-fadeIn">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-3">
              Security Policy & Audit Status
            </h3>

            <div className="space-y-3">
              <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">Password Encryption Standard</span>
                  <span className="text-slate-500 text-[11px]">BCrypt Hashing with Salt Strength 10</span>
                </div>
                <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-extrabold rounded-lg text-[10px] shrink-0">ENFORCED</span>
              </div>

              <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">Session Storage Isolation</span>
                  <span className="text-slate-500 text-[11px]">Browser Session Token cleared upon window closure</span>
                </div>
                <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-extrabold rounded-lg text-[10px] shrink-0">ACTIVE</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
};

export default UserProfile;
