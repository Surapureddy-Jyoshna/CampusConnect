import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  RefreshCw,
  Sparkles,
  Tag,
  Clock,
  Calendar,
  DollarSign,
  Coffee,
  GraduationCap,
  FileText,
  CheckCircle,
  HelpCircle,
  Send,
  AlertCircle,
  Users
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const BATCH_FILTERS = ['all', 'P1', 'P2', 'E1', 'E2', 'E3', 'E4'];

const CATEGORIES = [
  { id: 'all', label: 'All Categories', icon: Sparkles },
  { id: 'exams', label: 'Exams & Schedules', icon: Calendar, color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { id: 'fee', label: 'Fee & Accounts', icon: DollarSign, color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { id: 'holidays', label: 'Holidays & Vacation', icon: Coffee, color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { id: 'placement', label: 'Placements & Internships', icon: GraduationCap, color: 'bg-rose-100 text-rose-700 border-rose-200' },
  { id: 'facilities', label: 'Library & Facilities', icon: Coffee, color: 'bg-sky-100 text-sky-700 border-sky-200' },
  { id: 'rules', label: 'Rules & Attendance', icon: FileText, color: 'bg-slate-100 text-slate-700 border-slate-200' },
];

export default function AdminKnowledgePanel({ onTestQuery, onOpenEditModal, onAddNew }) {
  const [items, setItems] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState(null);

  const fetchKnowledge = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedBatch !== 'all') params.append('batch', selectedBatch);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);

      const res = await fetch(`/api/knowledge?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setItems(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching knowledge:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKnowledge();
  }, [selectedBatch, selectedCategory, searchQuery]);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const res = await fetch(`/api/knowledge/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({ type: 'success', text: `Deleted "${title}" successfully.` });
        setTimeout(() => setStatusMessage(null), 3000);
        fetchKnowledge();
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Failed to delete item.' });
    }
  };

  const handleResetToDefault = async () => {
    if (!window.confirm('Reset all answers & batch notices to default institutional data? Any custom edits will be restored to defaults.')) {
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch('/api/knowledge/reset', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({ type: 'success', text: 'Knowledge and notices reset to defaults.' });
        setTimeout(() => setStatusMessage(null), 3000);
        fetchKnowledge();
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Error resetting data.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-500/20 px-2.5 py-0.5 rounded-full border border-blue-500/30">
            Batch-Wise Knowledge Base
          </span>
          <h2 className="text-2xl font-extrabold text-white mt-1">
            Manage & Edit Answers by Student Batch
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Edit exam dates, fee amounts, and holiday schedules for each year (<strong>P1, P2, E1, E2, E3, E4</strong>).
            When a student queries the chatbot, their response is immediately updated.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleResetToDefault}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors flex items-center space-x-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          <button
            onClick={onAddNew}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Answer</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-3.5 rounded-2xl border text-xs font-medium flex items-center space-x-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {statusMessage.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Dual Filter Controls: Batch Pills & Category Dropdown & Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        
        {/* Batch Filter Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 whitespace-nowrap">
            Filter by Year / Batch:
          </span>
          {BATCH_FILTERS.map((b) => (
            <button
              key={b}
              onClick={() => setSelectedBatch(b)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                selectedBatch === b
                  ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              {b.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Secondary Category & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`whitespace-nowrap px-3 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search answers..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
            />
          </div>
        </div>

      </div>

      {/* Grid of Knowledge Cards */}
      {isLoading ? (
        <div className="py-12 text-center text-slate-400 text-xs">
          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-500" />
          Loading knowledge records...
        </div>
      ) : items.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200 p-8">
          No knowledge entries found for this batch/category filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => {
            const id = item._id || item.id;
            const targetBatches = item.targetBatches || ['All'];

            return (
              <div
                key={id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
              >
                <div className="p-4 border-b border-slate-100">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                        {item.category}
                      </span>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded font-mono">
                        Batch: {targetBatches.join(', ')}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(item.lastUpdated || Date.now()).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-900">{item.title}</h3>

                  {item.queryPatterns && item.queryPatterns.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {item.queryPatterns.slice(0, 3).map((p, idx) => (
                        <span key={idx} className="bg-slate-50 text-slate-600 border border-slate-200 text-[10px] px-1.5 py-0.2 rounded font-mono">
                          "{p}"
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-4 flex-1 bg-slate-50/50">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Answer Preview:
                  </span>
                  <div className="text-[11px] text-slate-700 line-clamp-3 prose prose-xs max-w-none">
                    <ReactMarkdown>{item.answer}</ReactMarkdown>
                  </div>
                </div>

                <div className="px-4 py-2.5 bg-white border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onTestQuery(item.queryPatterns?.[0] || item.title, targetBatches[0] || 'E3')}
                    title="Test how chatbot responds with this batch context"
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 transition-colors flex items-center gap-1"
                  >
                    <Send className="w-3 h-3" />
                    <span>Test in Chat</span>
                  </button>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => onOpenEditModal(item)}
                      className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-blue-600 text-white text-[11px] font-semibold transition-colors flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit Answer</span>
                    </button>
                    <button
                      onClick={() => handleDelete(id, item.title)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
