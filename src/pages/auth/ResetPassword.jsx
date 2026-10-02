import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import OtpInput from '../../components/OtpInput';
import AuthLayout from '../../components/auth/AuthLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  AlertCircle, 
  ShieldCheck, 
  ShieldAlert,
  Mail,
  Check,
  CheckCircle2,
  Send,
  ArrowRight
} from 'lucide-react';

import { usePageTitle } from '../../hooks/usePageTitle';

const ResetPassword = () => {
  usePageTitle('Reset Password');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialMode = searchParams.get('mode') === 'standard' ? 'STANDARD' : 'FACULTY';

  const [mode, setMode] = useState(initialMode); // 'FACULTY' | 'STANDARD'
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [infoMsg, setInfoMsg] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendOtp = async () => {
    const cleanEmail = email.trim();
    if (!cleanEmail || !/\S+@\S+\.\S+/.test(cleanEmail)) {
      setError('Please enter a valid email address first');
      return;
    }

    setSendingOtp(true);
    setError('');
    setInfoMsg('');

    try {
      if (mode === 'FACULTY') {
        await authService.requestFacultyPasswordReset({
          facultyEmail: cleanEmail,
          employeeId: '',
          reason: 'Faculty password reset request',
        });
        setInfoMsg('Authorization OTP sent to System Administration email');
      } else {
        await authService.forgotPassword(cleanEmail);
        setInfoMsg(`6-digit verification code sent to ${cleanEmail}`);
      }
      setOtpSent(true);
      setCountdown(60);
    } catch (err) {
      setError(err.response?.data?.message || err.customMessage || 'Failed to send OTP. Please check the email address and try again.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    const cleanOtp = otp.trim();

    if (!cleanEmail || !cleanOtp || !newPassword || !confirmPassword) {
      setError('Please fill in all required fields');
      return;
    }

    if (cleanOtp.length !== 6) {
      setError('OTP must be a 6-digit number');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    const hasUpper = /[A-Z]/.test(newPassword);
    const hasLower = /[a-z]/.test(newPassword);
    const hasDigit = /[0-9]/.test(newPassword);
    const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);

    if (!hasUpper || !hasLower || !hasDigit || !hasSpecial) {
      setError('Password must contain uppercase, lowercase, a number, and a special character (e.g. Dhanya@123)');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (mode === 'FACULTY') {
        await authService.adminResetFacultyPassword({
          facultyEmail: cleanEmail,
          otp: cleanOtp,
          newPassword,
          confirmPassword,
        });
      } else {
        await authService.resetPassword(cleanEmail, cleanOtp, newPassword, confirmPassword);
      }
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || err.customMessage || 'Failed to reset password. Please check the OTP code and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={mode === 'FACULTY' ? "Faculty Recovery" : "Reset Password"}
      subtitle="Student Management System"
    >
      <div className="w-full max-w-[430px] mx-auto space-y-2.5 my-auto">
        
        {/* Back Link */}
        <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Login</span>
        </Link>

        {/* Tab Switcher at Top of Card (Height 42px) */}
        <div className="bg-[#f1f5f9] rounded-[12px] p-1 flex h-[42px] w-full border border-slate-200/80 text-[11px] font-extrabold">
          <button
            type="button"
            onClick={() => { setMode('STANDARD'); setError(''); setInfoMsg(''); }}
            className={`flex-1 py-1 rounded-[9px] transition-all duration-300 cursor-pointer ${
              mode === 'STANDARD' ? 'bg-gradient-to-r from-[#2563eb] to-[#3b82f6] text-white shadow-sm font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            General User
          </button>
          <button
            type="button"
            onClick={() => { setMode('FACULTY'); setError(''); setInfoMsg(''); }}
            className={`flex-1 py-1 rounded-[9px] transition-all duration-300 cursor-pointer ${
              mode === 'FACULTY' ? 'bg-gradient-to-r from-[#2563eb] to-[#3b82f6] text-white shadow-sm font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Admin User
          </button>
        </div>

        {/* Center Shield Icon (Size 64px, Icon 28px, Floating Y Animation) */}
        <div className="text-center pt-0.5">
          <motion.div
            animate={{ y: [-3, 3, -3] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="w-[64px] h-[64px] rounded-full bg-[#eff6ff] flex items-center justify-center mx-auto shadow-inner border border-blue-100"
          >
            {mode === 'FACULTY' ? (
              <ShieldAlert className="w-7 h-7 text-[#2563eb]" />
            ) : (
              <ShieldCheck className="w-7 h-7 text-[#2563eb]" />
            )}
          </motion.div>

          {/* Page Title & Subtitle */}
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1.5">
            {mode === 'FACULTY' ? 'Faculty Reset' : 'Reset Password'}
          </h2>
          <p className="text-slate-500 text-[11px] sm:text-xs font-medium max-w-[300px] mx-auto mt-0.5">
            {mode === 'FACULTY'
              ? 'Enter Faculty Email, click Send OTP, and enter admin authorization code'
              : 'Enter email, click Send OTP, and enter verification code'}
          </p>
        </div>

        {/* Notifications */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              key="err"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="p-2.5 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-red-700 text-xs font-semibold"
            >
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
          {infoMsg && (
            <motion.div
              key="info"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 flex items-center gap-2 text-blue-800 text-xs font-semibold"
            >
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{infoMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Card State */}
        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-5 rounded-[18px] bg-emerald-50 border border-emerald-200 text-center space-y-2.5 shadow-sm"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-500/30">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <h3 className="text-lg font-black text-emerald-900">Password Reset Successful!</h3>
            <p className="text-xs text-emerald-700 font-medium">Your password has been updated securely. Redirecting to login page...</p>
          </motion.div>
        ) : (
          /* Form Fields (Height 46px, Radius 12px) */
          <form onSubmit={handleSubmit} className="space-y-2">
            
            {/* Email Address with Send OTP Button */}
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700">
                  {mode === 'FACULTY' ? 'Faculty Email Address' : 'Email Address'}
                </label>
                {otpSent && countdown > 0 && (
                  <span className="text-[10px] font-bold text-blue-600">
                    Resend in {countdown}s
                  </span>
                )}
              </div>
              <div className="h-[46px] bg-white border border-slate-200 focus-within:border-[#2563eb] focus-within:ring-2 focus-within:ring-[#2563eb]/15 rounded-[12px] flex items-center pl-3 pr-1.5 gap-2 transition-all duration-200">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={mode === 'FACULTY' ? "faculty.email@studentmanagementsystem.com" : "Registered Email"}
                  required
                  className="w-full bg-transparent text-slate-900 font-semibold text-xs placeholder-slate-400 focus:outline-none min-w-0"
                />
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={sendingOtp || (otpSent && countdown > 0)}
                  className="h-[34px] px-3 rounded-[8px] bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold text-[11px] whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0 shadow-sm"
                >
                  {sendingOtp ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : otpSent && countdown > 0 ? (
                    <span>{countdown}s</span>
                  ) : (
                    <>
                      <Send className="w-3 h-3" />
                      <span>{otpSent ? 'Resend OTP' : 'Send OTP'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* OTP Code */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-0.5">
                {mode === 'FACULTY' ? '6-Digit Admin Authorization OTP' : '6-Digit Verification Code'}
              </label>
              <OtpInput value={otp} onChange={setOtp} length={6} disabled={loading} />
            </div>

            {/* New Password */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-0.5">
                New Password
              </label>
              <div className="h-[46px] bg-white border border-slate-200 focus-within:border-[#2563eb] focus-within:ring-2 focus-within:ring-[#2563eb]/15 rounded-[12px] flex items-center px-3 gap-2 transition-all duration-200">
                <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                  className="w-full bg-transparent text-slate-900 font-semibold text-xs placeholder-slate-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer shrink-0"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-0.5">
                Confirm New Password
              </label>
              <div className="h-[46px] bg-white border border-slate-200 focus-within:border-[#2563eb] focus-within:ring-2 focus-within:ring-[#2563eb]/15 rounded-[12px] flex items-center px-3 gap-2 transition-all duration-200">
                <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  required
                  className="w-full bg-transparent text-slate-900 font-semibold text-xs placeholder-slate-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Primary CTA Button (Height 46px, Radius 12px, Font size 13px) */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.01, y: loading ? 0 : -2 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full h-[46px] rounded-[12px] font-bold text-xs sm:text-sm bg-gradient-to-r from-[#2563eb] to-[#3b82f6] hover:from-blue-700 hover:to-blue-600 text-white shadow-[0_10px_24px_rgba(37,99,235,0.25)] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed mt-3"
            >
              {loading ? (
                <div className="w-4.5 h-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{mode === 'FACULTY' ? 'Approve & Reset Faculty Password' : 'Reset Password'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>

          </form>
        )}

        {/* Footer Trust Line */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-center text-slate-400 text-[10.5px] font-bold gap-1.5">
          <span>🔒</span>
          <span>Secure • Encrypted • Trusted</span>
        </div>

      </div>
    </AuthLayout>
  );
};

export default ResetPassword;
