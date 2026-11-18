import React, { useState } from 'react';
import NoticeBoard from './NoticeBoard.jsx';
import ChatInterface from './ChatInterface.jsx';
import UserProfileBanner from './UserProfileBanner.jsx';
import {
  GraduationCap,
  Calendar,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Bell,
  Clock,
  ChevronRight
} from 'lucide-react';

const BATCHES = [
  { id: 'P1', name: 'P1 Batch', desc: 'Pre-University 1st Year (PUC-1)' },
  { id: 'P2', name: 'P2 Batch', desc: 'Pre-University 2nd Year (PUC-2)' },
  { id: 'E1', name: 'E1 Batch', desc: '1st Year B.Tech Engineering' },
  { id: 'E2', name: 'E2 Batch', desc: '2nd Year B.Tech Engineering' },
  { id: 'E3', name: 'E3 Batch', desc: '3rd Year B.Tech Engineering' },
  { id: 'E4', name: 'E4 Batch', desc: '4th / Final Year B.Tech' },
];

export default function StudentDashboard({ currentUser, currentBatch, setCurrentBatch }) {
  const [prefilledQuery, setPrefilledQuery] = useState(null);

  const activeBatchObj = BATCHES.find(b => b.id === currentBatch) || BATCHES[4];

  const handleAskAboutNotice = (notice) => {
    setPrefilledQuery(`Tell me more details about the circular: "${notice.title}"`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">

      {/* Logged-In Student Profile Details Banner */}
      <UserProfileBanner user={{ ...currentUser, batch: currentBatch }} />

      {/* Main Dual-Panel Grid: Notices on Left, Chatbot on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* Left Column: Batch Notices Feed (5 cols) */}
        <div className="lg:col-span-5">
          <NoticeBoard
            currentBatch={currentBatch}
            onAskAboutNotice={handleAskAboutNotice}
          />
        </div>

        {/* Right Column: Batch Personalized Chatbot (7 cols) */}
        <div className="lg:col-span-7">
          <ChatInterface
            currentBatch={currentBatch}
            currentUser={currentUser}
            prefilledQuery={prefilledQuery}
          />
        </div>

      </div>

    </div>
  );
}
