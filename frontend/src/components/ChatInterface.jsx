import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Copy,
  Check,
  RefreshCw,
  Clock,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Tag
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// Batch-specific quick query suggestions
const BATCH_SUGGESTIONS = {
  P1: [
    { label: 'P1 Exam Timetable', query: 'When are the P1 quarterly and preparatory exams?' },
    { label: 'P1 Annual Fee', query: 'What is the P1 tuition fee and hostel charges?' },
    { label: 'Evening Study Hours', query: 'What are the evening study hour timings for P1?' },
    { label: 'Library Timings', query: 'What are the library timings?' },
  ],
  P2: [
    { label: 'P2 Board Exam Dates', query: 'When are the P2 pre-final and state board exams?' },
    { label: 'Engineering Branch Selection', query: 'How does engineering branch allotment work after P2?' },
    { label: 'P2 Fees', query: 'What is the P2 annual fee and board exam fee?' },
    { label: 'Holiday Calendar', query: 'When are the Diwali and Pongal holidays?' },
  ],
  E1: [
    { label: 'E1 Exam Timetable', query: 'When are the E1 end-semester theory exams and Mid tests?' },
    { label: 'Laptop Distribution', query: 'What is the institutional laptop issuance procedure for E1?' },
    { label: 'E1 Tuition Fee', query: 'What is the first year E1 engineering fee?' },
    { label: 'Library Timings', query: 'What are the library timings?' },
  ],
  E2: [
    { label: 'E2 Afternoon Exam Dates', query: 'When are the E2 2nd year semester exams and timing shift?' },
    { label: 'Department Lab Fees', query: 'What are the E2 specialized software and lab fees?' },
    { label: 'Hostel Gate Curfew', query: 'What are the hostel gate timings and curfew rules?' },
    { label: 'Attendance Rule', query: 'What is the minimum attendance percentage rule?' },
  ],
  E3: [
    { label: 'E3 Exam Schedule', query: 'When are the E3 3rd year semester exams and Mid tests?' },
    { label: 'Mini-Project Viva', query: 'When is the mandatory mini-project evaluation viva?' },
    { label: 'Summer Internship NOC', query: 'What are the guidelines for E3 summer internships?' },
    { label: 'E3 Fee Structure', query: 'What is the tuition and certification voucher fee for E3?' },
  ],
  E4: [
    { label: 'Fast-Track Exam Schedule', query: 'When are the E4 fast-track semester exams?' },
    { label: 'Campus Placement Drives', query: 'What are the upcoming campus recruitment drives and packages?' },
    { label: 'Major Project Phase-1', query: 'When is the Major Project presentation and viva?' },
    { label: 'Convocation & No-Dues', query: 'What is the convocation fee and degree clearance process?' },
  ]
};

export default function ChatInterface({ currentBatch = 'E3', currentUser, prefilledQuery }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome_1',
      sender: 'bot',
      text: `👋 **Welcome to CampusConnect AI!** 

I am your college information assistant personalized for **Batch ${currentBatch}**${currentUser?.name ? ` & student **${currentUser.name}** (\`${currentUser.id}\`)` : ''}.

You can ask me:
- 📊 **"What is my attendance?"** *(Fetched live from database by your ID)*
- 🏆 **"What is my CGPA?"**
- 👨‍🏫 **"Who is my faculty advisor?"**
- 🏠 **"What is my hostel room allocation?"**
- 📅 **"${currentBatch} Examination Timetable & Internal Assessment Dates"**
- 💳 **"${currentBatch} Fee Structure & Payment Deadlines"**
- 🌴 **"Official Holiday Calendar & Semester Vacation Dates"**

Click any quick pill above or type your question below!`,
      confidence: 1.0,
      sources: [`Personalized Knowledge Base [Batch ${currentBatch}]`],
      retrievalType: `Personalized (${currentBatch})`,
      latencyMs: 5,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [isSpeakingId, setIsSpeakingId] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // When prefilledQuery is passed (e.g. from Notice click), auto-send
  useEffect(() => {
    if (prefilledQuery) {
      handleSend(prefilledQuery);
    }
  }, [prefilledQuery]);

  // Re-greet when batch changes
  useEffect(() => {
    setMessages([
      {
        id: 'batch_welcome_' + currentBatch,
        sender: 'bot',
        text: `🎓 **Active Profile Switched to Batch ${currentBatch}**

I am now personalized to answer queries according to the **${currentBatch} Academic Syllabus, Exam Timetable, and Fee Structure**. How can I help you today?`,
        confidence: 1.0,
        sources: [`Personalized Knowledge Base [Batch ${currentBatch}]`],
        retrievalType: `Batch Switched (${currentBatch})`,
        latencyMs: 5,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [currentBatch]);

  // Speech Recognition (STT)
  const handleToggleListening = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please use Google Chrome or Edge.');
      return;
    }

    if (isListening) {
      window.currentRecognition?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputQuery(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    window.currentRecognition = recognition;
    recognition.start();
  };

  // Text to Speech (TTS)
  const handleSpeak = (id, text) => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    if (isSpeakingId === id) {
      window.speechSynthesis.cancel();
      setIsSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[#*`_\[\]()]/g, ' ');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsSpeakingId(null);
    utterance.onerror = () => setIsSpeakingId(null);

    setIsSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSend = async (queryToSend) => {
    const query = (queryToSend || inputQuery).trim();
    if (!query || isLoading) return;

    const userMsg = {
      id: 'user_' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          batch: currentBatch,
          studentId: currentUser?.id,
          studentUser: currentUser,
          sessionId: `session_${currentBatch}_${currentUser?.id || 'guest'}`
        })
      });

      const data = await response.json();

      const botMsg = {
        id: 'bot_' + Date.now(),
        sender: 'bot',
        text: data.answer || `Sorry, no records found for ${currentBatch}.`,
        confidence: data.confidence ?? 0.85,
        sources: data.sources || [`Institutional Knowledge Base [${currentBatch}]`],
        category: data.category || 'general',
        latencyMs: data.latencyMs || 15,
        retrievalType: data.retrievalType || `Personalized (${currentBatch})`,
        matchedItem: data.matchedItem,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const errorMsg = {
        id: 'err_' + Date.now(),
        sender: 'bot',
        text: "⚠️ An error occurred while retrieving information from the server.",
        confidence: 0,
        sources: ['System Error Handler'],
        category: 'error',
        latencyMs: 0,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickSuggestions = BATCH_SUGGESTIONS[currentBatch] || BATCH_SUGGESTIONS.E3;

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      
      {/* Chat Header Status */}
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-800">CampusConnect AI</span>
              <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.2 rounded border border-blue-200">
                {currentBatch} Profile
              </span>
            </div>
            <span className="text-[11px] text-slate-500">
              Personalized answers tailored to your year of study
            </span>
          </div>
        </div>

        <button
          onClick={() => setMessages([messages[0]])}
          title="Clear Conversation"
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Quick Suggestions Carousel */}
      <div className="px-4 py-2 bg-slate-50/60 border-b border-slate-200/80 flex items-center space-x-2 overflow-x-auto scrollbar-none">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
          {currentUser?.role === 'student' ? 'My Details & Suggestions:' : 'Suggestions:'}
        </span>
        {currentUser?.role === 'student' && (
          <>
            <button
              onClick={() => handleSend("What is my attendance?")}
              className="whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs transition-all shrink-0 flex items-center gap-1"
            >
              <span>📊 My Attendance</span>
            </button>
            <button
              onClick={() => handleSend("What is my CGPA?")}
              className="whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 shadow-2xs transition-all shrink-0 flex items-center gap-1"
            >
              <span>🏆 My CGPA</span>
            </button>
            <button
              onClick={() => handleSend("Who is my faculty advisor?")}
              className="whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-300 shadow-2xs transition-all shrink-0 flex items-center gap-1"
            >
              <span>👨‍🏫 My Advisor</span>
            </button>
            <button
              onClick={() => handleSend("What is my hostel room allocation?")}
              className="whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-300 shadow-2xs transition-all shrink-0 flex items-center gap-1"
            >
              <span>🏠 My Hostel Room</span>
            </button>
          </>
        )}
        {quickSuggestions.map((item, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(item.query)}
            className="whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] font-medium bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 shadow-2xs transition-all shrink-0"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start space-x-3 ${
              msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-sky-400'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-2xs ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none'
              }`}
            >
              {/* Bot Meta */}
              {msg.sender === 'bot' && (
                <div className="flex items-center justify-between gap-2 border-b border-slate-200/80 pb-1.5 mb-2 text-[10px] text-slate-500">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-semibold text-slate-700 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-blue-500" />
                      Answer for {currentBatch}
                    </span>
                    {msg.retrievalType && (
                      <span className="bg-blue-50 text-blue-700 font-mono px-1.5 py-0.2 rounded border border-blue-100">
                        {msg.retrievalType}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-1.5">
                    {msg.latencyMs !== undefined && (
                      <span className="flex items-center gap-0.5 font-mono text-[10px] text-slate-400">
                        <Clock className="w-2.5 h-2.5" />
                        {msg.latencyMs}ms
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Text */}
              <div className={`prose prose-xs max-w-none text-xs ${msg.sender === 'user' ? 'text-white prose-invert' : 'text-slate-800'}`}>
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>

              {/* Citations */}
              {msg.sender === 'bot' && msg.sources && msg.sources.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-slate-200/80 flex flex-wrap items-center gap-1 text-[10px] text-slate-500">
                  <span className="font-semibold text-slate-600 flex items-center gap-1">
                    <BookOpen className="w-2.5 h-2.5 text-slate-400" /> Source:
                  </span>
                  {msg.sources.map((src, i) => (
                    <span key={i} className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-700 font-medium">
                      {src}
                    </span>
                  ))}
                </div>
              )}

              {/* Actions */}
              {msg.sender === 'bot' && (
                <div className="mt-2 flex items-center justify-end space-x-1 pt-1">
                  <button
                    onClick={() => handleSpeak(msg.id, msg.text)}
                    title={isSpeakingId === msg.id ? "Stop voice" : "Read aloud"}
                    className={`p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-white transition-colors ${
                      isSpeakingId === msg.id ? 'text-blue-600 bg-blue-50 ring-1 ring-blue-300' : ''
                    }`}
                  >
                    {isSpeakingId === msg.id ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                  </button>
                  <button
                    onClick={() => handleCopy(msg.id, msg.text)}
                    title="Copy Answer"
                    className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-white transition-colors"
                  >
                    {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                  <span className="text-[10px] text-slate-400 pl-1 font-mono">{msg.timestamp}</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-xl bg-slate-800 text-sky-400 flex items-center justify-center shrink-0 shadow-xs">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-none px-4 py-2.5 text-slate-600 text-xs flex items-center space-x-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
              <span>Retrieving {currentBatch} batch records & institutional context...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="p-3 bg-white border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2"
        >
          <button
            type="button"
            onClick={handleToggleListening}
            title={isListening ? "Listening... click to stop" : "Speak query (Speech-to-Text)"}
            className={`p-2.5 rounded-xl transition-all ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder={`Ask anything about ${currentBatch} exams, fees, timetable, notices...`}
            className="flex-1 px-3 py-2 text-xs text-slate-900 placeholder-slate-400 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 focus:bg-white transition-all"
          />

          <button
            type="submit"
            disabled={!inputQuery.trim() || isLoading}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold text-xs shadow-xs transition-all flex items-center space-x-1"
          >
            <span>Ask</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

    </div>
  );
}
