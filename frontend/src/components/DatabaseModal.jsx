import React, { useState } from 'react';
import { X, Database, CheckCircle2, AlertTriangle, ExternalLink, RefreshCw, Copy, Check } from 'lucide-react';

export default function DatabaseModal({ isOpen, onClose, health, onRefreshHealth }) {
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!isOpen) return null;

  const isConnected = health?.mongoAtlas?.connected;
  const ip = '157.50.79.37';

  const handleCopyIp = () => {
    navigator.clipboard.writeText(ip);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestNow = async () => {
    setIsRefreshing(true);
    await onRefreshHealth();
    setIsRefreshing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${isConnected ? 'bg-emerald-600' : 'bg-amber-600'}`}>
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold">MongoDB Atlas Database Diagnostics</h3>
              <p className="text-xs text-slate-300">Cluster: ac-eqihok6.0rh3oem.mongodb.net</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          
          {/* Status Alert */}
          <div
            className={`p-4 rounded-2xl border flex items-start space-x-3 text-xs ${
              isConnected
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            {isConnected ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div>
              <span className="font-bold block text-sm">
                {isConnected ? 'MongoDB Atlas is Connected & Synced!' : 'Operating in Persistent Local Sync Mode'}
              </span>
              <p className="mt-1 text-slate-600">
                {isConnected
                  ? 'All chatbot queries, answers, and document chunks are directly stored and synchronized with your MongoDB Atlas replica set.'
                  : 'The backend has initialized all questions, exams, fees, and holiday records. You can add or edit answers right now, and they will persist! To link directly to MongoDB Atlas, add your IP in Atlas Network Access.'}
              </p>
            </div>
          </div>

          {/* Quick Whitelist Guide if not connected */}
          {!isConnected && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-3">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">
                How to Whitelist in MongoDB Atlas (2 Minutes):
              </span>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-600 leading-relaxed">
                <li>Log in to your <strong>MongoDB Atlas Dashboard</strong>.</li>
                <li>Go to <strong>Security → Network Access</strong> on the left sidebar.</li>
                <li>Click <strong>+ Add IP Address</strong>.</li>
                <li>
                  Click <strong>"Allow Access From Anywhere"</strong> (<code className="text-blue-700 bg-blue-50 px-1 py-0.5 rounded font-mono">0.0.0.0/0</code>) or enter your public IP:
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="font-mono bg-white border border-slate-300 px-2.5 py-1 rounded-md text-slate-800 font-bold">
                      {ip}
                    </span>
                    <button
                      onClick={handleCopyIp}
                      className="px-2.5 py-1 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors flex items-center gap-1"
                    >
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Copied' : 'Copy IP'}</span>
                    </button>
                  </div>
                </li>
                <li>Click <strong>Confirm</strong>. The backend will automatically detect and link to Atlas!</li>
              </ol>
            </div>
          )}

          {/* Statistics */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-400 block">Total Knowledge FAQs</span>
              <span className="text-base font-bold text-slate-800">{health?.knowledgeCount ?? 15} items</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-400 block">Document Chunks</span>
              <span className="text-base font-bold text-slate-800">{health?.chunkCount ?? 0} chunks</span>
            </div>
          </div>

          {/* Test Button */}
          <div className="pt-2 flex items-center justify-between">
            <a
              href="https://cloud.mongodb.com"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium"
            >
              <span>Open MongoDB Atlas Console</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <button
              onClick={handleTestNow}
              disabled={isRefreshing}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Testing...' : 'Test Connection Live'}</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}

