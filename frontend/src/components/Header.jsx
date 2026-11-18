import React, { useState } from 'react';
import {
  Bot,
  Database,
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  LogOut,
  User,
  ChevronDown
} from 'lucide-react';

export default function Header({
  currentUser,
  onLogout,
  currentRole,
  setCurrentRole,
  currentBatch,
  health,
  onOpenDbModal
}) {
  const isConnected = health?.mongoAtlas?.connected;
  const isStudent = currentUser?.role === 'student';

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Subtitle */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
              <Bot className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-1.5">
                  CampusConnect
                  <span className="text-[10px] uppercase font-bold tracking-widest bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                    RAG-AI
                  </span>
                </h1>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Batch-Personalized College Retrieval System (P1, P2, E1, E2, E3, E4)
              </p>
            </div>
          </div>

          {/* Center: Logged-in User Badge or Portal Toggle */}
          <div className="hidden md:flex items-center space-x-2">
            <div className="flex items-center space-x-2.5 px-3.5 py-1.5 rounded-2xl bg-slate-100 border border-slate-200">
              <div className={`w-7 h-7 rounded-xl ${currentUser?.avatarBg || 'bg-blue-600'} text-white flex items-center justify-center text-xs font-bold`}>
                {currentUser?.avatar || (isStudent ? 'ST' : 'AD')}
              </div>
              <div className="text-left">
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-bold text-slate-800">
                    {currentUser?.name || 'User'}
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-white text-blue-700 px-1.5 py-0.2 rounded border border-slate-200">
                    {isStudent ? `${currentUser?.batch} Student` : 'Staff Admin'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 block truncate max-w-[200px]">
                  ID: {currentUser?.id}
                </span>
              </div>
            </div>
          </div>

          {/* Right Controls: Logout */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Logout Button */}
            <button
              onClick={onLogout}
              title="Logout of current session"
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors shadow-2xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
