import React from 'react';
import {
  GraduationCap,
  ShieldCheck,
  Building,
  Mail,
  Phone,
  CheckCircle2,
  Calendar,
  BookOpen,
  Award,
  Users,
  Home
} from 'lucide-react';

export default function UserProfileBanner({ user }) {
  if (!user) return null;

  const isStudent = user.role === 'student';

  if (isStudent) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs mb-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

          {/* Left: Avatar & Identity */}
          <div className="flex items-start sm:items-center space-x-4">
            <div className={`w-14 h-14 rounded-2xl ${user.avatarBg || 'bg-blue-600'} text-white flex items-center justify-center text-lg font-extrabold shadow-md shrink-0`}>
              {user.avatar || 'ST'}
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                  {user.name}
                </h3>
                <span className="text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full border border-blue-200 font-mono">
                  {user.batch} Batch
                </span>
                <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  Enrolled & Active
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                <span className="font-mono text-slate-700 font-semibold">
                  Roll No: {user.id}
                </span>
                <span>•</span>
                <span>{user.degree || user.department}</span>
                <span>•</span>
                <span>{user.semester}</span>
              </div>
            </div>
          </div>

          {/* Right: Academic Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Attendance</span>
              <span className={`text-xs font-extrabold ${parseInt(user.attendance) >= 75 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {user.attendance || '88%'} {parseInt(user.attendance) >= 75 ? '(Eligible)' : '(Shortage)'}
              </span>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Academic CGPA</span>
              <span className="text-xs font-extrabold text-slate-800">{user.cgpa || '8.92'}</span>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Faculty Mentor</span>
              <span className="text-xs font-bold text-indigo-700 truncate block">{user.advisor || 'Assigned Mentor'}</span>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Hostel Room</span>
              <span className="text-xs font-bold text-slate-800 truncate block">{user.hostelRoom || 'GH2 / BH2'}</span>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // Admin Profile Banner
  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-5 text-white shadow-xl border border-slate-800 mb-5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

        {/* Left: Avatar & Identity */}
        <div className="flex items-start sm:items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-lg font-extrabold shadow-lg shadow-indigo-600/30 shrink-0">
            {user.avatar || 'AD'}
          </div>
          <div>
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <h3 className="text-base sm:text-lg font-extrabold text-white">
                {user.name}
              </h3>
              <span className="text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-1 font-mono">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Verified Staff Admin
              </span>
            </div>

            <p className="text-xs text-indigo-200 mt-0.5">
              {user.designation}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {user.department} • Staff ID: <strong className="text-slate-200 font-mono">{user.id}</strong>
            </p>
          </div>
        </div>

        {/* Right: Privilege Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs pt-3 lg:pt-0 border-t lg:border-t-0 border-white/10">
          <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Privileges</span>
            <span className="text-xs font-bold text-sky-400">Master Controller</span>
          </div>

          <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Managed Cohorts</span>
            <span className="text-xs font-bold text-emerald-400">P1, P2, E1-E4</span>
          </div>

          <div className="bg-white/5 p-2.5 rounded-xl border border-white/10 col-span-2 sm:col-span-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Office Desk</span>
            <span className="text-xs font-bold text-slate-200">{user.officeLocation || 'Admin Block Room 204'}</span>
          </div>
        </div>

      </div>
    </div>
  );
}

