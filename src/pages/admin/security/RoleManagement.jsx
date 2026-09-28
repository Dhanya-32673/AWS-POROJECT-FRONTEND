import React from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../../layouts/AdminLayout';
import { ShieldCheck, CheckCircle2, Lock, Users, Key } from 'lucide-react';
import { usePageTitle } from '../../../hooks/usePageTitle';

export const RoleManagement = () => {
  usePageTitle('Security Roles');
  const roles = [
    {
      id: 1,
      name: 'ROLE_ADMIN',
      label: 'System Administrator',
      description: 'Full system management access across all modules — Students, Certificates, Faculty, Groups, Permissions.',
      users: 1,
      color: 'blue',
      permissions: [
        'STUDENT_VIEW', 'STUDENT_CREATE', 'STUDENT_EDIT', 'STUDENT_DEACTIVATE',
        'CERTIFICATE_VIEW', 'CERTIFICATE_UPLOAD', 'CERTIFICATE_VERIFY', 'CERTIFICATE_REJECT',
        'FACULTY_VIEW', 'FACULTY_CREATE', 'FACULTY_EDIT', 'FACULTY_ASSIGN',
        'GROUP_MANAGE', 'SECTION_MANAGE'
      ]
    },
    {
      id: 2,
      name: 'ROLE_FACULTY',
      label: 'Faculty Member',
      description: 'Access restricted to assigned section students, profile management, and certificate verification.',
      users: 1,
      color: 'emerald',
      permissions: [
        'STUDENT_VIEW', 'CERTIFICATE_VIEW', 'CERTIFICATE_UPLOAD'
      ]
    }
  ];

  const colorMap = {
    blue:    { bg: 'bg-blue-50 dark:bg-blue-950/60',    icon: 'text-blue-600 dark:text-blue-400',    badge: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60',    perm: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300' },
    emerald: { bg: 'bg-emerald-50 dark:bg-emerald-950/60', icon: 'text-emerald-600 dark:text-emerald-400', badge: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60', perm: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300' },
  };

  return (
    <AdminLayout>
      <div className="space-y-6 font-sans">

        {/* Banner Header */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-600 to-blue-500 rounded-3xl p-5 sm:p-8 text-white shadow-xl shadow-blue-500/25 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
          <div className="space-y-2 relative z-10">
            <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[11px] font-extrabold uppercase tracking-widest text-blue-200 border border-white/20 inline-block">
              Security & Access Control
            </span>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight">Roles & Permissions</h1>
            <p className="text-xs sm:text-sm text-blue-100 font-medium">
              Manage system roles, module permissions, and access control policies.
            </p>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/20 rounded-xl">
              <ShieldCheck className="w-4 h-4 text-blue-200" />
              <span className="text-xs font-bold text-white">{roles.length} Roles Defined</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/20 rounded-xl">
              <Key className="w-4 h-4 text-blue-200" />
              <span className="text-xs font-bold text-white">
                {roles.reduce((s, r) => s + r.permissions.length, 0)} Total Permissions
              </span>
            </div>
          </div>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {roles.map((role) => {
            const c = colorMap[role.color] || colorMap.blue;
            return (
              <div key={role.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
                {/* Card Header */}
                <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl ${c.bg} flex items-center justify-center shrink-0`}>
                        <ShieldCheck className={`w-6 h-6 ${c.icon}`} />
                      </div>
                      <div>
                        <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">{role.label}</h2>
                        <span className={`font-mono text-[10px] font-black px-2 py-0.5 rounded-md ${c.badge}`}>{role.name}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 rounded-full text-[10px] font-extrabold">
                        <CheckCircle2 className="w-3 h-3" />
                        ACTIVE
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">{role.description}</p>
                  <div className="flex items-center gap-1.5 mt-3 text-xs text-slate-400">
                    <Users className="w-3.5 h-3.5" />
                    <span><strong className="text-slate-700 dark:text-slate-200">{role.users}</strong> user{role.users !== 1 ? 's' : ''} assigned</span>
                  </div>
                </div>

                {/* Permissions */}
                <div className="p-5 sm:p-6">
                  <h4 className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                    Assigned Permissions ({role.permissions.length})
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {role.permissions.map((perm) => (
                      <span key={perm} className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded-lg ${c.perm}`}>
                        {perm}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Info note */}
        <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 rounded-2xl p-4 flex items-start gap-3 text-blue-700 dark:text-blue-300">
          <Lock className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
          <p className="text-xs font-medium">
            Role permissions are enforced by Spring Security on the backend. 
            Changes to permissions require a backend configuration update.
          </p>
        </div>

      </div>
    </AdminLayout>
  );
};

export default RoleManagement;
