import React, { useState, useEffect } from 'react';
import { X, Save, Sparkles, BookOpen, Tag, Calendar, AlertCircle, Users } from 'lucide-react';

const CATEGORIES = [
  { id: 'exams', label: '📅 Examinations & Timetable' },
  { id: 'fee', label: '💳 Tuition & Hostel Fees' },
  { id: 'holidays', label: '🌴 Holidays & Academic Vacation' },
  { id: 'academic', label: '📖 Academic & Syllabus' },
  { id: 'placement', label: '💼 Placements & Internships' },
  { id: 'facilities', label: '📚 Library & Campus Facilities' },
  { id: 'rules', label: '📋 Academic Rules & Attendance' },
  { id: 'general', label: '💬 General Campus FAQs' },
];

const BATCH_CHOICES = ['P1', 'P2', 'E1', 'E2', 'E3', 'E4'];

export default function EditModal({ isOpen, item, onClose, onSaveSuccess }) {
  const isEditing = Boolean(item && (item._id || item.id));

  const [formData, setFormData] = useState({
    title: '',
    category: 'exams',
    targetBatches: ['E3'],
    isAllBatches: false,
    queryPatterns: '',
    answer: '',
    tags: '',
    sourceDocument: 'College Official Notice Board / Handbook 2026'
  });

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (item) {
      const batches = item.targetBatches || ['All'];
      const allSelected = batches.includes('All');
      setFormData({
        title: item.title || '',
        category: item.category || 'exams',
        targetBatches: allSelected ? ['All'] : batches,
        isAllBatches: allSelected,
        queryPatterns: Array.isArray(item.queryPatterns) ? item.queryPatterns.join(', ') : (item.queryPatterns || ''),
        answer: item.answer || '',
        tags: Array.isArray(item.tags) ? item.tags.join(', ') : (item.tags || ''),
        sourceDocument: item.sourceDocument || 'College Official Notice Board / Handbook 2026'
      });
      setErrorMsg(null);
    } else {
      setFormData({
        title: '',
        category: 'exams',
        targetBatches: ['E3'],
        isAllBatches: false,
        queryPatterns: '',
        answer: '',
        tags: '',
        sourceDocument: 'College Official Notice Board / Handbook 2026'
      });
      setErrorMsg(null);
    }
  }, [item, isOpen]);

  if (!isOpen) return null;

  const handleToggleBatch = (batch) => {
    if (formData.isAllBatches) {
      setFormData({ ...formData, isAllBatches: false, targetBatches: [batch] });
      return;
    }
    const current = formData.targetBatches;
    if (current.includes(batch)) {
      if (current.length > 1) {
        setFormData({ ...formData, targetBatches: current.filter(b => b !== batch) });
      }
    } else {
      setFormData({ ...formData, targetBatches: [...current, batch] });
    }
  };

  const handleToggleAll = () => {
    const nextVal = !formData.isAllBatches;
    setFormData({
      ...formData,
      isAllBatches: nextVal,
      targetBatches: nextVal ? ['All'] : ['E1', 'E2', 'E3', 'E4']
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.answer.trim()) {
      setErrorMsg('Please enter both Title and Answer text.');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    const payload = {
      title: formData.title.trim(),
      category: formData.category,
      targetBatches: formData.isAllBatches ? ['All'] : formData.targetBatches,
      queryPatterns: formData.queryPatterns.split(',').map(s => s.trim()).filter(Boolean),
      answer: formData.answer.trim(),
      tags: formData.tags.split(',').map(s => s.trim()).filter(Boolean),
      sourceDocument: formData.sourceDocument.trim()
    };

    try {
      const url = isEditing
        ? `/api/knowledge/${item._id || item.id}`
        : '/api/knowledge';

      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        onSaveSuccess(isEditing ? 'Answer updated successfully!' : 'New answer created successfully!');
        onClose();
      } else {
        setErrorMsg(data.error || 'Failed to save changes.');
      }
    } catch (err) {
      setErrorMsg('Network error: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Save className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold">
                {isEditing ? 'Edit Chatbot Answer' : 'Add New Chatbot Answer'}
              </h3>
              <p className="text-xs text-slate-300">
                Changes update the database immediately and personalize answers by batch
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Question Title / Topic <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. End Semester Exam Timetable & Practical Viva"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              required
            />
          </div>

          {/* Batch Assignment (P1, P2, E1, E2, E3, E4, All) */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Target Student Batches <span className="text-rose-500">*</span>
            </label>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={handleToggleAll}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                  formData.isAllBatches
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                🌐 All Batches
              </button>
              {!formData.isAllBatches && BATCH_CHOICES.map(b => {
                const isSelected = formData.targetBatches.includes(b);
                return (
                  <button
                    key={b}
                    type="button"
                    onClick={() => handleToggleBatch(b)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {b}
                  </button>
                );
              })}
            </div>
            <span className="text-[11px] text-slate-500 mt-1.5 block">
              Audience: <strong className="text-blue-700">{formData.isAllBatches ? 'All Batches (P1-E4)' : formData.targetBatches.join(', ')}</strong>
            </span>
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:border-blue-600"
            >
              {CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Query Triggers */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Query Patterns & Search Triggers (comma separated)
            </label>
            <input
              type="text"
              value={formData.queryPatterns}
              onChange={(e) => setFormData({ ...formData, queryPatterns: e.target.value })}
              placeholder="e.g. when are exams, exam schedule, timetable, semester exam dates"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:border-blue-600"
            />
          </div>

          {/* Answer Content */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Chatbot Answer Content (Markdown Supported) <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={6}
              value={formData.answer}
              onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
              placeholder="Enter official answer text (dates, timings, fees, rules)..."
              className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-slate-300 focus:outline-hidden focus:border-blue-600"
              required
            />
          </div>

          {/* Source Document Citation */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Official Source Citation
            </label>
            <input
              type="text"
              value={formData.sourceDocument}
              onChange={(e) => setFormData({ ...formData, sourceDocument: e.target.value })}
              placeholder="e.g. Office of Controller of Examinations Circular COE/2026/04"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:border-blue-600"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 text-xs font-semibold hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-all flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : (isEditing ? 'Save & Update' : 'Create Answer')}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
