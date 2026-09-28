import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import dashboardService from '../../services/dashboardService';
import { useDataRefresh } from '../../utils/dataSync';
import { formatSectionName, formatBranchGroup } from '../../utils/studentDataFormatter';
import StudentAvatar from '../../components/common/StudentAvatar';
import {
  Users,
  Award,
  UserPlus,
  FileCheck,
  Eye,
  Loader2,
  TrendingUp,
  ArrowUpRight,
  Clock
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LabelList,
  CartesianGrid,
  XAxis,
  YAxis
} from 'recharts';

import { useApiCache } from '../../utils/useApiCache';
import { usePageTitle } from '../../hooks/usePageTitle';

const DEPT_COLORS = ['#2563EB', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

export const AdminDashboard = () => {
  usePageTitle('Dashboard');
  const navigate = useNavigate();

  const { data: summary, loading, refetch: fetchSummary } = useApiCache(
    'admin-dashboard-summary',
    () => dashboardService.getAdminSummary()
  );

  useDataRefresh(['dashboard'], fetchSummary);

  const deptData = summary?.studentsByDepartment
    ? Object.entries(summary.studentsByDepartment).map(([dept, val]) => ({
        name: dept,
        value: val,
      }))
    : [];

  const monthlyData = summary?.monthlyRegistrations || [];

  return (
    <AdminLayout>
      <div className="space-y-6 sm:space-y-8 font-sans">
        
        {/* Banner Welcome Card */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-600 to-blue-500 rounded-3xl p-5 sm:p-8 text-white shadow-xl shadow-blue-500/25 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-2 relative z-10 text-left">
            <span className="px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-blue-100 border border-white/20 inline-block">
              Enterprise Dashboard
            </span>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight leading-tight">
              Welcome Back, System Administrator
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 font-medium max-w-xl">
              Monitor student enrollments, academic sections, and certificate verification in real time.
            </p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full md:w-auto shrink-0">
            <Link
              to="/admin/students/add"
              className="py-2.5 sm:py-3 px-4 sm:px-5 text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 rounded-2xl shadow-lg transition flex items-center justify-center space-x-2 cursor-pointer min-h-[44px]"
            >
              <UserPlus className="w-4 h-4 text-blue-600" />
              <span>Add Student</span>
            </Link>

            <Link
              to="/admin/certificates/upload"
              className="py-2.5 sm:py-3 px-4 sm:px-5 text-xs font-bold text-white bg-white/20 hover:bg-white/30 border border-white/30 rounded-2xl transition flex items-center justify-center space-x-2 cursor-pointer min-h-[44px]"
            >
              <FileCheck className="w-4 h-4 text-white" />
              <span>Upload Certificate</span>
            </Link>
          </div>
        </div>

        {/* Loading Spinner State */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
            <p className="text-xs font-semibold">Fetching system summary metrics...</p>
          </div>
        ) : (
          <>
            {/* KPI Cards Grid (1 col on mobile, 3 on tablet/desktop) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
              
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">Total Students</span>
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-2xl">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight block">
                    {summary?.totalStudents ?? 0}
                  </span>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center space-x-1 mt-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Active Enrolled</span>
                  </span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">Total Certificates</span>
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                    <Award className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight block">
                    {summary?.totalCertificates ?? 0}
                  </span>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold block mt-1">
                    {summary?.verifiedDocuments ?? 0} Verified · {summary?.uploadedCertificates ?? 0} Uploaded
                  </span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">Pending Approvals</span>
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-2xl">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight block">
                    {summary?.pendingVerification ?? 0}
                  </span>
                  <span className="text-[11px] text-amber-600 dark:text-amber-400 font-bold block mt-1">Needs Verification</span>
                </div>
              </div>

            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Monthly Registrations Chart */}
              <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4 gap-2">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                      Student Registration Trend
                    </h3>
                    <p className="text-xs text-slate-400">Monthly admissions overview</p>
                  </div>
                  <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-lg text-[10px] font-extrabold">2026 Academic Year</span>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#2563EB" stopOpacity={1} />
                          <stop offset="100%" stopColor="#60A5FA" stopOpacity={0.8} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip
                        cursor={{ fill: '#EFF6FF' }}
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '12px', fontSize: '12px' }}
                        formatter={(value) => [value, 'Students Registered']}
                        labelFormatter={(label) => `📅 ${label}`}
                      />
                      <Bar dataKey="registrations" fill="url(#barGrad)" radius={[6, 6, 0, 0]} maxBarSize={40}>
                        <LabelList
                          dataKey="registrations"
                          position="top"
                          style={{ fontSize: '10px', fontWeight: 700, fill: '#2563EB' }}
                          formatter={(v) => v > 0 ? v : ''}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Summary row below chart */}
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Total</p>
                    <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                      {monthlyData.reduce((s, m) => s + (m.registrations || 0), 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Peak Month</p>
                    <p className="text-base sm:text-lg font-black text-blue-600 truncate">
                      {monthlyData.reduce((best, m) => m.registrations > (best.registrations || 0) ? m : best, {}).month || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Avg / Month</p>
                    <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                      {monthlyData.length > 0
                        ? (monthlyData.reduce((s, m) => s + (m.registrations || 0), 0) / 12).toFixed(1)
                        : 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Group Distribution Pie Chart */}
              <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                    Group Distribution
                  </h3>
                  <p className="text-xs text-slate-400">Students grouped by academic streams</p>
                </div>

                {deptData.length > 0 ? (
                  <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-center gap-4">
                    {/* Donut chart */}
                    <div className="h-48 w-48 shrink-0 mx-auto">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={deptData}
                            cx="50%"
                            cy="50%"
                            innerRadius={48}
                            outerRadius={75}
                            paddingAngle={3}
                            dataKey="value"
                            startAngle={90}
                            endAngle={-270}
                          >
                            {deptData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={DEPT_COLORS[index % DEPT_COLORS.length]} strokeWidth={0} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '12px', fontSize: '12px' }}
                            formatter={(value, name) => [
                              `${value} students (${((value / deptData.reduce((s, d) => s + d.value, 0)) * 100).toFixed(1)}%)`,
                              name
                            ]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Legend panel */}
                    <div className="flex-1 w-full space-y-2">
                      {deptData.map((entry, i) => {
                        const total = deptData.reduce((s, d) => s + d.value, 0);
                        const pct = total > 0 ? ((entry.value / total) * 100).toFixed(1) : 0;
                        return (
                          <div key={entry.name} className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: DEPT_COLORS[i % DEPT_COLORS.length] }} />
                              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{entry.name}</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-xs font-black text-slate-900 dark:text-white">{entry.value}</span>
                              <span className="text-[10px] text-slate-400 font-medium w-9 text-right">{pct}%</span>
                            </div>
                          </div>
                        );
                      })}
                      <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Total Enrolled</span>
                        <span className="text-sm font-black text-blue-600">
                          {deptData.reduce((s, d) => s + d.value, 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-52 flex items-center justify-center">
                    <p className="text-xs text-slate-400">No group data available</p>
                  </div>
                )}
              </div>

            </div>

            {/* Recent Registered Students Section (Responsive Cards for Mobile + Table for Desktop) */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                    Recent Enrolled Students
                  </h3>
                  <p className="text-xs text-slate-400">Latest student profile admissions</p>
                </div>
                <Link
                  to="/admin/students"
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center space-x-1 min-h-[44px]"
                >
                  <span>View All</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Mobile Cards (< md) */}
              <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                {summary?.recentStudents?.length > 0 ? (
                  summary.recentStudents.map((st) => (
                    <div key={st.id || st.studentId} className="p-4 flex items-center justify-between gap-3">
                      <div className="flex items-center space-x-3 min-w-0">
                        <StudentAvatar
                          src={st.profilePhotoUrl}
                          name={st.fullName}
                          studentId={st.studentId}
                          size="md"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{st.fullName}</p>
                          <p className="text-[11px] text-blue-600 font-mono font-bold">{st.studentId}</p>
                          <p className="text-[10px] text-slate-400">
                            {formatBranchGroup(st.branchGroup || st.academicDetail?.branchGroup)} • Section {formatSectionName(st.section || st.academicDetail?.section)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/admin/students/${st.studentId || st.id}`)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0"
                        aria-label="View Student"
                      >
                        <Eye className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-xs text-slate-400">No recent students registered yet.</div>
                )}
              </div>

              {/* Desktop Table (md+) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-extrabold uppercase text-[11px]">
                    <tr>
                      <th className="p-3.5 px-6">Student ID</th>
                      <th className="p-3.5">Student Name</th>
                      <th className="p-3.5">Admission Number</th>
                      <th className="p-3.5">Group & Year</th>
                      <th className="p-3.5">Section</th>
                      <th className="p-3.5 text-right pr-6">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {summary?.recentStudents?.length > 0 ? (
                      summary.recentStudents.map((st) => (
                        <tr key={st.id || st.studentId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                          <td className="p-3.5 px-6 font-mono font-bold text-blue-600 dark:text-blue-400">
                            {st.studentId}
                          </td>
                          <td className="p-3.5 font-bold text-slate-900 dark:text-white flex items-center space-x-3">
                            <StudentAvatar
                              src={st.profilePhotoUrl}
                              name={st.fullName}
                              studentId={st.studentId}
                              size="sm"
                            />
                            <span>{st.fullName}</span>
                          </td>
                          <td className="p-3.5 font-mono text-slate-500">
                            {st.admissionNumber || st.rollNumber || '—'}
                          </td>
                          <td className="p-3.5">
                            <span className="px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded-md font-extrabold text-[10px]">
                              {formatBranchGroup(st.branchGroup || st.academicDetail?.branchGroup)}
                            </span>
                          </td>
                          <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200">
                            {formatSectionName(st.section || st.academicDetail?.section)}
                          </td>
                          <td className="p-3.5 pr-6 text-right">
                            <button
                              onClick={() => navigate(`/admin/students/${st.studentId || st.id}`)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer min-w-[36px] min-h-[36px] inline-flex items-center justify-center"
                              title="View Student Profile"
                              aria-label="View Profile"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          No recent students registered yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
