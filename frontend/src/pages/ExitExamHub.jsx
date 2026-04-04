import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  GraduationCap, Clock, ChevronRight, CheckCircle2, XCircle, 
  BarChart3, ArrowLeft, Loader2, BookOpen, Target, Trophy, 
  AlertTriangle, Sparkles, RotateCcw
} from 'lucide-react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, Tooltip
} from 'recharts';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ─── Ethiopian University Faculties & Departments ───────────────────────────
const FACULTIES = [
  {
    id: 'Computing & Informatics',
    icon: '💻', color: 'from-indigo-600 to-blue-500',
    departments: [
      { id: 'Computer Science', icon: '💻', color: 'from-blue-500 to-indigo-500' },
      { id: 'Software Engineering', icon: '⚙️', color: 'from-violet-500 to-purple-500' },
      { id: 'Information Technology', icon: '🌐', color: 'from-cyan-500 to-blue-500' },
      { id: 'Information Systems', icon: '📊', color: 'from-teal-500 to-emerald-500' },
    ]
  },
  {
    id: 'Engineering & Technology',
    icon: '🏗️', color: 'from-orange-500 to-amber-500',
    departments: [
      { id: 'Electrical Engineering', icon: '⚡', color: 'from-amber-400 to-yellow-500' },
      { id: 'Mechanical Engineering', icon: '🔧', color: 'from-orange-400 to-orange-500' },
      { id: 'Civil Engineering', icon: '🏗️', color: 'from-stone-500 to-stone-600' },
      { id: 'Architecture', icon: '🏛️', color: 'from-slate-600 to-slate-700' },
    ]
  },
  {
    id: 'Business & Law',
    icon: '⚖️', color: 'from-pink-500 to-rose-500',
    departments: [
      { id: 'Business Administration', icon: '📈', color: 'from-fuchsia-500 to-pink-500' },
      { id: 'Accounting', icon: '🧾', color: 'from-lime-500 to-green-500' },
      { id: 'Law', icon: '⚖️', color: 'from-yellow-500 to-amber-500' },
    ]
  },
  {
    id: 'Health & Medicine',
    icon: '⚕️', color: 'from-emerald-500 to-teal-500',
    departments: [
      { id: 'Medicine', icon: '🩺', color: 'from-teal-400 to-emerald-400' },
      { id: 'Nursing', icon: '🩹', color: 'from-cyan-400 to-sky-500' },
      { id: 'Pharmacy', icon: '💊', color: 'from-indigo-400 to-blue-500' },
    ]
  }
];

// ─── Animated Background Particles ───────────────────────────────────────────
const Particles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(10)].map((_, i) => (
      <motion.div key={i} className="absolute w-1.5 h-1.5 rounded-full bg-primary-500/20"
        style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
        animate={{ y: [0, -30, 0], opacity: [0.1, 0.3, 0.1], scale: [1, 1.4, 1] }}
        transition={{ duration: 5 + Math.random() * 4, delay: Math.random() * 3, repeat: Infinity }}
      />
    ))}
  </div>
);

const ExitExamHub = () => {
  const { token, user } = useAuth();

  // ─── State Machine ─────────────────────────────────────────────────────────
  const [phase, setPhase] = useState('select'); // select | loading | exam | results
  const [department, setDepartment] = useState('');
  const [examData, setExamData] = useState(null);
  const [flatQuestions, setFlatQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showExplanation, setShowExplanation] = useState(null); // null | 'correct' | 'wrong'
  const [currentExplanation, setCurrentExplanation] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [results, setResults] = useState(null);
  const timerRef = useRef(null);

  // ─── Fetch Diagnostic from Backend ─────────────────────────────────────────
  const startExam = async (dept) => {
    setDepartment(dept);
    setPhase('loading');
    setAnswers({});
    setCurrentQ(0);
    setShowExplanation(null);

    try {
      const res = await fetch(`${API_BASE}/ai/diagnostic/${encodeURIComponent(dept)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('API Error');
      const data = await res.json();
      setExamData(data);

      // Flatten questions and tag them with competency
      const flat = [];
      (data.competencies || []).forEach(comp => {
        (comp.questions || []).forEach(q => {
          flat.push({ ...q, competency: comp.name });
        });
      });
      setFlatQuestions(flat);
      setTimeLeft(flat.length * 90); // 90 seconds per question
      setPhase('exam');
    } catch (err) {
      console.error(err);
      setPhase('select');
      alert('Failed to generate exam. Please try again.');
    }
  };

  // ─── Timer ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase === 'exam' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            finishExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // ─── Answer & Navigation ───────────────────────────────────────────────────
  // Robust matcher: AI might return correctAnswer as "D", "No Preemption", or "D. No Preemption"
  const isCorrectOption = (opt, idx, correctAnswer) => {
    if (!correctAnswer) return false;
    const ca = correctAnswer.trim();
    const letter = String.fromCharCode(65 + idx); // A, B, C, D, E
    // Exact match
    if (opt === ca) return true;
    // Letter match (e.g. "D")
    if (ca.length <= 2 && ca.toUpperCase() === letter) return true;
    // Letter-prefixed match (e.g. "D. No Preemption")
    if (ca.startsWith(letter + '.') || ca.startsWith(letter + ')')) return true;
    // Substring containment (e.g. correctAnswer contains the option text or vice versa)
    if (ca.toLowerCase().includes(opt.toLowerCase()) || opt.toLowerCase().includes(ca.toLowerCase())) return true;
    return false;
  };

  const getCorrectIndex = (q) => {
    return (q.options || []).findIndex((opt, idx) => isCorrectOption(opt, idx, q.correctAnswer));
  };

  const selectAnswer = (questionIndex, optionIndex) => {
    if (answers[questionIndex] !== undefined) return; // already answered
    
    const q = flatQuestions[questionIndex];
    const correctIdx = getCorrectIndex(q);
    const isCorrect = optionIndex === correctIdx;
    
    setAnswers(prev => ({ ...prev, [questionIndex]: optionIndex }));
    setShowExplanation(isCorrect ? 'correct' : 'wrong');
    setCurrentExplanation(q.explanation || '');
  };

  const nextQuestion = () => {
    setShowExplanation(null);
    setCurrentExplanation('');
    if (currentQ < flatQuestions.length - 1) {
      setCurrentQ(prev => prev + 1);
    } else {
      finishExam();
    }
  };

  // ─── Finish & Score ────────────────────────────────────────────────────────
  const finishExam = useCallback(async () => {
    clearInterval(timerRef.current);

    // Calculate scores per competency
    const compMap = {};
    flatQuestions.forEach((q, idx) => {
      if (!compMap[q.competency]) compMap[q.competency] = { correct: 0, total: 0 };
      compMap[q.competency].total++;
      const correctIdx = getCorrectIndex(q);
      if (answers[idx] === correctIdx) compMap[q.competency].correct++;
    });

    const scores = Object.entries(compMap).map(([name, data]) => ({
      competency: name,
      score: data.correct,
      maxScore: data.total
    }));

    const totalScore = scores.reduce((sum, s) => sum + s.score, 0);
    const totalMaxScore = scores.reduce((sum, s) => sum + s.maxScore, 0);

    const resultData = { department, scores, totalScore, totalMaxScore };
    setResults(resultData);
    setPhase('results');

    // Save to backend
    try {
      await fetch(`${API_BASE}/ai/diagnostic/analyze`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(resultData)
      });
    } catch (err) {
      console.error('Failed to save exam results:', err);
    }
  }, [flatQuestions, answers, department, token]);

  // ─── Radar Chart Data ──────────────────────────────────────────────────────
  const radarData = results ? results.scores.map(s => ({
    subject: s.competency.length > 18 ? s.competency.substring(0, 16) + '…' : s.competency,
    fullName: s.competency,
    score: Math.round((s.score / s.maxScore) * 100),
    fullMark: 100
  })) : [];

  const overallPercent = results ? Math.round((results.totalScore / results.totalMaxScore) * 100) : 0;

  // ─── RENDER: Department Selection ──────────────────────────────────────────
  if (phase === 'select') {
    return (
      <div className="min-h-[calc(100vh-80px)] mt-6 md:mt-12 bg-slate-50 dark:bg-[#030712] py-4 px-4 relative overflow-hidden">
        <Particles />
        <div className="absolute top-[-15%] right-[-10%] w-[45%] h-[45%] bg-primary-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-xs font-black uppercase tracking-widest">
              <GraduationCap className="w-4 h-4" /> Powered by Honey AI
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-4">
              Honey Exit <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-indigo-500">Indicator</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
              Select your department below. Our AI will generate a comprehensive diagnostic exam covering all core competencies of your program and show you exactly where you need to improve.
            </p>
          </motion.div>

          <div className="space-y-16">
            {FACULTIES.map((fac, idx) => (
              <motion.div 
                key={fac.id}
                initial="hidden" animate="visible"
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.05, delay: idx * 0.1 } }}}
                className="relative"
              >
                {/* Faculty Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${fac.color} flex items-center justify-center text-xl text-white shadow-xl shadow-[rgba(0,0,0,0.1)]`}>
                    {fac.icon}
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{fac.id}</h2>
                    <div className="h-1 w-12 bg-gradient-to-r from-primary-500 to-transparent rounded-full mt-1"></div>
                  </div>
                </div>

                {/* Departments Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                  {fac.departments.map((dept) => (
                    <motion.button
                      key={dept.id}
                      variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 }}}
                      whileHover={{ y: -5, scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => startExam(dept.id)}
                      className="relative p-5 md:p-6 rounded-[1.5rem] border border-slate-200 dark:border-white/10 
                        bg-white dark:bg-slate-900/60 backdrop-blur-xl text-left
                        hover:border-primary-400 dark:hover:border-primary-500/50 
                        shadow-md hover:shadow-2xl hover:shadow-primary-500/10 dark:shadow-none dark:hover:shadow-[0_0_30px_rgba(99,102,241,0.15)]
                        transition-all duration-500 group overflow-hidden flex flex-col h-full min-h-[140px]"
                    >
                      {/* Interactive Hover Gradient Glow */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${dept.color} opacity-0 group-hover:opacity-5 dark:group-hover:opacity-[0.08] transition-opacity duration-500`} />
                      
                      <div className="relative z-10 flex justify-between items-start mb-auto">
                        <div className={`w-12 h-12 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform duration-500 group-hover:rotate-3`}>
                          {dept.icon}
                        </div>
                        <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center group-hover:bg-primary-500 group-hover:text-white dark:group-hover:bg-primary-500 text-slate-300 dark:text-slate-600 transition-colors shadow-sm">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                      
                      <div className="relative z-10 mt-4">
                        <div className="text-[13px] md:text-[15px] font-black text-slate-900 dark:text-white leading-snug group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{dept.id}</div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── RENDER: Loading ───────────────────────────────────────────────────────
  if (phase === 'loading') {
    return (
      <div className="min-h-[calc(100vh-80px)] mt-4 md:mt-12 bg-slate-50 dark:bg-[#030712] flex flex-col items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-primary-500 to-indigo-600 flex items-center justify-center mx-auto mb-8 shadow-xl shadow-primary-500/30"
          >
            <Sparkles className="w-10 h-10 text-white" />
          </motion.div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3">Generating Your Exam…</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto">
            Honey AI is analyzing the <strong className="text-slate-700 dark:text-white">{department}</strong> curriculum and building a comprehensive diagnostic test just for you.
          </p>
          <div className="mt-8 flex items-center justify-center gap-1.5">
            {[0, 1, 2, 3, 4].map(i => (
              <motion.div key={i} className="w-2.5 h-2.5 rounded-full bg-primary-500"
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, delay: i * 0.15, repeat: Infinity }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── RENDER: Active Exam ───────────────────────────────────────────────────
  if (phase === 'exam' && flatQuestions.length > 0) {
    const q = flatQuestions[currentQ];
    const progress = ((currentQ + 1) / flatQuestions.length) * 100;
    const isAnswered = answers[currentQ] !== undefined;
    const isTimeLow = timeLeft < 60;

    return (
      <div className="min-h-[calc(100vh-80px)] mt-10 md:mt-16 bg-slate-50 dark:bg-[#030712] flex flex-col relative overflow-hidden">
        {/* ─── Top Bar ──────────────────────────────────────── */}
        <div className="relative z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-t border-slate-200 dark:border-white/5 px-4 md:px-8 py-3 rounded-3xl shadow-sm mx-2 md:mx-6 mb-2">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <div className="flex flex-1 items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <Target className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <div className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{department}</div>
                <div className="text-[11px] text-primary-500 font-bold">{q.competency}</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {currentQ + 1}<span className="text-slate-400">/{flatQuestions.length}</span>
              </div>
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-black ${
                isTimeLow ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 animate-pulse' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}>
                <Clock className="w-4 h-4" />
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="max-w-4xl mx-auto mt-2">
            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-primary-500 to-indigo-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>

        {/* ─── Question Card ────────────────────────────────── */}
        <div className="flex-1 flex items-start justify-center p-4 md:p-8 pt-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQ}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-3xl"
            >
              {/* Question */}
              <div className="bg-white dark:bg-slate-900/70 rounded-3xl border border-slate-200 dark:border-white/10 p-8 md:p-10 shadow-xl shadow-slate-200/50 dark:shadow-black/20 mb-6">
                <div className="flex items-start gap-4 mb-8">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-lg">
                    {currentQ + 1}
                  </div>
                  <p className="text-lg font-bold text-slate-900 dark:text-white leading-relaxed pt-1.5">
                    {q.questionText}
                  </p>
                </div>

                {/* Options */}
                <div className="space-y-3">
                  {(q.options || []).map((opt, idx) => {
                    const letter = String.fromCharCode(65 + idx);
                    const isSelected = answers[currentQ] === idx;
                    const correctIdx = getCorrectIndex(q);
                    const isCorrectOpt = idx === correctIdx;
                    const revealed = isAnswered;

                    let optionStyle = 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-white/10 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-primary-50 dark:hover:bg-primary-900/10';
                    if (revealed && isCorrectOpt) {
                      optionStyle = 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-400 dark:border-emerald-600 ring-1 ring-emerald-400/30';
                    } else if (revealed && isSelected && !isCorrectOpt) {
                      optionStyle = 'bg-red-50 dark:bg-red-900/20 border-red-400 dark:border-red-600 ring-1 ring-red-400/30';
                    }

                    return (
                      <motion.button
                        key={idx}
                        whileHover={!revealed ? { scale: 1.01 } : {}}
                        whileTap={!revealed ? { scale: 0.99 } : {}}
                        onClick={() => selectAnswer(currentQ, idx)}
                        disabled={revealed}
                        className={`w-full flex items-center gap-4 p-4 md:p-5 rounded-2xl border text-left transition-all duration-300 ${optionStyle}`}
                      >
                        <div className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center font-black text-sm transition-colors ${
                          revealed && isCorrectOpt ? 'bg-emerald-500 text-white' :
                          revealed && isSelected && !isCorrectOpt ? 'bg-red-500 text-white' :
                          'bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600'
                        }`}>
                          {revealed && isCorrectOpt ? <CheckCircle2 className="w-5 h-5" /> :
                           revealed && isSelected && !isCorrectOpt ? <XCircle className="w-5 h-5" /> : letter}
                        </div>
                        <span className={`text-sm font-semibold ${
                          revealed && isCorrectOpt ? 'text-emerald-700 dark:text-emerald-400' :
                          revealed && isSelected && !isCorrectOpt ? 'text-red-700 dark:text-red-400 line-through' :
                          'text-slate-700 dark:text-slate-300'
                        }`}>{opt}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Explanation Panel */}
              <AnimatePresence>
                {showExplanation && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    className="mb-6"
                  >
                    <div className={`p-5 rounded-2xl border ${
                      showExplanation === 'correct' 
                        ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-300 dark:border-emerald-800' 
                        : 'bg-amber-50 dark:bg-amber-900/10 border-amber-300 dark:border-amber-800'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        {showExplanation === 'correct' 
                          ? <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          : <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        }
                        <span className={`font-black text-sm ${
                          showExplanation === 'correct' ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'
                        }`}>
                          {showExplanation === 'correct' ? 'Correct!' : 'Not Quite Right'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{currentExplanation}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Next Button */}
              {isAnswered && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={nextQuestion}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary-600 to-indigo-600 text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-primary-500/30 hover:scale-[1.01] active:scale-[0.99] transition-transform"
                >
                  {currentQ < flatQuestions.length - 1 ? (
                    <>Next Question <ChevronRight className="w-5 h-5" /></>
                  ) : (
                    <>Finish & See Results <BarChart3 className="w-5 h-5" /></>
                  )}
                </motion.button>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // ─── RENDER: Results Dashboard ─────────────────────────────────────────────
  if (phase === 'results' && results) {
    const getGrade = (pct) => {
      if (pct >= 90) return { label: 'Excellent', color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30' };
      if (pct >= 75) return { label: 'Very Good', color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' };
      if (pct >= 60) return { label: 'Good', color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30' };
      if (pct >= 45) return { label: 'Needs Work', color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30' };
      return { label: 'Critical', color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' };
    };

    const grade = getGrade(overallPercent);

    return (
      <div className="min-h-[calc(100vh-80px)] mt-6 md:mt-12 bg-slate-50 dark:bg-[#030712] py-8 px-4 relative overflow-hidden">
        <Particles />
        <div className="max-w-5xl mx-auto relative z-10">
          
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full ${grade.bg} ${grade.color} text-sm font-black uppercase tracking-widest mb-6`}>
              <Trophy className="w-5 h-5" /> {grade.label}
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-3">
              Your Score: <span className={grade.color}>{overallPercent}%</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg">
              {results.totalScore}/{results.totalMaxScore} correct answers in <strong className="text-slate-700 dark:text-white">{department}</strong>
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            
            {/* Radar Chart */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
              className="bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-white/10 p-6 md:p-8 shadow-xl"
            >
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary-500" /> Competency Radar
              </h3>
              <ResponsiveContainer width="100%" height={320}>
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                  <PolarGrid stroke="currentColor" className="text-slate-200 dark:text-slate-700" />
                  <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 700 }}
                    className="text-slate-600 dark:text-slate-400"
                  />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke="#6366f1"
                    fill="#6366f1"
                    fillOpacity={0.25}
                    strokeWidth={2}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                      border: 'none', 
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '13px',
                      fontWeight: 700
                    }}
                    formatter={(value) => [`${value}%`, 'Score']}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Competency Breakdown */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
              className="bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-white/10 p-6 md:p-8 shadow-xl"
            >
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary-500" /> Detailed Breakdown
              </h3>
              <div className="space-y-5">
                {results.scores.map((s, idx) => {
                  const pct = Math.round((s.score / s.maxScore) * 100);
                  const g = getGrade(pct);
                  return (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, y: 10 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      transition={{ delay: 0.4 + idx * 0.1 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-slate-800 dark:text-white truncate pr-2">{s.competency}</span>
                        <span className={`text-xs font-black px-2 py-0.5 rounded-full ${g.bg} ${g.color}`}>
                          {pct}%
                        </span>
                      </div>
                      <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 1, delay: 0.5 + idx * 0.1  }}
                          className={`h-full rounded-full ${
                            pct >= 75 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' :
                            pct >= 50 ? 'bg-gradient-to-r from-amber-400 to-amber-500' :
                            'bg-gradient-to-r from-red-400 to-red-500'
                          }`}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Action Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <button
              onClick={() => { setPhase('select'); setResults(null); setExamData(null); setFlatQuestions([]); }}
              className="px-8 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-bold flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              <ArrowLeft className="w-5 h-5" /> Change Department
            </button>
            <button
              onClick={() => startExam(department)}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-primary-600 to-indigo-600 text-white font-bold flex items-center gap-2 shadow-lg shadow-primary-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <RotateCcw className="w-5 h-5" /> Retake Exam
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Fallback
  return null;
};

export default ExitExamHub;
