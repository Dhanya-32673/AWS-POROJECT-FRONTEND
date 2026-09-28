import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { tokenUtils } from '../../utils/tokenUtils';
import OtpVerificationCard from '../../components/OtpVerificationCard';
import { Mail, ArrowLeft, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';
import { usePageTitle } from '../../hooks/usePageTitle';

const OtpVerification = () => {
  usePageTitle('OTP Verification');
  const navigate = useNavigate();
  const { verifyOtp, setAuthUser } = useAuth();

  const [step, setStep] = useState(1); // 1: Send OTP email, 2: Verify OTP
  const [email, setEmail] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSendOtp = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail || !/\S+@\S+\.\S+/.test(cleanEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      await authService.sendOtp(cleanEmail, 'LOGIN');
      setStep(2);
      setSuccessMsg(`Verification code sent to ${cleanEmail}`);
    } catch (err) {
      setError(err.response?.data?.message || err.customMessage || 'Failed to send OTP code.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 2) {
    const cleanEmail = email.trim();
    return (
      <OtpVerificationCard
        email={cleanEmail}
        length={6}
        title="Security Verification"
        subtitle="Student Management System"
        onVerify={async (code) => {
          const response = await verifyOtp(cleanEmail, code);
          const targetUser = response?.user || tokenUtils.getUser();
          if (setAuthUser && targetUser) setAuthUser(targetUser);
          const role = (targetUser?.role?.roleName || targetUser?.role || '').replace(/^ROLE_/i, '').toUpperCase();
          if (role === 'ADMIN') {
            navigate('/admin/dashboard', { replace: true });
          } else {
            navigate('/faculty/dashboard', { replace: true });
          }
        }}
        onResend={async () => {
          await authService.sendOtp(cleanEmail, 'LOGIN');
        }}
        onBack={() => setStep(1)}
      />
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F8FAFC] p-3 sm:p-4 font-sans relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at top, rgba(59,130,246,0.14), transparent 55%)',
        }}
      />
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-8 space-y-5 relative z-10">
        
        {/* Back Link */}
        <Link to="/login" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Login</span>
        </Link>

        {/* Header */}
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-700 to-blue-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/30">
            <KeyRound className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">
            Login with OTP
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Enter your registered email address to receive a verification code.
          </p>
        </div>

        {/* Notifications */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-700 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-700 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* STEP 1: Request Email OTP */}
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Registered Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4.5 h-4.5" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter registered email"
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-blue-700 to-blue-500 hover:from-blue-800 hover:to-blue-600 text-white font-bold text-sm shadow-md focus:outline-none transition-all flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
          >
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </form>

      </div>
    </div>
  );
};

export default OtpVerification;
