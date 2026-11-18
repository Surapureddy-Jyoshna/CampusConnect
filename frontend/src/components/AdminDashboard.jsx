import React, { useState } from 'react';
import AdminNoticesPanel from './AdminNoticesPanel.jsx';
import AdminKnowledgePanel from './AdminKnowledgePanel.jsx';
import DocumentManager from './DocumentManager.jsx';
import UserProfileBanner from './UserProfileBanner.jsx';
import { Bell, BookOpen, Layers, Settings, Sparkles } from 'lucide-react';

export default function AdminDashboard({ currentUser, onTestQuery, onOpenEditModal, onAddNew }) {
  const [adminTab, setAdminTab] = useState('notices'); // 'notices' | 'knowledge' | 'docs'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
      
      {/* Logged-In Admin Profile Details Banner */}
      <UserProfileBanner user={currentUser} />

      {/* Admin Tab Switcher */}
      <div className="flex items-center space-x-2 bg-slate-200/70 p-1.5 rounded-2xl w-fit mb-6 border border-slate-300/60 shadow-2xs">
        <button
          onClick={() => setAdminTab('notices')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            adminTab === 'notices'
              ? 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Bell className="w-4 h-4 text-blue-600" />
          <span>Batch Notices Publisher</span>
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
        </button>

        <button
          onClick={() => setAdminTab('knowledge')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            adminTab === 'knowledge'
              ? 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4 text-indigo-600" />
          <span>Batch Answers & FAQs</span>
        </button>

        <button
          onClick={() => setAdminTab('docs')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            adminTab === 'docs'
              ? 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4 text-sky-600" />
          <span>RAG Document Chunks</span>
        </button>
      </div>

      {/* Admin Tab Content */}
      {adminTab === 'notices' && (
        <AdminNoticesPanel />
      )}

      {adminTab === 'knowledge' && (
        <AdminKnowledgePanel
          onTestQuery={onTestQuery}
          onOpenEditModal={onOpenEditModal}
          onAddNew={onAddNew}
        />
      )}

      {adminTab === 'docs' && (
        <DocumentManager />
      )}

    </div>
  );
}
