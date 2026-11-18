import React, { useState } from 'react';
import {
  Bot,
  GraduationCap,
  ShieldCheck,
  Lock,
  User,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Mail,
  Phone,
  Building,
  KeyRound,
  UserPlus,
  LogIn
} from 'lucide-react';
import { DEMO_STUDENTS, DEMO_ADMIN } from '../data/authUsers.js';

export default function LoginPage({ onLoginSuccess, onBackToHome, health, initialMode = 'signin' }) {
  // Mode: 'signin' | 'signup'
  const [authMode, setAuthMode] = useState(initialMode);
  // Role: 'student' | 'admin'
  const [role, setRole] = useState('student');

  // Sign In State
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState(null);

  // Sign Up State
  const [signupForm, setSignupForm] = useState({
    id: '',
    name: '',
    batch: 'E4',
    department: 'Computer Science & Engineering',
    email: '',
    phone: '',
    password: '',
    designation: 'Associate Professor'
  });
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [signupError, setSignupError] = useState(null);
  const [signupSuccess, setSignupSuccess] = useState(null);

  // Live lookup states to fetch details according to ID number
  const [lookupPreview, setLookupPreview] = useState(null);
  const [signupLookup, setSignupLookup] = useState(null);

  // Debounced lookup on Sign In ID change
  React.useEffect(() => {
    if (!loginId || loginId.trim().length < 4) {
      setLookupPreview(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/auth/user/${loginId.trim()}`);
        const data = await res.json();
        if (data.success && data.user) {
          setLookupPreview(data.user);
        } else {
          setLookupPreview(null);
        }
      } catch {
        setLookupPreview(null);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [loginId]);

  // Debounced lookup on Sign Up ID change
  React.useEffect(() => {
    if (!signupForm.id || signupForm.id.trim().length < 4) {
      setSignupLookup(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/auth/user/${signupForm.id.trim()}`);
        const data = await res.json();
        if (data.success && data.user) {
          setSignupLookup(data.user);
          // Autofill name and batch if currently blank
          setSignupForm(prev => ({
            ...prev,
            name: prev.name ? prev.name : (data.user.name || ''),
            batch: data.user.batch || prev.batch,
            department: data.user.department || prev.department
          }));
        } else {
          setSignupLookup(null);
        }
      } catch {
        setSignupLookup(null);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [signupForm.id]);

  // Handle Sign In (Fetches user from database using ID Number)
  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!loginId.trim()) {
      setLoginError('Please enter your ID Number (Roll Number or Staff ID).');
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
      if (data.success && data.user) {
        onLoginSuccess(data.user);
      } else {
        setLoginError(data.error || 'Failed to login with this ID Number.');
      }
    } catch (err) {
      setLoginError('Server connection error: ' + err.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Sign Up (Takes Name, ID, Batch, Department, etc. and saves to database)
  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!signupForm.id.trim() || !signupForm.name.trim()) {
      setSignupError('Please provide both ID Number and Full Name.');
      return;
    }

    setIsSigningUp(true);
    setSignupError(null);
    setSignupSuccess(null);

    try {
      const payload = {
        id: signupForm.id.trim(),
        name: signupForm.name.trim(),
        role,
        batch: role === 'admin' ? 'All' : signupForm.batch,
        department: signupForm.department.trim(),
        email: signupForm.email.trim(),
        phone: signupForm.phone.trim(),
        password: signupForm.password || 'password123',
        designation: signupForm.designation
      };

      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success && data.user) {
        setSignupSuccess(`Account created for ${data.user.name}! Logging you in...`);
        setTimeout(() => {
          onLoginSuccess(data.user);
        }, 800);
      } else {
        setSignupError(data.error || 'Registration failed.');
      }
    } catch (err) {
      setSignupError('Server error: ' + err.message);
    } finally {
      setIsSigningUp(false);
    }
  };

  // Quick 1-click student demo login (queries database using student ID)
  const handleQuickStudent = async (student) => {
    setLoginId(student.id);
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: student.id,
          password: 'password123',
          role: 'student'
        })
      });
      const data = await res.json();
      if (data.success && data.user) {
        onLoginSuccess(data.user);
      } else {
        onLoginSuccess(student);
      }
    } catch {
      onLoginSuccess(student);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Quick 1-click admin demo login
  const handleQuickAdmin = () => {
    onLoginSuccess(DEMO_ADMIN);
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
              Information Retrieval System
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white border border-white/10 hover:border-white/30 rounded-xl transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
              <span>Back to Home</span>
            </button>
          )}
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            Database Synced
          </span>
        </div>
      </div>

      {/* Main Auth Card */}
      <div className="max-w-xl mx-auto w-full px-4 py-6">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-2xl p-6 sm:p-8">

          {/* Header & Mode Switcher (Sign In vs Sign Up) */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {authMode === 'signin' ? 'Sign In to CampusConnect' : 'Create New Account'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {authMode === 'signin'
                ? 'Enter your registered ID Number to fetch your personal dashboard & AI chatbot'
                : 'Register your details to create your batch-personalized account'}
            </p>

            {/* Toggle: Sign In vs Sign Up */}
            <div className="flex items-center justify-center space-x-2 mt-4 bg-slate-100 p-1 rounded-2xl border border-slate-200 w-fit mx-auto">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setLoginError(null);
                  setSignupError(null);
                }}
                className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${authMode === 'signin'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setLoginError(null);
                  setSignupError(null);
                }}
                className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${authMode === 'signup'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Sign Up (Register)</span>
              </button>
            </div>
          </div>

          {/* Role Tabs: Student vs Admin */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl mb-5">
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`flex items-center justify-center space-x-2 py-2 rounded-xl text-xs font-bold transition-all ${role === 'student'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              <GraduationCap className="w-4 h-4 text-blue-600" />
              <span>Student</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('admin')}
              className={`flex items-center justify-center space-x-2 py-2 rounded-xl text-xs font-bold transition-all ${role === 'admin'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Admin / Faculty</span>
            </button>
          </div>

          {/* ================= MODE 1: SIGN IN ================= */}
          {authMode === 'signin' && (
            <div className="space-y-4">

              {loginError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleSignIn} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {role === 'student' ? 'Student ID / Roll Number' : 'Staff / Employee ID Number'} <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={loginId}
                      onChange={(e) => setLoginId(e.target.value)}
                      placeholder={role === 'student' ? 'e.g. 721821IT045 or R210543' : 'e.g. EMP-IT-008 or admin'}
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-hidden focus:border-blue-600 focus:bg-white transition-all uppercase placeholder:normal-case"
                      required
                    />
                  </div>

                  {/* Live Fetched Student Details by ID */}
                  {lookupPreview && (
                    <div className="mt-2.5 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/90 text-xs shadow-2xs">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-extrabold text-blue-900 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          {lookupPreview.name}
                        </span>
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white shadow-2xs">
                          [{lookupPreview.batch || 'Batch'}]
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-slate-700">
                        <div>Attendance: <strong className="text-emerald-700 font-bold">{lookupPreview.attendance}</strong></div>
                        <div>CGPA: <strong className="text-slate-900 font-bold">{lookupPreview.cgpa}</strong></div>
                        <div className="truncate">Mentor: <strong className="text-indigo-700 font-bold">{lookupPreview.advisor}</strong></div>
                        <div className="truncate">Hostel: <strong className="text-slate-900 font-bold">{lookupPreview.hostelRoom}</strong></div>
                      </div>
                    </div>
                  )}

                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Your name, attendance, CGPA, advisor, and hostel room are fetched live according to this ID.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-blue-600 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all flex items-center justify-center space-x-2"
                >
                  <span>{isLoggingIn ? 'Fetching Details from Database...' : 'Fetch Details & Login'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

            </div>
          )}

          {/* ================= MODE 2: SIGN UP ================= */}
          {authMode === 'signup' && (
            <div className="space-y-4">

              {signupError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{signupError}</span>
                </div>
              )}

              {signupSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{signupSuccess}</span>
                </div>
              )}

              <form onSubmit={handleSignUp} className="space-y-3">

                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={signupForm.name}
                    onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                    placeholder="e.g. Thulasi Ravi"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-blue-600 focus:bg-white"
                    required
                  />
                </div>

                {/* ID Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {role === 'student' ? 'Student ID / Roll Number' : 'Staff Employee ID'} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={signupForm.id}
                    onChange={(e) => setSignupForm({ ...signupForm, id: e.target.value })}
                    placeholder={role === 'student' ? 'e.g. 721821IT045 or R210543' : 'e.g. EMP-IT-008'}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono uppercase focus:outline-hidden focus:border-blue-600 focus:bg-white placeholder:normal-case"
                    required
                  />

                  {signupLookup && (
                    <div className="mt-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-800 mb-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Found record for {signupLookup.name}!
                      </div>
                      <div className="text-[11px] text-emerald-700">
                        Attendance: <strong>{signupLookup.attendance}</strong> • CGPA: <strong>{signupLookup.cgpa}</strong> • Mentor: <strong>{signupLookup.advisor}</strong> • Room: <strong>{signupLookup.hostelRoom}</strong>
                      </div>
                    </div>
                  )}

                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    This ID will be used to log in and fetch your details later.
                  </span>
                </div>

                {/* Batch (For Student) */}
                {role === 'student' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Batch / Studying Year <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-6 gap-1.5">
                      {['P1', 'P2', 'E1', 'E2', 'E3', 'E4'].map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setSignupForm({ ...signupForm, batch: b })}
                          className={`py-1.5 rounded-lg text-xs font-bold transition-all border ${signupForm.batch === b
                            ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                            }`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Department */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Department / Branch <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={signupForm.department}
                    onChange={(e) => setSignupForm({ ...signupForm, department: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-blue-600 focus:bg-white"
                  >
                    <option value="Information Technology">Department of Information Technology</option>
                    <option value="Computer Science & Engineering">Computer Science & Engineering (CSE)</option>
                    <option value="Artificial Intelligence & Data Science">AI & Data Science (AI & DS)</option>
                    <option value="Electronics & Communication">Electronics & Communication (ECE)</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                    <option value="Pre-University Course (MPC)">Pre-University Course (P1/P2 MPC)</option>
                  </select>
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={signupForm.email}
                      onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                      placeholder="Id@rguktrkv.ac.in"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-blue-600 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={signupForm.phone}
                      onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value })}
                      placeholder="+91 98421 XXXXX"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-blue-600 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Set Account Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={signupForm.password}
                    onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                    placeholder="Create a password (or leave blank for password123)"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-blue-600 focus:bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSigningUp}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all flex items-center justify-center space-x-2 mt-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{isSigningUp ? 'Saving to Database...' : 'Complete Sign Up & Login'}</span>
                </button>
              </form>

            </div>
          )}

        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-4 text-xs text-slate-500">
        CampusConnect • Department of Information Technology, Rathinam Technical Campus, Coimbatore
      </div>

    </div>
  );
}
