import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, RefreshCw, UserCheck, GraduationCap } from 'lucide-react';
import { StudentManagementLogo } from '../common/StudentManagementLogo';

export const AuthLeftBrandPanel = ({ title = "Admin Portal", subtitle = "Student Management System" }) => {
  return (
    <div className="relative w-full lg:w-[42%] bg-gradient-to-br from-[#0f4fff] via-[#2563eb] to-[#3b82f6] p-4 sm:p-5 lg:p-7 text-white flex flex-col justify-between overflow-hidden rounded-t-[24px] lg:rounded-t-none lg:rounded-l-[24px] shrink-0">
      
      {/* Background Glows & Dot Grid Accent */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-4 left-4 grid grid-cols-4 gap-1.5 opacity-20 pointer-events-none hidden sm:grid">
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} className="w-1 h-1 bg-white rounded-full" />
        ))}
      </div>

      {/* Faded Campus Building Overlay (Desktop/Tablet only) */}
      <div className="absolute inset-x-0 bottom-0 h-2/3 pointer-events-none overflow-hidden opacity-15 hidden lg:block">
        <img
          src="https://images.unsplash.com/photo-1562774053-701939374585?w=1000&q=80"
          alt="Campus Architecture"
          className="w-full h-full object-cover object-bottom"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f4fff] via-[#2563eb]/60 to-transparent" />
      </div>

      {/* Top Header Logo Section */}
      <div className="relative z-10 flex items-center justify-between lg:block">
        <StudentManagementLogo variant="login" />

        {/* Mobile Portal Badge */}
        <span className="lg:hidden text-[11px] font-bold bg-white/20 px-2.5 py-1 rounded-lg border border-white/30 text-white shadow-xs">
          {title}
        </span>
      </div>

      {/* Center Branding Titles & Accent (Desktop view) */}
      <div className="relative z-10 my-4 lg:my-auto space-y-2 hidden lg:block">
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-3xl sm:text-4xl lg:text-[40px] font-extrabold text-white tracking-tight leading-none"
        >
          {title}
        </motion.h1>
        
        <p className="text-xs sm:text-sm text-white/90 font-medium max-w-xs leading-relaxed">
          {subtitle}
        </p>

        {/* Decorative Cyan Line */}
        <div className="w-10 h-1 rounded-full bg-gradient-to-r from-cyan-400 to-blue-300 my-2.5" />
      </div>

      {/* Bottom 3 Glassmorphism Feature Cards (Desktop view) */}
      <div className="relative z-10 space-y-2 pt-2 hidden lg:block">
        {/* Feature 1 */}
        <motion.div
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="backdrop-blur-md bg-white/10 hover:bg-white/15 rounded-xl border border-white/15 py-2.5 px-3 flex items-center gap-3 transition duration-200"
        >
          <div className="w-9 h-9 rounded-lg bg-white/20 border border-white/30 flex items-center justify-center text-white shrink-0 shadow-inner">
            <ShieldCheck className="w-4.5 h-4.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white leading-snug">Secure Access</h4>
            <p className="text-[11px] text-white/80 font-normal">OTP based authentication</p>
          </div>
        </motion.div>

        {/* Feature 2 */}
        <motion.div
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
          className="backdrop-blur-md bg-white/10 hover:bg-white/15 rounded-xl border border-white/15 py-2.5 px-3 flex items-center gap-3 transition duration-200"
        >
          <div className="w-9 h-9 rounded-lg bg-white/20 border border-white/30 flex items-center justify-center text-white shrink-0 shadow-inner">
            <RefreshCw className="w-4.5 h-4.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white leading-snug">Data Protection</h4>
            <p className="text-[11px] text-white/80 font-normal">Your data is safe with us</p>
          </div>
        </motion.div>

        {/* Feature 3 */}
        <motion.div
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
          className="backdrop-blur-md bg-white/10 hover:bg-white/15 rounded-xl border border-white/15 py-2.5 px-3 flex items-center gap-3 transition duration-200"
        >
          <div className="w-9 h-9 rounded-lg bg-white/20 border border-white/30 flex items-center justify-center text-white shrink-0 shadow-inner">
            <UserCheck className="w-4.5 h-4.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white leading-snug">Easy Management</h4>
            <p className="text-[11px] text-white/80 font-normal">Manage students & certificates efficiently</p>
          </div>
        </motion.div>
      </div>

    </div>
  );
};

export default AuthLeftBrandPanel;
