import React, { useState, useEffect } from 'react';
import { UploadCloud, FileText, CheckCircle, RefreshCw, Layers, Search, Sparkles } from 'lucide-react';

export default function DocumentManager() {
  const [chunks, setChunks] = useState([]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('general');
  const [textContent, setTextContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  const fetchChunks = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/documents');
      const data = await res.json();
      if (data.success) {
        setChunks(data.data || []);
      }
    } catch (e) {
      console.error('Error fetching document chunks:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChunks();
  }, []);

  const handleIngest = async (e) => {
    e.preventDefault();
    if (!title.trim() || !textContent.trim()) return;

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/documents/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          category,
          text: textContent.trim(),
          docType: 'text'
        })
      });

      const data = await res.json();
      if (data.success) {
        setFeedback({ type: 'success', text: data.message });
        setTitle('');
        setTextContent('');
        fetchChunks();
      } else {
        setFeedback({ type: 'error', text: data.error || 'Failed to ingest document.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Institutional Document Ingestion & RAG Chunks
            </h2>
            <p className="text-xs text-slate-500">
              Corresponds to Research Paper Section 3.2 (Data Acquisition) & Section 4.2 (Segmentation & Vectorization)
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Ingest Form */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs h-fit">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <UploadCloud className="w-4 h-4 text-blue-600" />
            Ingest New Institutional Notice / Manual
          </h3>

          {feedback && (
            <div
              className={`p-3 rounded-xl mb-4 text-xs font-medium border ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              {feedback.text}
            </div>
          )}

          <form onSubmit={handleIngest} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Document Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Academic Regulation Manual 2026"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:border-blue-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:border-blue-600"
              >
                <option value="general">General Institutional</option>
                <option value="exams">Exams & Regulations</option>
                <option value="fee">Fee & Finance</option>
                <option value="holidays">Academic Calendar</option>
                <option value="facilities">Campus Infrastructure</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Raw Text Content (Auto-Segmented)
              </label>
              <textarea
                rows={8}
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Paste institutional circular text, rules, or syllabus content here. The system will automatically clean, normalize, and segment it into vector chunks..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono focus:outline-hidden focus:border-blue-600"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs shadow-md shadow-blue-600/20 transition-all flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? 'Segmenting & Vectorizing...' : 'Ingest & Chunk Document'}</span>
            </button>
          </form>
        </div>

        {/* Indexed Chunks List */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Segmented RAG Document Chunks ({chunks.length})
              </h3>
              <p className="text-xs text-slate-400">
                Chunks stored in MongoDB Atlas for TF-IDF & Cosine Similarity vector search
              </p>
            </div>
            <button
              onClick={fetchChunks}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Loading document chunks...
            </div>
          ) : chunks.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl p-8">
              No custom document chunks ingested yet. You can paste institutional notices or handbook pages above to test custom document vector retrieval!
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {chunks.map((chunk, idx) => (
                <div
                  key={chunk._id || idx}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-blue-500" />
                      {chunk.docTitle} (Chunk #{chunk.chunkIndex + 1})
                    </span>
                    <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono">
                      {chunk.category}
                    </span>
                  </div>
                  <p className="text-slate-700 line-clamp-3 font-mono text-[11px] bg-white p-2.5 rounded-lg border border-slate-100">
                    {chunk.content}
                  </p>
                </div>
              ))}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}

