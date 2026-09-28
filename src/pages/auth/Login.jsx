import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { authService } from "../../services/authService";
import OtpVerificationCard from "../../components/OtpVerificationCard";
import AuthLayout from "../../components/auth/AuthLayout";
import { motion } from "framer-motion";
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  UserCheck 
} from "lucide-react";
import { API_ORIGIN, getNormalizedApiBaseUrl } from "../../services/api";
import { toast as hotToast } from "react-hot-toast";
import { usePageTitle } from "../../hooks/usePageTitle";

const Login = () => {
  usePageTitle("Login");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, user, isInactiveLoggedOut, adminVerifyOtp, studentLogin, facultyLogin, setAuthUser } = useAuth();

  // Selected Role Tab: "ADMIN" | "STUDENT"
  const [roleTab, setRoleTab] = useState("ADMIN");

  // Authentication Flow State: "LOGIN" | "OTP"
  const [step, setStep] = useState("LOGIN");
  
  // Credentials & OTP inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // Check query params for Google auth errors
  useEffect(() => {
    const googleErr = searchParams.get("error");
    if (googleErr === "unauthorized" || googleErr === "google_unauthorized" || googleErr === "google_not_authorized") {
      setError("Your Google account is not authorized for Student Management System access. Please contact the administrator.");
    } else if (googleErr === "role_not_allowed") {
      setError("Your role is not authorized for portal access. Please contact the administrator.");
    } else if (googleErr === "account_disabled") {
      setError("Your account is disabled. Please contact the administrator.");
    } else if (googleErr === "google_failed") {
      setError("Google sign-in failed or was cancelled. Please try again.");
    }
  }, [searchParams]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      let rawRole = "";
      if (typeof user.role === "string") rawRole = user.role;
      else if (user.role?.roleName) rawRole = user.role.roleName;
      else if (user.role?.name) rawRole = user.role.name;

      const role = rawRole.replace("ROLE_", "").toUpperCase();
      if (role === "STUDENT" || role === "FACULTY") {
        if (user.mustChangePassword) {
          navigate("/student/change-password", { replace: true });
        } else {
          navigate("/student/dashboard", { replace: true });
        }
      } else if (role === "ADMIN") {
        navigate("/admin/dashboard", { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const validateCredentials = () => {
    const errors = {};
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      errors.email = "Email address is required";
    }
    if (!password) {
      errors.password = "Password is required";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // STEP 1: Submit Credentials
  const handleCredentialSubmit = async (e) => {
    e.preventDefault();
    if (!validateCredentials()) return;

    hotToast.dismiss();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    const cleanEmail = email.trim();

    try {
      if (roleTab === "ADMIN") {
        const response = await authService.adminLogin(cleanEmail, password);
        const targetEmail = response?.email || cleanEmail;
        localStorage.setItem("pendingEmail", targetEmail);
        setEmail(targetEmail);
        setStep("OTP");
        setSuccessMsg(response?.message || "OTP sent successfully to " + targetEmail);
      } else {
        const loginFn = studentLogin || facultyLogin;
        const response = await loginFn(cleanEmail, password);
        const targetUser = response?.user || tokenUtils.getUser() || { email: cleanEmail, role: 'STUDENT' };
        if (targetUser?.mustChangePassword) {
          setSuccessMsg("Initial login detected. Redirecting to password change...");
          navigate("/student/change-password", { replace: true });
        } else {
          setSuccessMsg("Student login successful. Redirecting to portal...");
          navigate("/student/dashboard", { replace: true });
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.customMessage || err.message || "Invalid credentials or access denied";
      setError(msg);
      hotToast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth Redirect
  const handleGoogleSignIn = () => {
    setError("");
    const origin = (getNormalizedApiBaseUrl() || API_ORIGIN).replace(/\/api$/, '');
    window.location.href = `${origin}/oauth2/authorization/google`;
  };

  const handleBackToLogin = () => {
    setStep("LOGIN");
    setError("");
    setSuccessMsg("");
    localStorage.removeItem("pendingEmail");
  };

  // Render OTP Verification Card when Admin enters credentials
  if (step === "OTP") {
    const targetEmail = email || localStorage.getItem("pendingEmail") || "your email";
    return (
      <OtpVerificationCard
        email={targetEmail}
        length={4}
        title="Admin Security Verification"
        subtitle="Student Management System"
        onVerify={async (code) => {
          const response = await adminVerifyOtp(targetEmail, code);
          const targetUser = response?.user || { email: targetEmail, role: 'ADMIN' };
          if (setAuthUser) setAuthUser(targetUser);
          localStorage.removeItem("pendingEmail");
          await new Promise((resolve) => setTimeout(resolve, 1500));
          navigate("/admin/dashboard", { replace: true });
        }}
        onResend={async () => {
          await authService.resendOtp(targetEmail);
        }}
        onBack={handleBackToLogin}
      />
    );
  }

  return (
    <AuthLayout
      title={roleTab === "ADMIN" ? "Admin Portal" : "Student Portal"}
      subtitle="Student Management System"
    >
      <div className="w-full max-w-[430px] mx-auto space-y-3.5 my-auto px-1 sm:px-0">
        
        {/* Tab Switcher */}
        <div className="bg-[#f1f5f9] rounded-[14px] p-1 flex h-[48px] w-full border border-slate-200/80 text-xs font-bold shrink-0">
          <button
            type="button"
            onClick={() => {
              hotToast.dismiss();
              setRoleTab("ADMIN");
              setError("");
              setSuccessMsg("");
              setFieldErrors({});
            }}
            className={"flex-1 py-2 rounded-[10px] transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer " + (
              roleTab === "ADMIN"
                ? "bg-gradient-to-r from-[#2563eb] to-[#3b82f6] text-white shadow-xs font-bold"
                : "text-slate-500 hover:text-slate-900"
            )}
          >
            <ShieldCheck className="w-3.5 h-3.5" /> 
            <span>Admin (OTP)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              hotToast.dismiss();
              setRoleTab("STUDENT");
              setError("");
              setSuccessMsg("");
              setFieldErrors({});
            }}
            className={"flex-1 py-2 rounded-[10px] transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer " + (
              roleTab === "STUDENT"
                ? "bg-gradient-to-r from-[#2563eb] to-[#3b82f6] text-white shadow-xs font-bold"
                : "text-slate-500 hover:text-slate-900"
            )}
          >
            <UserCheck className="w-3.5 h-3.5" /> 
            <span>Student (Direct)</span>
          </button>
        </div>

        {/* Center Shield Icon */}
        <div className="text-center pt-0.5">
          <motion.div
            animate={{ y: [-3, 3, -3] }}
            transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
            className="w-[76px] h-[76px] sm:w-[84px] sm:h-[84px] rounded-full bg-[#eff6ff] flex items-center justify-center mx-auto shadow-inner border border-blue-100"
          >
            {roleTab === "ADMIN" ? (
              <ShieldCheck className="w-8 h-8 sm:w-9 sm:h-9 text-[#2563eb]" />
            ) : (
              <UserCheck className="w-8 h-8 sm:w-9 sm:h-9 text-[#2563eb]" />
            )}
          </motion.div>

          {/* Page Title & Subtitle */}
          <h2 className="text-2xl sm:text-[26px] font-black text-slate-900 tracking-tight mt-2">
            {roleTab === "ADMIN" ? "Admin Sign In" : "Student Sign In"}
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium max-w-[320px] mx-auto mt-0.5">
            {roleTab === "ADMIN" ? "Enter your credentials to receive an email OTP" : "Enter your credentials to access your student portal"}
          </p>
        </div>

        {/* Notifications */}
        {isInactiveLoggedOut && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2 text-amber-700 text-xs font-semibold w-full shrink-0 break-words max-w-full">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
            <span className="flex-1 min-w-0">You were logged out due to inactivity for security reasons. Please log in again.</span>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2 text-red-700 text-xs font-semibold w-full shrink-0 break-words max-w-full">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
            <span className="flex-1 min-w-0">{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2 text-emerald-700 text-xs font-semibold w-full shrink-0 break-words max-w-full">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
            <span className="flex-1 min-w-0">{successMsg}</span>
          </div>
        )}

        {/* Form Fields - Inputs use font-size 16px (text-base) on mobile to prevent iOS Safari auto-zoom */}
        <form className="space-y-3" onSubmit={handleCredentialSubmit}>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
              Email Address
            </label>
            <div className={"h-[48px] sm:h-[50px] bg-white border " + (
              fieldErrors.email ? "border-red-500 focus-within:ring-red-500" : "border-slate-200 focus-within:border-[#2563eb] focus-within:ring-2 focus-within:ring-[#2563eb]/15"
            ) + " rounded-[12px] flex items-center px-3.5 gap-2.5 transition-all duration-200"}>
              <Mail className="w-4.5 h-4.5 text-slate-400 shrink-0" />
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: "" });
                }}
                placeholder="Enter your registered email"
                className="w-full bg-transparent text-slate-900 font-semibold text-base sm:text-sm placeholder-slate-400 focus:outline-none"
              />
            </div>
            {fieldErrors.email && (
              <p className="mt-1 text-xs text-red-500 font-semibold">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
              Password
            </label>
            <div className={"h-[48px] sm:h-[50px] bg-white border " + (
              fieldErrors.password ? "border-red-500 focus-within:ring-red-500" : "border-slate-200 focus-within:border-[#2563eb] focus-within:ring-2 focus-within:ring-[#2563eb]/15"
            ) + " rounded-[12px] flex items-center px-3.5 gap-2.5 transition-all duration-200"}>
              <Lock className="w-4.5 h-4.5 text-slate-400 shrink-0" />
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: "" });
                }}
                placeholder="Enter your password"
                className="w-full bg-transparent text-slate-900 font-semibold text-base sm:text-sm placeholder-slate-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer shrink-0 p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="mt-1 text-xs text-red-500 font-semibold">{fieldErrors.password}</p>
            )}
          </div>

          <div className="flex items-center justify-end pt-0.5">
            <Link
              to="/reset-password?mode=student"
              className="text-xs font-bold text-[#2563eb] hover:underline transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          {/* Primary CTA Button */}
          <motion.button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            aria-label={loading ? (roleTab === "ADMIN" ? "Sending login OTP" : "Signing in as Student") : (roleTab === "ADMIN" ? "Send Login OTP" : "Sign in as Student")}
            whileHover={{ scale: loading ? 1 : 1.01 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            className="w-full min-h-[48px] sm:min-h-[50px] rounded-[12px] text-white font-bold text-xs sm:text-sm bg-gradient-to-r from-[#2563eb] to-[#3b82f6] hover:from-blue-700 hover:to-blue-600 shadow-[0_10px_24px_rgba(37,99,235,0.22)] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed mt-3"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                <span className="font-semibold">{roleTab === "ADMIN" ? "Sending OTP..." : "Signing in..."}</span>
              </div>
            ) : (
              <>
                <span>{roleTab === "ADMIN" ? "Send Login OTP" : "Sign in as Student"}</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </>
            )}
          </motion.button>
        </form>

        {/* Or Divider */}
        <div className="relative flex items-center justify-center my-3">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest absolute">
            Or continue with
          </span>
        </div>

        {/* Google OAuth Button */}
        <motion.button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          whileHover={{ scale: loading ? 1 : 1.01 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
          className="w-full h-[48px] sm:h-[50px] bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm rounded-[12px] shadow-xs hover:shadow-md transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60"
        >
          <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </motion.button>

        {/* Footer Trust Line */}
        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-center text-slate-400 text-[10.5px] font-bold gap-1.5">
          <span>🔒</span>
          <span>Secure • Encrypted • Trusted</span>
        </div>

      </div>
    </AuthLayout>
  );
};

export default Login;
