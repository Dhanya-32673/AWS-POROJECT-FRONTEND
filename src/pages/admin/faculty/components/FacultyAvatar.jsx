import React, { useState, useEffect } from 'react';

export const FacultyAvatar = ({
  src,
  name = 'Faculty',
  size = 'w-9 h-9 text-xs',
  className = '',
  alt
}) => {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [src]);

  const initials = (name && typeof name === 'string' && name.trim())
    ? name.trim().charAt(0).toUpperCase()
    : 'F';

  const hasValidPhoto =
    src &&
    typeof src === 'string' &&
    src.trim() !== '' &&
    src !== 'null' &&
    src !== 'undefined' &&
    !imageError;

  if (hasValidPhoto) {
    return (
      <div className={`${size} rounded-xl overflow-hidden shrink-0 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs ${className}`}>
        <img
          src={src}
          alt={alt || name || 'Faculty'}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`${size} rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs select-none ${className}`}
      title={name}
      aria-label={name}
    >
      {initials}
    </div>
  );
};

export default FacultyAvatar;
