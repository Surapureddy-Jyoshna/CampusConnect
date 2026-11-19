import React, { useState, useEffect } from 'react';
import {
  Bot,
  GraduationCap,
  ShieldCheck,
  Lock,
  User,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ShieldAlert,
  Sparkles
} from 'lucide-react';

export default function LoginPage({ onLoginSuccess, onBackToHome, health, initialRole = 'student' }) {
  // Role: 'student' | 'admin'
  const [role, setRole] = useState(initialRole || 'student');

  // Sign In State
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState(null);

  // Live lookup states to fetch student or admin record preview
  const [lookupPreview, setLookupPreview] = useState(null);

  // When role changes, reset preview and error
  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setLoginError(null);
    setLookupPreview(null);
    setLoginId('');
    setLoginPassword('');
  };

  // Debounced lookup on ID change
  useEffect(() => {
    if (!loginId || loginId.trim().length < 3) {
      setLookupPreview(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/auth/user/${loginId.trim()}`);
        const data = await res.json();
        if (data.success && data.user) {
          // If in student mode, only preview if student record
          if (role === 'student' && data.user.role === 'admin') {
            setLookupPreview(null);
          } else if (role === 'admin' && data.user.role !== 'admin') {
            setLookupPreview(null);
          } else {
            setLookupPreview(data.user);
          }
        } else {
          setLookupPreview(null);
        }
      } catch {
        setLookupPreview(null);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [loginId, role]);

  // Handle Login Authentication
  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!loginId.trim()) {
      setLoginError(role === 'student' ? 'Please enter your Student Roll Number (e.g. R210688).' : 'Please enter your Administrator ID (e.g. EMP-IT-008 or ADMIN).');
      return;
    }

    setIsLoggingIn(true);
    setLoginError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: loginId.trim(),
          password: loginPassword,
          role
        })
      });

      const data = await res.json();
      if (res.ok && data.success && data.user) {
        onLoginSuccess(data.user);
      } else {
        setLoginError(data.error || 'Authentication failed. Please check your credentials.');
      }
    } catch (err) {
      setLoginError('Server connection error: ' + err.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Helper to prefill sample credentials into the input
  const handleFillSample = (sampleId, samplePass = '') => {
    setLoginId(sampleId);
    setLoginPassword(samplePass || (role === 'student' ? 'password123' : 'admin123'));
    setLoginError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 text-slate-800 flex flex-col justify-between font-['Plus_Jakarta_Sans',sans-serif]">

      {/* Top Bar */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-500 via-indigo-500 to-sky-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-1.5">
              CampusConnect
              <span className="text-[10px] uppercase font-bold tracking-widest bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-400/30">
                RAG-AI
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              University Academic Retrieval & Personal Records System
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white border border-white/10 hover:border-white/30 rounded-xl transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
              <span>Back to Home</span>
            </button>
          )}
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            Database Synced
          </span>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="max-w-xl mx-auto w-full px-4 py-6">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-2xl p-6 sm:p-8">

          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {role === 'student' ? 'Student Portal Login' : 'Administrator Portal Login'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {role === 'student'
                ? 'Enter your university Roll Number to authenticate against students_data'
                : 'Exclusive access for verified staff in the administrator collection'}
            </p>
          </div>

          {/* Role Switcher Tabs */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl mb-6 border border-slate-200/80">
            <button
              type="button"
              onClick={() => handleRoleChange('student')}
              className={`flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                role === 'student'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-blue-600" />
              <span>Student Login</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleChange('admin')}
              className={`flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                role === 'admin'
                  ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Admin / Faculty</span>
            </button>
          </div>

          {/* Login Form */}
          <div className="space-y-4">
            {loginError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2.5 shadow-2xs">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {role === 'student' ? 'Student ID / Roll Number' : 'Administrator Staff ID'} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    placeholder={role === 'student' ? 'e.g. R210688, R210177, R210137' : 'e.g. EMP-IT-008 or ADMIN'}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-hidden focus:border-blue-600 focus:bg-white transition-all uppercase placeholder:normal-case font-semibold"
                    required
                  />
                </div>

                {/* Live Fetched Record Preview */}
                {lookupPreview && (
                  <div className={`mt-2.5 p-3 rounded-2xl border text-xs shadow-2xs ${
                    role === 'admin' 
                      ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200/90' 
                      : 'bg-gradient-to-r from-blue-50 to-teal-50 border-blue-200/90'
                  }`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        {lookupPreview.name}
                      </span>
                      <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full text-white shadow-2xs ${
                        role === 'admin' ? 'bg-indigo-600' : 'bg-blue-600'
                      }`}>
                        {role === 'admin' ? 'Verified Admin' : `[${lookupPreview.batch || 'E4'}]`}
                      </span>
                    </div>
                    {role === 'student' ? (
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-slate-700">
                        <div>Attendance: <strong className="text-emerald-700 font-bold">{lookupPreview.attendance}</strong></div>
                        <div>CGPA: <strong className="text-slate-900 font-bold">{lookupPreview.cgpa} / 10</strong></div>
                        <div className="truncate">Mentor: <strong className="text-indigo-700 font-bold">{lookupPreview.advisor}</strong></div>
                        <div className="truncate">Hostel: <strong className="text-slate-900 font-bold">{lookupPreview.hostelRoom}</strong></div>
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-700 space-y-0.5">
                        <div>Designation: <strong className="text-indigo-800 font-bold">{lookupPreview.designation || 'Academic Administrator'}</strong></div>
                        <div>Department: <strong className="text-slate-800 font-bold">{lookupPreview.department}</strong></div>
                      </div>
                    )}
                  </div>
                )}

                <span className="text-[11px] text-slate-400 mt-1 block">
                  {role === 'student'
                    ? 'Authentication queries live student records from the students_data database collection.'
                    : 'Administrator accounts are authenticated strictly against the admins collection.'}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder={role === 'student' ? 'Default: password123' : 'Default: admin123'}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-blue-600 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className={`w-full py-3 rounded-xl disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2 ${
                  role === 'admin'
                    ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
                }`}
              >
                <span>
                  {isLoggingIn
                    ? 'Authenticating Credentials...'
                    : (role === 'admin' ? 'Verify & Access Admin Dashboard' : 'Verify Student Record & Login')}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick-Click Sample Credentials for Evaluators */}
            <div className="pt-4 mt-4 border-t border-slate-100">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Quick-Select Credentials for Testing:</span>
              </p>
              {role === 'student' ? (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleFillSample('R210688', 'password123')}
                    className="text-left p-2 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition-all text-[11px]"
                  >
                    <span className="font-bold text-slate-800 block">SURAPUREDDY JYOSHNA</span>
                    <span className="font-mono text-blue-600 font-bold">R210688</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFillSample('R210177', 'password123')}
                    className="text-left p-2 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition-all text-[11px]"
                  >
                    <span className="font-bold text-slate-800 block">MUDDAMU SWATHI</span>
                    <span className="font-mono text-blue-600 font-bold">R210177</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleFillSample('EMP-IT-008', 'admin123')}
                    className="text-left p-2 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 transition-all text-[11px]"
                  >
                    <span className="font-bold text-slate-800 block">Mrs. Shanthi Victoria</span>
                    <span className="font-mono text-indigo-600 font-bold">EMP-IT-008</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFillSample('ADMIN', 'admin123')}
                    className="text-left p-2 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 transition-all text-[11px]"
                  >
                    <span className="font-bold text-slate-800 block">Super Administrator</span>
                    <span className="font-mono text-indigo-600 font-bold">ADMIN</span>
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-4 text-xs text-slate-500">
        CampusConnect • RGUKT RK Valley & Department of Information Technology
      </div>

    </div>
  );
}
