import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { APP_NAME, APP_SHORT_NAME, APP_LOGO } from '../../constants/branding';

/**
 * Standardized Student Management System Reusable Logo Component
 *
 * Supported Variants:
 * - 'icon': Just the emblem icon badge
 * - 'header': Horizontal desktop/mobile header layout
 * - 'sidebar': Vertical/stacked sidebar header layout
 * - 'login': High-impact authentication brand layout
 * - 'id-card': Crisp white badge container for Student ID card
 * - 'full': Logo + "STUDENT MANAGEMENT SYSTEM"
 * - 'compact': Logo + "STUDENT MANAGEMENT"
 */
export const StudentManagementLogo = ({
  variant = 'full',
  size = 'md',
  className = '',
  imgClassName = '',
  textClassName = '',
  linkTo = null,
  showText = true,
  onClick = null,
}) => {
  const [imgError, setImgError] = useState(false);

  // Size mappings for image container
  const sizeMap = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-14 h-14',
    '2xl': 'w-16 h-16',
  };

  const currentSizeClass = sizeMap[size] || size;

  // Render the logo icon badge
  const renderIcon = (extraContainerClasses = '') => (
    <div
      className={`relative flex items-center justify-center shrink-0 bg-white rounded-xl shadow-xs border border-white/40 overflow-hidden ${currentSizeClass} ${extraContainerClasses}`}
    >
      {!imgError ? (
        <img
          src={APP_LOGO}
          alt={APP_NAME}
          className={`w-full h-full object-contain p-0.5 transition-transform duration-200 ${imgClassName}`}
          loading="eager"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="w-full h-full rounded-lg bg-blue-50 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
          <GraduationCap className="w-3/5 h-3/5" />
        </div>
      )}
    </div>
  );

  let content = null;

  if (variant === 'icon') {
    content = renderIcon();
  } else if (variant === 'sidebar') {
    content = (
      <div className={`flex items-center space-x-3 min-w-0 ${className}`}>
        {renderIcon('p-1')}
        {showText && (
          <div className="truncate min-w-0">
            <span className={`font-black text-white text-sm sm:text-base tracking-wider block leading-tight truncate ${textClassName}`}>
              STUDENT
            </span>
            <span className="text-[8.5px] sm:text-[9px] text-blue-100 font-extrabold uppercase tracking-widest block mt-0.5 truncate">
              MANAGEMENT SYSTEM
            </span>
          </div>
        )}
      </div>
    );
  } else if (variant === 'header') {
    content = (
      <div className={`flex items-center space-x-2.5 min-w-0 ${className}`}>
        {renderIcon('p-0.5')}
        {showText && (
          <div className="min-w-0">
            <span className={`font-black text-slate-800 dark:text-white text-xs sm:text-sm tracking-wide hidden sm:inline-block whitespace-nowrap ${textClassName}`}>
              {APP_NAME}
            </span>
            <span className={`font-black text-blue-600 dark:text-blue-400 text-xs tracking-tight sm:hidden whitespace-nowrap ${textClassName}`}>
              {APP_SHORT_NAME}
            </span>
          </div>
        )}
      </div>
    );
  } else if (variant === 'login') {
    content = (
      <div className={`inline-flex items-center gap-2.5 sm:gap-3 bg-white/10 backdrop-blur-md p-1.5 sm:p-2 pr-3 sm:pr-4 rounded-xl border border-white/20 shadow-sm max-w-full ${className}`}>
        {renderIcon('p-1 w-9 h-9 sm:w-11 sm:h-11')}
        {showText && (
          <div className="text-left truncate">
            <span className={`font-black text-white text-sm sm:text-base tracking-wider block leading-tight truncate ${textClassName}`}>
              STUDENT
            </span>
            <span className="text-[8px] sm:text-[9px] text-blue-100 font-extrabold uppercase tracking-widest block mt-0.5 truncate">
              MANAGEMENT SYSTEM
            </span>
          </div>
        )}
      </div>
    );
  } else if (variant === 'id-card') {
    content = (
      <div className={`flex flex-col items-center text-center ${className}`}>
        {renderIcon('w-12 h-12 sm:w-14 sm:h-14 p-1.5 mx-auto mb-2')}
        {showText && (
          <h1 className={`text-base sm:text-[17px] font-black tracking-wider uppercase text-white leading-tight ${textClassName}`}>
            {APP_NAME}
          </h1>
        )}
      </div>
    );
  } else if (variant === 'compact') {
    content = (
      <div className={`flex items-center space-x-2 min-w-0 ${className}`}>
        {renderIcon('p-0.5')}
        {showText && (
          <span className={`font-black text-slate-900 dark:text-white text-xs sm:text-sm tracking-tight truncate ${textClassName}`}>
            STUDENT MANAGEMENT
          </span>
        )}
      </div>
    );
  } else {
    // Default 'full' variant
    content = (
      <div className={`flex items-center space-x-3 min-w-0 ${className}`}>
        {renderIcon('p-1')}
        {showText && (
          <div className="truncate min-w-0">
            <span className={`font-black text-slate-900 dark:text-white text-sm sm:text-base tracking-tight block leading-tight truncate ${textClassName}`}>
              STUDENT
            </span>
            <span className="text-[9px] text-blue-600 dark:text-blue-400 font-extrabold uppercase tracking-wider block mt-0.5 truncate">
              MANAGEMENT SYSTEM
            </span>
          </div>
        )}
      </div>
    );
  }

  if (linkTo) {
    return (
      <Link to={linkTo} onClick={onClick} className="inline-flex items-center group cursor-pointer">
        {content}
      </Link>
    );
  }

  if (onClick) {
    return (
      <div onClick={onClick} className="inline-flex items-center group cursor-pointer">
        {content}
      </div>
    );
  }

  return content;
};

// Re-export as AppLogo for flexible import naming
export const AppLogo = StudentManagementLogo;
export default StudentManagementLogo;
