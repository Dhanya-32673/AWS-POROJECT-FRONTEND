import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Printer, AlertCircle } from 'lucide-react';
import StudentIdCardDisplay from '../../../components/students/StudentIdCardDisplay';
import studentService from '../../../services/studentService';
import { useAuth } from '../../../context/AuthContext';
import AdminLayout from '../../../layouts/AdminLayout';
import FacultyLayout from '../../../layouts/FacultyLayout';
import { usePageTitle } from '../../../hooks/usePageTitle';

export const StudentIdCard = () => {
  usePageTitle('Student ID Card');
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [idCardData, setIdCardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const Layout = isAdmin ? AdminLayout : FacultyLayout;

  useEffect(() => {
    const fetchIdCard = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await studentService.getStudentIdCard(id);
        setIdCardData(data);
      } catch (err) {
        console.error('Failed to load ID card:', err);
        setError(err.response?.data?.message || 'Failed to load ID card data.');
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchIdCard();
    }
  }, [id]);

  return (
    <Layout>
      <div className="space-y-6 font-sans">

        {/* Banner Header */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-600/20 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6 print:hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
          <div className="space-y-2 relative z-10 text-center sm:text-left">
            <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[11px] font-extrabold uppercase tracking-widest text-blue-100 border border-white/20 inline-block">
              Student Identity
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Student Identity Card</h1>
            <p className="text-xs sm:text-sm text-blue-100/90 font-medium">
              Official student identity card for <span className="font-mono font-black text-white">{id}</span>
            </p>
          </div>
          <div className="relative z-10 flex flex-wrap items-center gap-3 w-full sm:w-auto shrink-0">
            <button
              onClick={() => navigate(-1)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold rounded-2xl transition cursor-pointer min-h-[44px]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={() => window.print()}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 text-[#0F172A] text-xs font-black rounded-2xl shadow-lg transition cursor-pointer min-h-[44px]"
            >
              <Printer className="w-4 h-4 text-[#2563EB]" />
              <span>Print Card</span>
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm py-20 flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-[#2563EB]" />
            </div>
            <div className="w-8 h-8 rounded-full border-4 border-[#2563EB] border-t-transparent animate-spin" />
            <p className="text-xs font-bold text-slate-400">Loading Student Identity Card...</p>
          </div>
        ) : error ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-rose-200 dark:border-rose-900/50 shadow-sm p-6 sm:p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6 text-rose-500" />
            </div>
            <p className="text-sm font-bold text-rose-700 dark:text-rose-400">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-xl min-h-[44px] cursor-pointer"
            >
              Go Back
            </button>
          </div>
        ) : (
          <div className="bg-slate-50/50 dark:bg-slate-900/50 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-4 sm:p-8 flex justify-center print:p-0 print:border-none print:shadow-none print:bg-transparent">
            <StudentIdCardDisplay idCardData={idCardData} />
          </div>
        )}

      </div>
    </Layout>
  );
};

export default StudentIdCard;
