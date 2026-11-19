import React, { useState } from 'react';
import {
  Bot, GraduationCap, BookOpen, Bell, Users, Phone, Mail,
  MapPin, ChevronRight, Calendar, FileText, Award, Building2,
  Microscope, Cpu, FlaskConical, Globe, Menu, X, ExternalLink,
  LogIn, UserPlus, Clock, Shield, ArrowRight
} from 'lucide-react';

const NAV_LINKS = [
  { label: 'About', href: '#about' },
  { label: 'Academics', href: '#academics' },
  { label: 'Departments', href: '#departments' },
  { label: 'Admissions', href: '#admissions' },
  { label: 'Placements', href: '#placements' },
  { label: 'Contact', href: '#contact' },
];

const ANNOUNCEMENTS = [
  { tag: 'EXAM', date: 'Nov 10, 2026', title: 'E4 Fast-Track Semester Examinations Schedule Released', desc: 'The end-semester theory examinations for E4 batch will commence from December 2026. Hall tickets available on ERP portal.' },
  { tag: 'PLACEMENT', date: 'Nov 7, 2026', title: 'Campus Recruitment Drive — TCS, Infosys & Wipro', desc: 'On-campus placement drives scheduled for January 2027. Eligible E4 students must register via ERP portal by December 20.' },
  { tag: 'FEE', date: 'Nov 5, 2026', title: 'Last Date for Tuition Fee Payment — Semester VII', desc: 'Students are informed that the last date for fee payment without fine is November 30, 2026. Contact Accounts section for details.' },
  { tag: 'HOLIDAY', date: 'Nov 3, 2026', title: 'Diwali & Pongal Holiday Notification — 2026-27', desc: 'Campus will remain closed from November 6–10. Winter vacation: December 19 – January 4. Classes resume January 5, 2027.' },
  { tag: 'ACADEMIC', date: 'Oct 28, 2026', title: 'Major Project Phase-II Submission Deadline', desc: 'E4 students must submit their Major Project reports to respective department offices before November 25, 2026.' },
];

const DEPARTMENTS = [
  { icon: Cpu, name: 'Computer Science & Engineering', short: 'CSE', intake: '120' },
  { icon: Microscope, name: 'Electronics & Communication Engg.', short: 'ECE', intake: '120' },
  { icon: FlaskConical, name: 'Electrical & Electronics Engg.', short: 'EEE', intake: '60' },
  { icon: Building2, name: 'Mechanical Engineering', short: 'MECH', intake: '60' },
  { icon: Globe, name: 'Civil Engineering', short: 'CIVIL', intake: '60' },
  { icon: FlaskConical, name: 'Chemical Engineering', short: 'CHEM', intake: '60' },
];

const QUICK_LINKS = [
  { icon: LogIn, label: 'Student Portal', desc: 'Login to your personalized dashboard', action: 'student' },
  { icon: GraduationCap, label: 'Academic & Fee Records', desc: 'Verify attendance, CGPA & semester fees', action: 'student' },
  { icon: Shield, label: 'Admin Portal', desc: 'Faculty & administrative staff login', action: 'admin' },
  { icon: Bell, label: 'Notice Board', desc: 'Official batch circulars & notifications', action: 'notices' },
];

const STATS = [
  { value: '2500+', label: 'Students Enrolled', icon: GraduationCap },
  { value: '120+', label: 'Faculty Members', icon: Users },
  { value: '6', label: 'Engineering Departments', icon: Building2 },
  { value: '95%', label: 'Placement Rate', icon: Award },
];

export default function HomePage({ onGetStarted }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleQuickLink = (action) => {
    if (action === 'admin') onGetStarted('admin');
    else onGetStarted('student');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-['Plus_Jakarta_Sans',sans-serif] text-slate-800">

      {/* ── TOP UTILITY BAR ── */}
      <div className="bg-[#0b162c] text-slate-300 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center justify-between text-xs">
            <div className="hidden sm:flex items-center space-x-6">
              <span className="flex items-center space-x-2 text-slate-400">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>+91-8520-252524</span>
              </span>
              <span className="flex items-center space-x-2 text-slate-400">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>director@rguktrkv.ac.in</span>
              </span>
              <span className="flex items-center space-x-2 text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>RK Valley, Idupulapaya, YSR Kadapa Dt., A.P.</span>
              </span>
            </div>
            <div className="flex items-center space-x-5 text-slate-400">
              <a href="#" className="hover:text-white transition-colors flex items-center space-x-1.5">
                <Globe className="w-3.5 h-3.5" />
                <span>RGUKT Main</span>
              </a>
              <span className="text-slate-700">|</span>
              <a href="#" className="hover:text-white transition-colors">ERP Portal</a>
              <span className="text-slate-700">|</span>
              <a href="#" className="hover:text-white transition-colors">NAAC</a>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN NAVBAR ── */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">

            {/* Logo + University Title */}
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0f2042] to-[#1e3a8a] flex items-center justify-center text-white shadow-sm shrink-0 border border-slate-200">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-black text-slate-900 tracking-tight leading-tight">
                  RGUKT RK Valley
                </h1>
                <p className="text-xs text-slate-600 font-medium leading-tight">
                  Rajiv Gandhi University of Knowledge Technologies
                </p>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Idupulapaya, YSR Kadapa Dist., Andhra Pradesh
                </p>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-7">
              {NAV_LINKS.map(link => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm font-semibold text-slate-700 hover:text-blue-700 transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Primary Action Button */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => onGetStarted('student')}
                className="hidden sm:flex items-center space-x-2 px-5 py-2.5 bg-[#0f2042] hover:bg-[#1a3468] text-white text-xs font-bold rounded-lg transition-colors shadow-2xs"
              >
                <LogIn className="w-4 h-4" />
                <span>Student Login</span>
              </button>
              <button
                className="lg:hidden p-2 text-slate-600 hover:text-slate-900"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Dropdown */}
        {menuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2">
            {NAV_LINKS.map(link => (
              <a key={link.label} href={link.href} className="block py-2 text-sm font-semibold text-slate-700 hover:text-blue-700" onClick={() => setMenuOpen(false)}>
                {link.label}
              </a>
            ))}
            <div className="pt-2 border-t border-slate-200 flex flex-col gap-2">
              <button onClick={() => onGetStarted('student')} className="w-full py-2.5 bg-[#0f2042] text-white text-xs font-bold rounded-lg">Student Login</button>
              <button onClick={() => onGetStarted('admin')} className="w-full py-2.5 border border-slate-300 text-slate-700 text-xs font-bold rounded-lg">Admin / Faculty Login</button>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO SECTION ── */}
      <section className="relative bg-[#0d1a33] text-white overflow-hidden border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

            {/* Left: University Overview (7 cols) */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center space-x-2 bg-blue-950/70 border border-blue-500/30 rounded-full px-3.5 py-1 mb-5">
                <Award className="w-3.5 h-3.5 text-blue-300" />
                <span className="text-xs font-semibold text-blue-200 tracking-wide">
                  NAAC Accredited · Government of Andhra Pradesh
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight mb-5">
                Shaping Engineers,{' '}
                <span className="text-blue-400">Transforming</span>{' '}
                Futures
              </h2>

              <p className="text-slate-300 text-base leading-relaxed mb-6 max-w-xl">
                RGUKT RK Valley is a premier residential engineering university established by the Government of Andhra Pradesh, offering integrated 6-year B.Tech programs dedicated to academic excellence and rural empowerment.
              </p>

              {/* Badges */}
              <div className="flex flex-wrap gap-2.5 mb-8">
                {[
                  '6-Year Integrated B.Tech',
                  'Fully Residential Campus',
                  '100% State Govt. Funded',
                  'Merit-Based Admissions'
                ].map(tag => (
                  <span key={tag} className="text-xs px-3 py-1 bg-slate-800/80 border border-slate-700 text-slate-300 font-medium rounded-md">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => onGetStarted('student')}
                  className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors shadow-sm text-sm"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Student Portal Login</span>
                </button>
                <button
                  onClick={() => onGetStarted('admin')}
                  className="flex items-center justify-center space-x-2 px-6 py-3 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-white font-semibold rounded-lg transition-colors text-sm"
                >
                  <Shield className="w-4 h-4 text-indigo-400" />
                  <span>Admin & Faculty Login</span>
                </button>
              </div>
            </div>

            {/* Right: Clean Professional Portal Card (5 cols) */}
            <div className="lg:col-span-5">
              <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-6 shadow-xl backdrop-blur-xs">
                
                {/* Header */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white leading-tight">CampusConnect Portal</p>
                      <p className="text-[11px] text-slate-400">Student & Academic Information System</p>
                    </div>
                  </div>
                  <span className="flex items-center space-x-1.5 text-[11px] text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Live Portal</span>
                  </span>
                </div>

                {/* Quick Access Menu - Unified Professional Design */}
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                  Quick Access
                </p>
                
                <div className="space-y-2">
                  {QUICK_LINKS.map((link) => (
                    <button
                      key={link.label}
                      onClick={() => handleQuickLink(link.action)}
                      className="w-full flex items-center space-x-3 p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/70 hover:border-blue-500/50 transition-all text-left group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#0d1a33] border border-slate-700 flex items-center justify-center text-blue-400 group-hover:text-blue-300 group-hover:border-blue-500/40 shrink-0 transition-colors">
                        <link.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors leading-tight">
                          {link.label}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate leading-tight mt-0.5">
                          {link.desc}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
                    </button>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>RAG-AI Knowledge Engine</span>
                  <span className="text-slate-500">•</span>
                  <span>Batch-Personalized</span>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── STATS BAR (CLEAN CORPORATE DESIGN) ── */}
      <div className="bg-white border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((s, i) => (
              <div key={i} className="flex items-center space-x-3.5">
                <div className="w-11 h-11 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center shrink-0">
                  <s.icon className="w-5 h-5 text-slate-700" />
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900 tracking-tight leading-tight">{s.value}</p>
                  <p className="text-xs text-slate-500 font-medium leading-tight">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT: NOTICES + SIDEBAR ── */}
      <section className="py-12 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* ── OFFICIAL ANNOUNCEMENTS (8 cols) ── */}
            <div className="lg:col-span-8">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center space-x-2.5">
                  <div className="w-1 h-6 bg-[#0f2042] rounded-full" />
                  <h2 className="text-lg font-extrabold text-slate-900">Official Circulars & Notices</h2>
                </div>
                <button
                  onClick={() => onGetStarted('signin')}
                  className="text-xs text-blue-700 font-semibold flex items-center space-x-1 hover:underline"
                >
                  <span>View All Notices</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-2.5">
                {ANNOUNCEMENTS.map((item, i) => (
                  <div
                    key={i}
                    className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 hover:shadow-2xs transition-all cursor-default group"
                  >
                    <div className="flex items-start space-x-3.5">
                      <div className="shrink-0 mt-0.5">
                        <span className="inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                          {item.tag}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors leading-snug">
                          {item.title}
                        </p>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-2">
                          {item.desc}
                        </p>
                        <div className="flex items-center space-x-1.5 mt-2 text-[11px] text-slate-400">
                          <Clock className="w-3 h-3" />
                          <span>{item.date}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => onGetStarted('signin')}
                className="mt-4 w-full py-2.5 border border-slate-300 hover:border-slate-400 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white rounded-xl transition-all shadow-2xs"
              >
                Sign in to view batch-specific circulars & archives →
              </button>
            </div>

            {/* ── SIDEBAR (4 cols) ── */}
            <div className="lg:col-span-4 space-y-5">

              {/* About University */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <div className="bg-[#0f2042] px-4 py-3">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                    <BookOpen className="w-4 h-4 text-blue-300" />
                    <span>About RGUKT RKV</span>
                  </h3>
                </div>
                <div className="p-4 text-xs text-slate-600 leading-relaxed">
                  <p className="mb-3">
                    Established in 2008 by the Government of Andhra Pradesh, RGUKT RK Valley is an autonomous residential state university offering 6-year integrated B.Tech programs.
                  </p>
                  <ul className="space-y-1.5 text-slate-700">
                    {[
                      'Fully residential academic environment',
                      'Located in YSR Kadapa District, A.P.',
                      '6-Year Integrated B.Tech Curricula',
                      '100% State Government Funding',
                      'Accredited by NAAC'
                    ].map((item, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Quick Academic Links */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <div className="bg-[#0f2042] px-4 py-3">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-blue-300" />
                    <span>Academic Portals</span>
                  </h3>
                </div>
                <div className="divide-y divide-slate-100 text-xs">
                  {[
                    { label: 'Student Academic Portal (ERP)', action: 'signin' },
                    { label: 'Fee Payment & No-Dues Desk', action: 'signin' },
                    { label: 'End-Semester Exam Schedules', action: 'signin' },
                    { label: 'Hostel Allocation & Room In-Time', action: 'signin' },
                    { label: 'Training & Placement Cell', action: 'signin' },
                    { label: 'Faculty Advisor Consultation', action: 'signin' },
                  ].map((link, i) => (
                    <button
                      key={i}
                      onClick={() => onGetStarted(link.action)}
                      className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 transition-colors text-left group"
                    >
                      <span className="font-medium text-slate-700 group-hover:text-blue-700">{link.label}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                    </button>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ── ACADEMIC DEPARTMENTS ── */}
      <section id="departments" className="py-12 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2.5 mb-6">
            <div className="w-1 h-6 bg-blue-600 rounded-full" />
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Academic Departments</h2>
              <p className="text-xs text-slate-500">6-Year Integrated B.Tech Programs</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {DEPARTMENTS.map((dept, i) => (
              <div
                key={i}
                className="flex items-center space-x-3.5 p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-2xs transition-all cursor-default"
              >
                <div className="w-11 h-11 bg-white border border-slate-200 rounded-xl flex items-center justify-center shrink-0">
                  <dept.icon className="w-5 h-5 text-slate-700" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-900">{dept.short}</p>
                  <p className="text-xs text-slate-600 font-medium leading-tight">{dept.name}</p>
                  <p className="text-[11px] text-slate-400 mt-1">Annual Intake: <span className="font-semibold text-slate-600">{dept.intake} seats</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#0b162c] text-white border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">

            {/* University Details */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-white text-sm">RGUKT RK Valley</p>
                  <p className="text-xs text-slate-400">Rajiv Gandhi University of Knowledge Technologies</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                A residential engineering university established by the Government of Andhra Pradesh for rural youth empowerment. NAAC Accredited.
              </p>
              <div className="mt-4 space-y-1.5 text-xs text-slate-400">
                <div className="flex items-center space-x-2"><MapPin className="w-3.5 h-3.5 text-slate-500" /><span>RK Valley, Idupulapaya, YSR Kadapa Dt., A.P. — 516330</span></div>
                <div className="flex items-center space-x-2"><Phone className="w-3.5 h-3.5 text-slate-500" /><span>+91-8520-252524</span></div>
                <div className="flex items-center space-x-2"><Mail className="w-3.5 h-3.5 text-slate-500" /><span>director@rguktrkv.ac.in</span></div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">Student Portal</h4>
              <ul className="space-y-2 text-xs">
                {['Student Login', 'New Registration', 'Exam Schedule', 'Fee Details', 'Hostel Info', 'Placements'].map(l => (
                  <li key={l}>
                    <button onClick={() => onGetStarted('signin')} className="text-slate-400 hover:text-white transition-colors flex items-center space-x-1.5">
                      <ChevronRight className="w-3 h-3 text-slate-600" />
                      <span>{l}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Departments */}
            <div>
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">Departments</h4>
              <ul className="space-y-2 text-xs">
                {['Computer Science & Engg.', 'Electronics & Comm. Engg.', 'Electrical & Electronics', 'Mechanical Engineering', 'Civil Engineering', 'Chemical Engineering'].map(l => (
                  <li key={l}>
                    <a href="#departments" className="text-slate-400 hover:text-white transition-colors flex items-center space-x-1.5">
                      <ChevronRight className="w-3 h-3 text-slate-600" />
                      <span>{l}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <p>© 2026 RGUKT RK Valley. All rights reserved.</p>
            <div className="flex items-center space-x-2">
              <Bot className="w-3.5 h-3.5 text-blue-400" />
              <span>CampusConnect AI Information System</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
