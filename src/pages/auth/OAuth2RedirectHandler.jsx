import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { tokenUtils } from '../../utils/tokenUtils';

const OAuth2RedirectHandler = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const role = searchParams.get('role') || 'ROLE_ADMIN';
    const email = searchParams.get('email');

    if (token) {
      tokenUtils.saveAuth({
        accessToken: token,
        token: token,
        role: role,
        email: email
      });

      const cleanRole = role.replace('ROLE_', '').toUpperCase();
      if (cleanRole === 'FACULTY') {
        window.location.href = '/faculty/dashboard';
      } else if (cleanRole === 'STUDENT') {
        window.location.href = '/student/dashboard';
      } else {
        window.location.href = '/admin/dashboard';
      }
    } else {
      navigate('/login?error=google_failed', { replace: true });
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#f8fafc] font-sans">
      <div className="w-12 h-12 border-4 border-blue-200 border-t-[#2563eb] rounded-full animate-spin mb-4" />
      <h3 className="text-xl font-bold text-slate-800">Authenticating with Google...</h3>
      <p className="text-sm text-slate-500 font-medium mt-1">Please wait while we redirect you to your portal</p>
    </div>
  );
};

export default OAuth2RedirectHandler;
