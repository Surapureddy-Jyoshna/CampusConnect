import React, { useState, useEffect } from 'react';
import HomePage from './components/HomePage.jsx';
import Header from './components/Header.jsx';
import LoginPage from './components/LoginPage.jsx';
import StudentDashboard from './components/StudentDashboard.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';
import EditModal from './components/EditModal.jsx';
import DatabaseModal from './components/DatabaseModal.jsx';
import { DEMO_STUDENTS } from './data/authUsers.js';

export default function App() {
  // Authentication State: null means not logged in
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('campusconnect_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  // Page state: 'home' | 'auth' | 'dashboard'
  // If user already logged in (from localStorage), skip home and go to dashboard
  const [page, setPage] = useState(() => currentUser ? 'dashboard' : 'home');

  // Which auth mode to open: 'signin' | 'signup'
  const [authMode, setAuthMode] = useState('signin');

  const [currentBatch, setCurrentBatch] = useState(() => {
    return currentUser?.batch || 'E4';
  });

  const [health, setHealth] = useState(null);

  // Modals
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const fetchHealth = async () => {
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setHealth(data);
    } catch (e) {
      console.warn('Health fetch error:', e.message);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  // Sync latest student metrics from DB by ID number after login
  useEffect(() => {
    if (currentUser?.role === 'student' && currentUser.batch) {
      setCurrentBatch(currentUser.batch);
    }

    if (currentUser?.id) {
      fetch(`/api/auth/user/${currentUser.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.user) {
            const freshUser = { ...currentUser, ...data.user };
            setCurrentUser(freshUser);
            if (freshUser.batch) setCurrentBatch(freshUser.batch);
            try {
              localStorage.setItem('campusconnect_user', JSON.stringify(freshUser));
            } catch (e) {}
          }
        })
        .catch(err => console.warn('Could not refresh student data by ID:', err.message));
    }
  }, [currentUser?.id]);

  // Called from HomePage when user clicks "Sign Up" or "Sign In"
  const handleGetStarted = (mode = 'signin') => {
    setAuthMode(mode);
    setPage('auth');
  };

  const handleLoginSuccess = (user) => {
    // Clear stale localStorage before saving fresh data
    try { localStorage.removeItem('campusconnect_user'); } catch (e) {}
    setCurrentUser(user);
    if (user.role === 'student' && user.batch) {
      setCurrentBatch(user.batch);
    }
    try {
      localStorage.setItem('campusconnect_user', JSON.stringify(user));
    } catch (e) {}
    setPage('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try { localStorage.removeItem('campusconnect_user'); } catch (e) {}
    setPage('home');
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setIsEditModalOpen(true);
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsEditModalOpen(true);
  };

  const handleTestQuery = (queryText, targetBatch) => {
    if (targetBatch && targetBatch !== 'All') {
      setCurrentBatch(targetBatch);
    }
    if (currentUser?.role !== 'student') {
      const demo = DEMO_STUDENTS.find(s => s.batch === targetBatch) || DEMO_STUDENTS[0];
      handleLoginSuccess(demo);
    }
  };

  // ── RENDER ──────────────────────────────────────────────────────────

  // 1. Home / Landing Page
  if (page === 'home') {
    return <HomePage onGetStarted={handleGetStarted} />;
  }

  // 2. Auth Page (Login / Sign Up)
  if (page === 'auth') {
    return (
      <LoginPage
        initialMode={authMode}
        onLoginSuccess={handleLoginSuccess}
        onBackToHome={() => setPage('home')}
        health={health}
      />
    );
  }

  // 3. Dashboard (Student or Admin)
  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Universal Header */}
      <Header
        currentUser={currentUser}
        onLogout={handleLogout}
        currentRole={currentUser.role}
        setCurrentRole={(role) => {
          if (role === 'student' && currentUser.role === 'admin') {
            const demo = DEMO_STUDENTS.find(s => s.batch === currentBatch) || DEMO_STUDENTS[0];
            handleLoginSuccess(demo);
          }
        }}
        currentBatch={currentBatch}
        health={health}
        onOpenDbModal={() => setIsDbModalOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-1">
        {currentUser.role === 'student' ? (
          <StudentDashboard
            currentUser={currentUser}
            currentBatch={currentBatch}
            setCurrentBatch={setCurrentBatch}
          />
        ) : (
          <AdminDashboard
            currentUser={currentUser}
            onTestQuery={handleTestQuery}
            onOpenEditModal={handleOpenEdit}
            onAddNew={handleOpenAdd}
          />
        )}
      </main>

      {/* Edit / Add Modal */}
      <EditModal
        isOpen={isEditModalOpen}
        item={editingItem}
        onClose={() => setIsEditModalOpen(false)}
        onSaveSuccess={() => { fetchHealth(); }}
      />

      {/* MongoDB Atlas Diagnostics Modal */}
      <DatabaseModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
        health={health}
        onRefreshHealth={fetchHealth}
      />
    </div>
  );
}
