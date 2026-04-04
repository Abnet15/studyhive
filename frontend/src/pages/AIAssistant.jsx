import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/apiClient';
import aiService from '../services/aiService';
import ConfettiAnimation from '../components/ConfettiAnimation';
import {
  Sparkles, Brain, MessageSquare, FileText, Send, RefreshCcw,
  Trash2, CheckCircle2, XCircle, ArrowRight, Zap, Target, BookOpen,
  Trophy, TrendingUp, Star, Upload
} from 'lucide-react';

// ── Priority color mapping ──
const priorityConfig = {
  high:   { bg: 'from-rose-500/10 to-orange-500/10', border: 'border-rose-500/20', badge: 'bg-rose-500/10 text-rose-400', dot: 'bg-rose-400' },
  medium: { bg: 'from-amber-500/10 to-yellow-500/10', border: 'border-amber-500/20', badge: 'bg-amber-500/10 text-amber-400', dot: 'bg-amber-400' },
  low:    { bg: 'from-emerald-500/10 to-cyan-500/10', border: 'border-emerald-500/20', badge: 'bg-emerald-500/10 text-emerald-400', dot: 'bg-emerald-400' },
};

const stepColors = ['from-violet-500 to-indigo-600', 'from-orange-500 to-rose-600', 'from-emerald-500 to-cyan-600'];

// ── YOUR PATH component ───────────────────────────────────────────────────────
const YourPathCard = ({ steps, motivationQuote, loading, onRefresh }) => {
  const [expanded, setExpanded] = useState(null);

  if (loading) {
    return (
      <div className="flex-1 space-y-4">
        {[0,1,2].map(i => (
          <div key={i} className="animate-pulse flex gap-4 p-5 rounded-2xl bg-slate-100 dark:bg-slate-800/60">
            <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
            <div className="flex-1 space-y-2 py-1">
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full w-2/3" />
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!steps || steps.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 py-8">
        <div className="text-5xl">🤔</div>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm max-w-[200px]">
          Analyzing your profile to build a personalized plan...
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1 custom-scrollbar">
      {/* Motivation Quote */}
      {motivationQuote && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 py-3 rounded-xl bg-gradient-to-r from-primary-500/5 to-indigo-500/5 border border-primary-500/10 mb-2"
        >
          <p className="text-[11px] font-bold text-primary-500 dark:text-primary-400 italic leading-snug">
            "{motivationQuote}"
          </p>
        </motion.div>
      )}

      {/* Step Cards */}
      {steps.map((step, idx) => {
        const cfg = priorityConfig[step.priority] || priorityConfig.medium;
        const isOpen = expanded === idx;
        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.08 }}
            className={`rounded-2xl border bg-gradient-to-br ${cfg.bg} ${cfg.border} overflow-hidden cursor-pointer group`}
            onClick={() => setExpanded(isOpen ? null : idx)}
          >
            <div className="flex items-center gap-4 p-4">
              {/* Step Number Circle */}
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stepColors[idx % stepColors.length]} flex items-center justify-center text-white text-lg font-black flex-shrink-0 shadow-lg`}>
                {step.icon || (idx + 1)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-black text-sm text-slate-900 dark:text-white leading-tight truncate">
                    {step.title}
                  </span>
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full flex-shrink-0 ${cfg.badge}`}>
                    {step.tag}
                  </span>
                </div>
              </div>

              <motion.div animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
                <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
              </motion.div>
            </div>

            {/* Expanded Description */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="px-4 pb-4 pt-0">
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed border-t border-white/10 dark:border-white/5 pt-3">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}

      <p className="text-[10px] text-slate-400 dark:text-slate-600 text-center mt-1">
        Click any step to expand · AI-personalized for you
      </p>
    </div>
  );
};


// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
const AIAssistant = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  // Recommendations state
  const [recSteps, setRecSteps] = useState([]);
  const [recQuote, setRecQuote] = useState('');
  const [loadingRec, setLoadingRec] = useState(false);

  // Quiz states
  const [quizTopic, setQuizTopic] = useState('');
  const [quiz, setQuiz] = useState(null);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // File Analysis states
  const [selectedFile, setSelectedFile] = useState(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Chat states
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Hi! I'm Honey, your AI Study Buddy. How can I help you today? 🐝" }
  ]);
  const [chatMessage, setChatMessage] = useState('');
  const [sendingChat, setSendingChat] = useState(false);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (user) fetchRecommendation();
  }, [user]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchRecommendation = async () => {
    setLoadingRec(true);
    try {
      const data = await aiService.getRecommendations(token);
      setRecSteps(data.steps || []);
      setRecQuote(data.motivationQuote || '');
    } catch (err) {
      // Fallback steps so UI never breaks
      setRecSteps([
        { step: 1, icon: '🎯', title: 'Review Your Core Materials', description: 'Revisit your most recent uploads and strengthen your understanding of key concepts.', tag: 'Deep Review', priority: 'high' },
        { step: 2, icon: '📝', title: 'Run a Practice Quiz', description: 'Use the Practice Arena to test your knowledge on a topic you studied this week.', tag: 'Self-Testing', priority: 'medium' },
        { step: 3, icon: '🚀', title: 'Start a Masterclass Session', description: 'Upload a document and let AI teach you the full topic with animations and voice.', tag: 'AI Learning', priority: 'low' },
      ]);
      setRecQuote('Every expert was once a beginner. Keep going! 🌟');
    } finally {
      setLoadingRec(false);
    }
  };

  const handleGenerateQuiz = async (e) => {
    e.preventDefault();
    if (!quizTopic) return;
    setLoadingQuiz(true);
    setQuizFinished(false);
    setScore(0);
    setCurrentQuestion(0);
    setFeedback(null);
    setQuiz(null);
    try {
      const data = await aiService.generateQuiz({ topic: quizTopic }, token);
      setQuiz(data.quiz);
    } catch (err) {
      console.error('Failed to generate quiz:', err);
    } finally {
      setLoadingQuiz(false);
    }
  };

  const handleAnswer = (index) => {
    if (feedback) return;
    const isCorrect = index === quiz[currentQuestion].correctAnswer;
    setFeedback({ isCorrect, selectedIndex: index });
    if (isCorrect) setScore(s => s + 1);
    setTimeout(() => {
      setFeedback(null);
      if (currentQuestion + 1 < quiz.length) setCurrentQuestion(q => q + 1);
      else setQuizFinished(true);
    }, 1200);
  };

  const handleFileAnalysis = async (e) => {
    e?.preventDefault();
    const file = selectedFile;
    if (!file) return;
    setLoadingAnalysis(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await apiClient.post('/ai/extract-text', formData, {
        token,
        isFormData: true,
      });
      navigate('/masterclass/adhoc', {
        state: { extractedText: response.extractedText, filename: response.filename }
      });
    } catch (err) {
      alert(err.message || 'Error reading file. Ensure it has readable text or clear images.');
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim() || sendingChat) return;
    const userMsg = chatMessage;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatMessage('');
    setSendingChat(true);
    try {
      const data = await aiService.chat(userMsg, 'In the AI Assistant Hub', token);
      setMessages(prev => [...prev, { role: 'ai', text: data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: "Sorry, I lost my connection to the hive. Try again! 🥀" }]);
    } finally {
      setSendingChat(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] transition-colors duration-700 relative overflow-hidden">
      {/* Ambient Background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-primary-500/8 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-violet-500/8 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 relative">
        <ConfettiAnimation trigger={quizFinished} />

        {/* ── HEADER ── */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-14 text-center space-y-5"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-primary-500/10 to-violet-500/10 border border-primary-500/20 text-primary-600 dark:text-primary-400 font-black uppercase tracking-[0.2em] text-[10px]"
          >
            <Zap className="w-3 h-3" />
            Next-Gen AI Intelligence
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 dark:text-white">
            AI Study <span className="gradient-text italic">Hub.</span>
          </h1>
          <p className="max-w-xl mx-auto text-base text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            Your personal intellectual partner — get a study plan, smash quizzes, analyze any document, or just ask Honey.
          </p>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ── LEFT COLUMN (8 cols) ── */}
          <div className="lg:col-span-8 space-y-8">

            {/* TOP ROW: Your Path + Material AI */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* ── YOUR PATH CARD ── */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-0 flex flex-col min-h-[420px] overflow-hidden group"
              >
                {/* Card Header */}
                <div className="px-7 pt-7 pb-5 border-b border-slate-100 dark:border-white/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg">
                        <Target className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="font-black text-slate-900 dark:text-white tracking-tight">Your Path</h2>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">AI Study Roadmap</p>
                      </div>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={fetchRecommendation}
                      disabled={loadingRec}
                      className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-primary-500/10 dark:hover:bg-primary-500/10 flex items-center justify-center transition-colors group/btn"
                      title="Refresh recommendations"
                    >
                      <RefreshCcw className={`w-4 h-4 text-slate-400 group-hover/btn:text-primary-500 transition-colors ${loadingRec ? 'animate-spin' : ''}`} />
                    </motion.button>
                  </div>
                </div>

                {/* Steps Area */}
                <div className="px-5 py-5 flex-1 flex flex-col">
                  <YourPathCard
                    steps={recSteps}
                    motivationQuote={recQuote}
                    loading={loadingRec}
                    onRefresh={fetchRecommendation}
                  />
                </div>

                {/* Footer */}
                <div className="px-7 pb-5 pt-2">
                  <button
                    onClick={fetchRecommendation}
                    disabled={loadingRec}
                    className="text-[11px] font-black text-primary-500 hover:text-primary-400 uppercase tracking-widest flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <RefreshCcw className={`w-3 h-3 ${loadingRec ? 'animate-spin' : ''}`} />
                    {loadingRec ? 'Calculating...' : 'Recalculate My Path'}
                  </button>
                </div>
              </motion.section>

              {/* ── MATERIAL AI CARD ── */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-0 flex flex-col min-h-[420px] overflow-hidden group"
              >
                {/* Card Header */}
                <div className="px-7 pt-7 pb-5 border-b border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="font-black text-slate-900 dark:text-white tracking-tight">Material AI</h2>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Instant Masterclass</p>
                    </div>
                  </div>
                </div>

                {/* Upload Area */}
                <div className="px-6 py-6 flex-1 flex flex-col gap-5 justify-center">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium text-center">
                    Drop any document — I'll teach you the whole thing with animations and voice narration.
                  </p>

                  {/* Drop Zone */}
                  <div
                    className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer ${
                      dragOver
                        ? 'border-amber-400 bg-amber-500/10 scale-[1.02]'
                        : selectedFile
                        ? 'border-emerald-400 bg-emerald-500/5'
                        : 'border-slate-200 dark:border-slate-700 hover:border-amber-400/60 hover:bg-amber-500/5'
                    }`}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.png,.jpeg"
                      onChange={(e) => setSelectedFile(e.target.files[0])}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="p-7 flex flex-col items-center gap-3 text-center">
                      {selectedFile ? (
                        <>
                          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-emerald-600 dark:text-emerald-400">File Ready!</p>
                            <p className="text-[11px] text-slate-400 truncate max-w-[180px]">{selectedFile.name}</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <Upload className="w-5 h-5 text-slate-400" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                              Drop or Click to Upload
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">PDF · Word · Images</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Launch Button */}
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleFileAnalysis}
                    disabled={!selectedFile || loadingAnalysis}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-black text-sm uppercase tracking-widest shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {loadingAnalysis ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                        Reading File...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Start Interactive Masterclass
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.section>
            </div>

            {/* ── PRACTICE ARENA ── */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-10 overflow-hidden relative"
            >
              {/* Decorative background icon */}
              <Brain className="w-40 h-40 absolute -top-6 -right-6 rotate-12 pointer-events-none" style={{ color: 'var(--color-primary-500)', opacity: 0.04 }} />

              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center shadow-lg">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">Practice Arena</h2>
                  <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Test your mastery with AI-generated challenges.</p>
                </div>
              </div>

              {!quiz ? (
                <form onSubmit={handleGenerateQuiz} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <input
                    type="text"
                    placeholder="Enter topic (e.g. Algorithms, Botany...)"
                    className="md:col-span-3 input-field py-5 text-base"
                    value={quizTopic}
                    onChange={(e) => setQuizTopic(e.target.value)}
                    required
                  />
                  <button
                    type="submit"
                    disabled={loadingQuiz}
                    className="btn-primary py-5 text-base shadow-2xl flex items-center justify-center gap-2"
                  >
                    {loadingQuiz
                      ? <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" />
                      : <><Zap className="w-4 h-4" /> Build Quiz</>}
                  </button>
                </form>
              ) : quizFinished ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center py-12 space-y-6"
                >
                  <div className="text-7xl">🏆</div>
                  <h3 className="text-4xl font-black text-slate-900 dark:text-white">Mastery Achieved!</h3>
                  <div className="inline-block p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[3rem] border border-slate-100 dark:border-slate-800">
                    <span className="text-6xl font-black text-primary-500">{score}</span>
                    <span className="text-2xl font-bold text-slate-400"> / {quiz.length}</span>
                  </div>
                  <p className="text-base text-slate-500 font-medium max-w-sm mx-auto">
                    {score === quiz.length ? "Perfect score! You're a genius! 🌟" : score >= quiz.length / 2 ? "Great effort! Keep pushing! 💪" : "Keep practicing — you'll get there! 🎯"}
                  </p>
                  <button onClick={() => { setQuiz(null); setQuizTopic(''); }} className="btn-primary py-4 px-12 text-base shadow-xl hover:scale-105 transition-transform">
                    New Challenge
                  </button>
                </motion.div>
              ) : (
                <div className="space-y-8">
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <span className="text-[11px] font-black text-primary-500 uppercase tracking-[0.2em]">
                        Question {currentQuestion + 1} / {quiz.length}
                      </span>
                      <h4 className="text-xl font-bold text-slate-800 dark:text-slate-200">
                        {quiz[currentQuestion].question}
                      </h4>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-primary-500">{score}</span>
                      <span className="text-xs text-slate-400 font-bold ml-1">pts</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {quiz[currentQuestion].options.map((option, idx) => {
                      const isSelected = feedback?.selectedIndex === idx;
                      const isCorrect = idx === quiz[currentQuestion].correctAnswer;
                      let cardClass = 'border-slate-100 dark:border-slate-800 hover:border-primary-500/50 hover:bg-primary-500/5';
                      if (feedback && isSelected) cardClass = feedback.isCorrect ? 'border-emerald-400 bg-emerald-500/10' : 'border-red-400 bg-red-500/10';
                      else if (feedback && isCorrect) cardClass = 'border-emerald-400 bg-emerald-500/10';
                      return (
                        <motion.button
                          key={idx + currentQuestion}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleAnswer(idx)}
                          disabled={!!feedback}
                          className={`p-5 text-left rounded-2xl border-2 transition-all font-bold text-slate-700 dark:text-slate-300 flex items-center gap-4 ${cardClass}`}
                        >
                          <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0 transition-colors ${
                            feedback && isSelected ? (feedback.isCorrect ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white') : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                          }`}>
                            {feedback && isSelected ? (feedback.isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />) : String.fromCharCode(65 + idx)}
                          </span>
                          <span className="text-sm">{option}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${((currentQuestion + 1) / quiz.length) * 100}%` }}
                      className="bg-gradient-to-r from-primary-500 to-violet-600 h-full rounded-full"
                    />
                  </div>
                </div>
              )}
            </motion.section>
          </div>

          {/* ── RIGHT COLUMN: Chat (4 cols) ── */}
          <div className="lg:col-span-4 sticky top-24">
            <motion.section
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card flex flex-col h-[750px] overflow-hidden shadow-2xl"
            >
              {/* Chat Header */}
              <div className="p-6 bg-gradient-to-r from-primary-600 via-indigo-600 to-violet-700 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl shadow-inner">
                    🐝
                  </div>
                  <div>
                    <h3 className="text-lg font-black tracking-tight">Honey Studio</h3>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Online & Learning</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-slate-50/50 dark:bg-slate-900/20">
                <AnimatePresence initial={false}>
                  {messages.map((m, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.92, y: 8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[85%] p-4 rounded-[1.5rem] text-sm font-medium shadow-sm leading-relaxed ${
                        m.role === 'user'
                          ? 'bg-gradient-to-br from-primary-600 to-indigo-700 text-white rounded-br-md'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-bl-md border border-slate-100 dark:border-slate-700'
                      }`}>
                        {m.text}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {sendingChat && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-[1.5rem] rounded-bl-md flex gap-1.5 shadow-sm border border-slate-100 dark:border-slate-700">
                      {[0, 1, 2].map(i => (
                        <div
                          key={i}
                          className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
                <form onSubmit={handleSendChat} className="relative">
                  <input
                    type="text"
                    placeholder="Ask Honey anything..."
                    className="input-field py-4 pr-14 bg-slate-100 dark:bg-slate-950 border-transparent focus:bg-white dark:focus:bg-slate-900"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    disabled={sendingChat}
                  />
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    type="submit"
                    disabled={!chatMessage.trim() || sendingChat}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-500 to-indigo-600 text-white flex items-center justify-center shadow-lg disabled:opacity-40"
                  >
                    <Send className="w-4 h-4" />
                  </motion.button>
                </form>
                <div className="flex items-center justify-center gap-3 mt-3">
                  <div className="flex items-center gap-1 opacity-40">
                    <TrendingUp className="w-3 h-3" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Gemini Powered</span>
                  </div>
                  <span className="w-1 h-1 rounded-full bg-slate-400 opacity-30" />
                  <div className="flex items-center gap-1 opacity-40">
                    <Star className="w-3 h-3" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Personalized</span>
                  </div>
                </div>
              </div>
            </motion.section>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
