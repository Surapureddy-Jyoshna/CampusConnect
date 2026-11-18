import React, { useState, useEffect } from 'react';
import {
  Bell,
  Plus,
  Search,
  Edit3,
  Trash2,
  CheckCircle,
  AlertCircle,
  Pin,
  Calendar,
  Send,
  Users,
  Layers,
  Sparkles
} from 'lucide-react';

const BATCH_OPTIONS = ['P1', 'P2', 'E1', 'E2', 'E3', 'E4'];

export default function AdminNoticesPanel() {
  const [notices, setNotices] = useState([]);
  const [filterBatch, setFilterBatch] = useState('all');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('exams');
  const [selectedBatches, setSelectedBatches] = useState(['E3']);
  const [isAllBatches, setIsAllBatches] = useState(false);
  const [priority, setPriority] = useState('normal');
  const [postedBy, setPostedBy] = useState('Dean Academics & Controller of Examinations');
  const [isPinned, setIsPinned] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchNotices = async () => {
    setIsLoading(true);
    try {
      const url = filterBatch === 'all'
        ? `/api/notices${search ? `?search=${encodeURIComponent(search)}` : ''}`
        : `/api/notices?batch=${filterBatch}${search ? `&search=${encodeURIComponent(search)}` : ''}`;
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
  }, [filterBatch, search]);

  const handleToggleBatch = (batch) => {
    if (isAllBatches) {
      setIsAllBatches(false);
      setSelectedBatches([batch]);
      return;
    }
    if (selectedBatches.includes(batch)) {
      if (selectedBatches.length > 1) {
        setSelectedBatches(selectedBatches.filter(b => b !== batch));
      }
    } else {
      setSelectedBatches([...selectedBatches, batch]);
    }
  };

  const handleToggleAllBatches = () => {
    setIsAllBatches(!isAllBatches);
    if (!isAllBatches) {
      setSelectedBatches(['All']);
    } else {
      setSelectedBatches(['E1', 'E2', 'E3', 'E4']);
    }
  };

  const handleOpenEdit = (n) => {
    setEditingId(n._id || n.id);
    setTitle(n.title);
    setContent(n.content);
    setCategory(n.category);
    if (n.targetBatches && n.targetBatches.includes('All')) {
      setIsAllBatches(true);
      setSelectedBatches(['All']);
    } else {
      setIsAllBatches(false);
      setSelectedBatches(n.targetBatches || ['E3']);
    }
    setPriority(n.priority || 'normal');
    setPostedBy(n.postedBy || 'Dean Academics');
    setIsPinned(Boolean(n.isPinned));
    setShowAddForm(true);
  };

  const handleResetForm = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
    setCategory('exams');
    setSelectedBatches(['E3']);
    setIsAllBatches(false);
    setPriority('normal');
    setIsPinned(false);
    setShowAddForm(false);
  };

  const handleSubmitNotice = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    setFeedback(null);

    const payload = {
      title: title.trim(),
      content: content.trim(),
      category,
      targetBatches: isAllBatches ? ['All'] : selectedBatches,
      priority,
      postedBy: postedBy.trim(),
      isPinned
    };

    try {
      const url = editingId ? `/api/notices/${editingId}` : '/api/notices';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        setFeedback({
          type: 'success',
          text: editingId ? 'Notice updated successfully in database!' : 'Notice published successfully to student batch feed!'
        });
        setTimeout(() => setFeedback(null), 3000);
        handleResetForm();
        fetchNotices();
      } else {
        setFeedback({ type: 'error', text: data.error || 'Failed to save notice.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, noticeTitle) => {
    if (!window.confirm(`Delete notice "${noticeTitle}"?`)) return;

    try {
      const res = await fetch(`/api/notices/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: 'success', text: 'Notice removed.' });
        setTimeout(() => setFeedback(null), 3000);
        fetchNotices();
      }
    } catch (e) {
      setFeedback({ type: 'error', text: 'Error deleting notice.' });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Action Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-7 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-500/20 px-2.5 py-0.5 rounded-full border border-blue-500/30">
            Batch-Wise Notice Publishing
          </span>
          <h2 className="text-2xl font-extrabold text-white mt-1">
            Publish Notices According to Student Batches
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Target circulars specifically to <strong>P1, P2, E1, E2, E3, E4</strong>, or all students.
            Students immediately see the notice on their dashboard and can ask the chatbot about it.
          </p>
        </div>

        <button
          onClick={() => {
            if (showAddForm) handleResetForm();
            else setShowAddForm(true);
          }}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center space-x-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? 'Close Form' : 'Publish New Notice'}</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-2xl border text-xs font-medium flex items-center space-x-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Form: Add or Edit Notice */}
      {showAddForm && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Bell className="w-4 h-4 text-blue-600" />
            <span>{editingId ? 'Edit Circular Notice' : 'Compose New Circular Notice'}</span>
          </h3>

          <form onSubmit={handleSubmitNotice} className="space-y-4">
            
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Notice Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. End Semester Exam Timetable & Practical Viva Guidelines"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:border-blue-600"
                required
              />
            </div>

            {/* Target Batch Selector (P1, P2, E1, E2, E3, E4, All) */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Target Student Batches <span className="text-rose-500">*</span>
              </label>
              
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleAllBatches}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                    isAllBatches
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  🌐 All Batches (Universal)
                </button>

                {!isAllBatches && BATCH_OPTIONS.map((batch) => {
                  const isSelected = selectedBatches.includes(batch);
                  return (
                    <button
                      key={batch}
                      type="button"
                      onClick={() => handleToggleBatch(batch)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {batch}
                    </button>
                  );
                })}
              </div>

              <span className="text-[11px] text-slate-500 mt-2 block">
                Selected audience: <strong className="text-blue-700">{isAllBatches ? 'All Batches (P1-E4)' : selectedBatches.join(', ')}</strong>
              </span>
            </div>

            {/* Category & Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:border-blue-600"
                >
                  <option value="exams">Exams & Schedules</option>
                  <option value="fee">Fee & Accounts</option>
                  <option value="academic">Academic & Syllabus</option>
                  <option value="placement">Training & Placements</option>
                  <option value="holidays">Holidays & Vacations</option>
                  <option value="general">General Campus Notice</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Notice Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:border-blue-600"
                >
                  <option value="normal">Normal</option>
                  <option value="important">Important (Highlighted)</option>
                  <option value="urgent">Urgent (Pulsing Red Banner)</option>
                </select>
              </div>
            </div>

            {/* Notice Body */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Notice Content / Body <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter circular details, deadlines, timings, and instructions for students..."
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:border-blue-600"
                required
              />
            </div>

            {/* Footer Options */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span>Pin notice to the top of student notice board</span>
              </label>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-all flex items-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Publishing...' : (editingId ? 'Update Notice' : 'Publish Notice')}</span>
                </button>
              </div>
            </div>

          </form>
        </div>
      )}

      {/* Notices Filtering & Table List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
        
        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          {/* Batch Filter Pills */}
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
              Filter:
            </span>
            {['all', ...BATCH_OPTIONS].map((b) => (
              <button
                key={b}
                onClick={() => setFilterBatch(b)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
                  filterBatch === b
                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                {b.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search circulars..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
            />
          </div>
        </div>

        {/* Notices Cards */}
        {isLoading ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            Loading batch notices...
          </div>
        ) : notices.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No notices found for this batch selection. Click <strong>Publish New Notice</strong> to add one.
          </div>
        ) : (
          <div className="space-y-3">
            {notices.map((n) => (
              <div
                key={n._id || n.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    {n.isPinned && (
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded border border-blue-200 flex items-center gap-0.5">
                        <Pin className="w-2.5 h-2.5" /> PINNED
                      </span>
                    )}
                    {n.priority === 'urgent' && (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded border border-rose-200 animate-pulse">
                        URGENT
                      </span>
                    )}
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-200 text-slate-700 px-2 py-0.2 rounded">
                      {n.category}
                    </span>
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.2 rounded font-mono">
                      Target: {(n.targetBatches || []).join(', ')}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                  <p className="text-[11px] text-slate-600 line-clamp-2">{n.content}</p>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => handleOpenEdit(n)}
                    className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-medium flex items-center gap-1 shadow-2xs"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(n._id || n.id, n.title)}
                    className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-rose-50 text-rose-600 text-xs font-medium shadow-2xs"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
}

