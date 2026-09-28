import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { studentPortalService } from '../../services/studentPortalService';
import toast from '../../utils/toastService';
import {
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { usePageTitle } from '../../hooks/usePageTitle';

export const StudentChangePassword = () => {
  usePageTitle('Change Password');
  const { user, setAuthUser } = useAuth();
  const navigate = useNavigate();

  const isFirstLogin = Boolean(user?.mustChangePassword);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const errs = {};
    if (!currentPassword) {
      errs.currentPassword = 'Enter your current password (or temporary DOB password).';
    }

    if (!newPassword) {
      errs.newPassword = 'New password is required.';
    } else if (newPassword.length < 8) {
      errs.newPassword = 'Password must be at least 8 characters long.';
    } else {
      const hasUpper = /[A-Z]/.test(newPassword);
      const hasLower = /[a-z]/.test(newPassword);
      const hasDigit = /[0-9]/.test(newPassword);
      const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
      if (!hasUpper || !hasLower || !hasDigit || !hasSpecial) {
        errs.newPassword = 'Password must contain uppercase, lowercase, number, and special character.';
      } else if (newPassword === currentPassword) {
        errs.newPassword = 'New password must be different from current password.';
      }
    }

    if (!confirmPassword) {
      errs.confirmPassword = 'Confirm your new password.';
    } else if (confirmPassword !== newPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      setErrors({});

      await studentPortalService.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      // Update auth user to clear mustChangePassword flag
      if (user && setAuthUser) {
        setAuthUser({
          ...user,
          mustChangePassword: false,
        });
      }

      setSuccess(true);
      toast.success('Password changed successfully!');

      setTimeout(() => {
        navigate('/student/dashboard', { replace: true });
      }, 1500);
    } catch (err) {
      console.error('Password change failed:', err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Unable to update password. Please check your current password and try again.';
      setErrors({ form: msg });
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-6 sm:py-10">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-lg space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <KeyRound className="w-7 h-7" />
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {isFirstLogin ? 'First Login — Set New Password' : 'Change Your Password'}
          </h1>

          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
            {isFirstLogin
              ? 'For your security, please create a new password before accessing your Student Portal.'
              : 'Keep your student portal account secure with a strong password.'}
          </p>
        </div>

        {/* Global Error Notice */}
        {errors.form && (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs flex items-start space-x-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errors.form}</span>
          </div>
        )}

        {/* Success Banner */}
        {success ? (
          <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
            <h3 className="text-base font-bold text-emerald-800 dark:text-emerald-200">
              Password Changed Successfully!
            </h3>
            <p className="text-xs text-emerald-700 dark:text-emerald-300">
              Redirecting you to your Student Dashboard...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Current Password Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Current Password {isFirstLogin && <span className="text-blue-600 font-normal">(Temporary DOB Password)</span>}
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder={isFirstLogin ? 'e.g. DD-MM-YYYY' : 'Enter current password'}
                  disabled={loading}
                  className={`w-full pl-4 pr-11 py-2.5 bg-slate-50 dark:bg-slate-800 border ${
                    errors.currentPassword ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                  } rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition`}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                  tabIndex={-1}
                  aria-label={showCurrent ? 'Hide current password' : 'Show current password'}
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="text-[11px] text-red-600 dark:text-red-400 mt-1 font-medium">
                  {errors.currentPassword}
                </p>
              )}
            </div>

            {/* New Password Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter at least 8 characters"
                  disabled={loading}
                  className={`w-full pl-4 pr-11 py-2.5 bg-slate-50 dark:bg-slate-800 border ${
                    errors.newPassword ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                  } rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition`}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                  tabIndex={-1}
                  aria-label={showNew ? 'Hide new password' : 'Show new password'}
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-[11px] text-red-600 dark:text-red-400 mt-1 font-medium">
                  {errors.newPassword}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  disabled={loading}
                  className={`w-full pl-4 pr-11 py-2.5 bg-slate-50 dark:bg-slate-800 border ${
                    errors.confirmPassword ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                  } rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                  tabIndex={-1}
                  aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-[11px] text-red-600 dark:text-red-400 mt-1 font-medium">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Password Policy Indicator */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
              <span className="font-bold text-slate-700 dark:text-slate-300 block">Password Guidelines:</span>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Minimum 8 characters</li>
                <li>Different from your temporary date of birth password</li>
              </ul>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-md shadow-blue-600/20 cursor-pointer disabled:opacity-50 min-h-[44px]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Update Password</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default StudentChangePassword;
