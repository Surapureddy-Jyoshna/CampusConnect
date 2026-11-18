import React, { useState, useEffect } from 'react';
import {
  Bell,
  Search,
  Pin,
  Calendar,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Filter,
  RefreshCw,
  Tag
} from 'lucide-react';

const CATEGORY_COLORS = {
  exams: 'bg-purple-100 text-purple-800 border-purple-200',
  fee: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  holidays: 'bg-amber-100 text-amber-800 border-amber-200',
  placement: 'bg-rose-100 text-rose-800 border-rose-200',
  academic: 'bg-blue-100 text-blue-800 border-blue-200',
  general: 'bg-slate-100 text-slate-700 border-slate-200'
};

export default function NoticeBoard({ currentBatch, onAskAboutNotice }) {
  const [notices, setNotices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const fetchNotices = async () => {
    setIsLoading(true);
    try {
      const url = `/api/notices?batch=${currentBatch}${selectedCategory !== 'all' ? `&category=${selectedCategory}` : ''}${search ? `&search=${encodeURIComponent(search)}` : ''}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setNotices(data.data || []);
      }
    } catch (e) {
      console.error('Error fetching notices:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, [currentBatch, selectedCategory, search]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[calc(100vh-10rem)] overflow-hidden">
      
      {/* Header */}
      <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-t-2xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center border border-blue-400/30">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">Batch Notice Board</h3>
              <p className="text-[11px] text-slate-300">
                Official circulars for <span className="text-blue-300 font-bold uppercase">{currentBatch} Batch</span>
              </p>
            </div>
          </div>
          <button
            onClick={fetchNotices}
            title="Refresh Notices"
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Search */}
        <div className="relative mt-2">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search circulars, exams, fees..."
            className="w-full pl-8 pr-3 py-1.5 bg-white/10 text-xs text-white placeholder-slate-400 rounded-xl border border-white/10 focus:outline-hidden focus:bg-white/20 transition-all"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center space-x-1 overflow-x-auto scrollbar-none">
        {['all', 'exams', 'fee', 'academic', 'placement', 'holidays'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`whitespace-nowrap px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Notices Scroll List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {isLoading ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-500" />
            Loading notices for {currentBatch}...
          </div>
        ) : notices.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs p-4">
            <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            No new notices found for {currentBatch} in this category.
          </div>
        ) : (
          notices.map((notice) => {
            const isUrgent = notice.priority === 'urgent';
            const isImportant = notice.priority === 'important';

            return (
              <div
                key={notice._id || notice.id}
                className={`p-3.5 rounded-xl border transition-all text-xs relative ${
                  isUrgent
                    ? 'bg-rose-50/60 border-rose-200 shadow-2xs'
                    : isImportant
                    ? 'bg-amber-50/60 border-amber-200 shadow-2xs'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                }`}
              >
                {/* Notice Top Meta */}
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                    {notice.isPinned && (
                      <span className="flex items-center gap-0.5 text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded border border-blue-200">
                        <Pin className="w-2.5 h-2.5" /> PINNED
                      </span>
                    )}
                    {isUrgent && (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded border border-rose-200 animate-pulse">
                        URGENT
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                        CATEGORY_COLORS[notice.category] || CATEGORY_COLORS.general
                      }`}
                    >
                      {notice.category}
                    </span>
                    {notice.targetBatches && (
                      <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                        Batch: {notice.targetBatches.join(', ')}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">
                    {new Date(notice.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                </div>

                {/* Title */}
                <h4 className="font-bold text-slate-900 text-xs leading-snug mb-1">
                  {notice.title}
                </h4>

                {/* Content */}
                <p className="text-slate-600 text-[11px] leading-relaxed mb-2.5">
                  {notice.content}
                </p>

                {/* Footer & Ask Bot button */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[10px] text-slate-400">
                  <span className="truncate max-w-[150px]">By: {notice.postedBy}</span>
                  <button
                    onClick={() => onAskAboutNotice(notice)}
                    className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 hover:underline"
                  >
                    <span>Ask Chatbot</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}

