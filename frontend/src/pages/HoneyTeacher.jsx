import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipForward, RotateCcw, Volume2, CheckCircle, XCircle, Plus, X, ChevronRight, Sparkles, Search } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ─── Professor Personas ───────────────────────────────────────────────────────
const PROFESSORS = [
  { id: 'general',     name: 'Prof. Nova',    emoji: '🌟', tag: 'Universal Expert',   color: 'from-indigo-600/40 to-violet-600/40', border: 'border-indigo-500/40',  desc: 'World-class generalist — explains anything with vivid analogies.' },
  { id: 'python',      name: 'Dr. Pythia',    emoji: '🐍', tag: 'Python & Algorithms', color: 'from-emerald-700/40 to-green-600/40', border: 'border-emerald-500/40', desc: 'Deep Python expertise — from basics to advanced algorithms.' },
  { id: 'webdev',      name: 'Prof. Stack',   emoji: '🌐', tag: 'Full-Stack Web Dev',  color: 'from-blue-700/40 to-cyan-600/40',    border: 'border-blue-500/40',    desc: 'React, Node.js, APIs, HTML/CSS — builds real projects.' },
  { id: 'datascience', name: 'Dr. Insight',   emoji: '📊', tag: 'Data Science & ML',  color: 'from-orange-700/40 to-amber-600/40', border: 'border-orange-500/40',  desc: 'Statistics, pandas, numpy, scikit-learn explained intuitively.' },
  { id: 'math',        name: 'Prof. Euler',   emoji: '∑',  tag: 'Mathematics',         color: 'from-pink-700/40 to-rose-600/40',    border: 'border-pink-500/40',    desc: 'Calculus, algebra, proofs — made visual and intuitive.' },
  { id: 'ai',          name: 'Dr. Synapse',   emoji: '🤖', tag: 'AI & Deep Learning', color: 'from-purple-700/40 to-fuchsia-600/40',border: 'border-purple-500/40', desc: 'CNNs, LLMs, transformers, training loops explained fully.' },
];

const SUGGESTED_TOPICS = [
  'How computers think', 'Python for beginners', 'Machine Learning basics',
  'How the internet works', 'React.js fundamentals', 'What is blockchain',
  'Neural networks explained', 'SQL database design', 'Big O Notation',
  'Intro to Quantum Computing', 'Cloud Computing basics', 'Cybersecurity fundamentals',
  'Docker & Containers', 'Object-Oriented Programming', 'APIs explained in 5 mins',
  'Data Structures explained', 'Deep Learning vs ML', 'Basics of Cryptography',
  'How Operating Systems work', 'Intro to Agile methodology', 'UI/UX Design Principles'
];

// ─── Waveform ─────────────────────────────────────────────────────────────────
const Waveform = ({ isPlaying }) => (
  <div className="flex items-end gap-[2px] h-5">
    {[...Array(10)].map((_, i) => (
      <motion.div key={i} className="w-[3px] rounded-full bg-gradient-to-t from-indigo-600 to-cyan-400"
        animate={isPlaying ? { height: [`${5 + i % 3 * 3}px`, `${12 + Math.abs(Math.sin(i * 1.2)) * 14}px`, `${5 + i % 3 * 3}px`] } : { height: '3px' }}
        transition={{ duration: 0.5 + i * 0.05, repeat: Infinity, ease: 'easeInOut' }}
      />
    ))}
  </div>
);

// ─── Particles ────────────────────────────────────────────────────────────────
const Particles = ({ icon = '✨' }) => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(8)].map((_, i) => (
      <motion.div key={i} className="absolute select-none"
        style={{ left: `${10 + i * 11}%`, top: `${5 + (i % 3) * 28}%`, opacity: 0.05, fontSize: `${0.8 + (i % 2) * 0.5}rem` }}
        animate={{ y: [0, -25, 0], rotate: [0, 8, -8, 0], opacity: [0.04, 0.09, 0.04] }}
        transition={{ duration: 7 + i * 1.2, delay: i * 0.6, repeat: Infinity }}
      >{icon}</motion.div>
    ))}
  </div>
);

// ─── Karaoke Subtitle ─────────────────────────────────────────────────────────
const KaraokeSubtitle = ({ text, isPlaying, slideKey }) => {
  const words = (text || '').split(' ');
  const [activeWord, setActiveWord] = useState(-1);
  const timer = useRef(null);
  useEffect(() => {
    setActiveWord(-1); clearInterval(timer.current);
    if (!isPlaying || !words.length) return;
    const mspw = Math.max(160, (text.length / 13) * 1000 / words.length);
    let i = 0;
    timer.current = setInterval(() => { setActiveWord(i++); if (i >= words.length) clearInterval(timer.current); }, mspw);
    return () => clearInterval(timer.current);
  }, [slideKey, isPlaying]);
  return (
    <div className="px-5 py-4 rounded-2xl bg-black/50 border border-slate-900/5 dark:border-white/5 backdrop-blur-xl text-center leading-loose min-h-[60px]">
      {words.map((w, i) => (<span key={i} className={`inline-block mr-1.5 text-sm font-medium transition-all duration-75 ${i === activeWord ? 'text-slate-900 dark:text-white scale-110 drop-shadow-[0_0_8px_rgba(99,102,241,0.9)]' : i < activeWord ? 'text-slate-500' : 'text-slate-700'}`}>{w}</span>))}
    </div>
  );
};

// ═══ ANIMATION ENGINES ═══════════════════════════════════════════════════════
const FlowAnimation = ({ steps = [], isPlaying }) => {
  const [rev, setRev] = useState(0); const t = useRef(null);
  useEffect(() => { setRev(0); clearInterval(t.current); if (!isPlaying) return; let i = 1; t.current = setInterval(() => { setRev(i++); if (i > steps.length) clearInterval(t.current); }, 1800); return () => clearInterval(t.current); }, [isPlaying, steps.length]);
  return (<div className="flex flex-col gap-3">{steps.map((s, i) => (<React.Fragment key={i}><AnimatePresence>{i < rev && (<motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ type: 'spring', stiffness: 200 }} className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-indigo-900/40 to-slate-800/40 border border-indigo-500/20"><motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} className="w-11 h-11 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-xl shrink-0">{s.icon || '📌'}</motion.div><div className="flex-1"><div className="font-bold text-slate-900 dark:text-white text-sm">{s.label}</div><div className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">{s.description}</div></div><div className="text-xs font-black text-indigo-400 bg-indigo-500/10 rounded-lg px-2 py-1">{i + 1}</div></motion.div>)}</AnimatePresence>{i < steps.length - 1 && i < rev - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center"><motion.div animate={{ y: [0, 4, 0] }} transition={{ duration: 1, repeat: Infinity }} className="text-indigo-500 text-xl">↓</motion.div></motion.div>)}</React.Fragment>))}</div>);
};

const BuildupAnimation = ({ steps = [], isPlaying }) => {
  const [rev, setRev] = useState(0); const t = useRef(null);
  const colors = ['from-violet-900/50 border-violet-500/30', 'from-indigo-900/50 border-indigo-500/30', 'from-cyan-900/50 border-cyan-500/30', 'from-emerald-900/50 border-emerald-500/30'];
  useEffect(() => { setRev(0); clearInterval(t.current); if (!isPlaying) return; let i = 1; t.current = setInterval(() => { setRev(i++); if (i > steps.length) clearInterval(t.current); }, 1600); return () => clearInterval(t.current); }, [isPlaying, steps.length]);
  return (<div className="flex flex-col-reverse gap-2">{[...steps].reverse().map((s, ri) => { const idx = steps.length - 1 - ri; return (<AnimatePresence key={idx}>{idx < rev && (<motion.div initial={{ opacity: 0, y: -30, scaleX: 0.8 }} animate={{ opacity: 1, y: 0, scaleX: 1 }} transition={{ type: 'spring', stiffness: 180 }} className={`flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r to-slate-800/30 border ${colors[idx % colors.length]}`}><span className="text-3xl">{s.icon || '🧱'}</span><div><div className="font-bold text-slate-900 dark:text-white text-sm">{s.label}</div><div className="text-slate-500 dark:text-slate-400 text-xs">{s.description}</div></div></motion.div>)}</AnimatePresence>); })}</div>);
};

const ComparisonAnimation = ({ left, right, isPlaying }) => {
  const [rev, setRev] = useState(0); const t = useRef(null);
  useEffect(() => { setRev(0); clearInterval(t.current); if (!isPlaying) return; const max = Math.max(left?.points?.length || 0, right?.points?.length || 0); let i = 1; t.current = setInterval(() => { setRev(i++); if (i > max) clearInterval(t.current); }, 1400); return () => clearInterval(t.current); }, [isPlaying, left, right]);
  const Col = ({ data, color, fromLeft }) => (<motion.div initial={{ opacity: 0, x: fromLeft ? -60 : 60 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, type: 'spring' }} className={`flex-1 rounded-2xl border p-5 space-y-3 ${color}`}><div className="text-xs font-black uppercase tracking-widest text-white/70 mb-4">{data?.label}</div>{(data?.points || []).map((pt, i) => (<AnimatePresence key={i}>{i < rev && (<motion.div initial={{ opacity: 0, x: fromLeft ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300"><span className="w-1.5 h-1.5 rounded-full bg-current mt-1.5 shrink-0" />{pt}</motion.div>)}</AnimatePresence>))}</motion.div>);
  return (<div className="flex gap-4"><Col data={left} color="bg-indigo-900/30 border-indigo-500/30" fromLeft /><div className="flex items-center"><div className="w-px self-stretch bg-slate-900/10 dark:bg-white/10" /></div><Col data={right} color="bg-fuchsia-900/30 border-fuchsia-500/30" fromLeft={false} /></div>);
};

const CodeAnimation = ({ code = '', isPlaying }) => {
  const [shown, setShown] = useState(''); const t = useRef(null);
  useEffect(() => { setShown(''); clearInterval(t.current); if (!isPlaying || !code) return; let i = 0; t.current = setInterval(() => { setShown(code.slice(0, ++i)); if (i >= code.length) clearInterval(t.current); }, 25); return () => clearInterval(t.current); }, [isPlaying, code]);
  return (<div className="w-full rounded-2xl overflow-hidden border border-slate-900/10 dark:border-white/10 bg-slate-100 dark:bg-[#0B1121]"><div className="flex items-center gap-1.5 px-4 py-3 bg-slate-900/5 dark:bg-white/5 border-b border-slate-900/5 dark:border-white/5"><div className="w-3 h-3 rounded-full bg-red-500/70" /><div className="w-3 h-3 rounded-full bg-yellow-500/70" /><div className="w-3 h-3 rounded-full bg-green-500/70" /><span className="ml-3 text-xs text-slate-600 font-mono">snippet</span></div><pre className="p-6 text-sm text-emerald-400 font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed min-h-[100px]">{shown}{shown.length < code.length && isPlaying && <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.5, repeat: Infinity }}>|</motion.span>}</pre></div>);
};

const ConceptAnimation = ({ steps = [], icon, isPlaying }) => {
  const [rev, setRev] = useState(0); const t = useRef(null);
  const pos = [{ top: '5%', left: '50%', transform: 'translateX(-50%)' }, { top: '30%', right: '2%' }, { bottom: '5%', left: '50%', transform: 'translateX(-50%)' }, { top: '30%', left: '2%' }];
  useEffect(() => { setRev(0); clearInterval(t.current); if (!isPlaying) return; let i = 1; t.current = setInterval(() => { setRev(i++); if (i > steps.length) clearInterval(t.current); }, 1500); return () => clearInterval(t.current); }, [isPlaying, steps.length]);
  return (<div className="relative flex items-center justify-center" style={{ minHeight: '220px' }}><motion.div animate={isPlaying ? { scale: [1, 1.08, 1], boxShadow: ['0 0 0px rgba(99,102,241,0)', '0 0 30px rgba(99,102,241,0.4)', '0 0 0px rgba(99,102,241,0)'] } : {}} transition={{ duration: 2.5, repeat: Infinity }} className="absolute w-20 h-20 rounded-full bg-indigo-500/20 border-2 border-indigo-500/50 flex items-center justify-center text-4xl z-10" style={{ left: '50%', top: '50%', transform: 'translate(-50%,-50%)' }}>{icon || '💡'}</motion.div>{steps.slice(0, 4).map((s, i) => (<AnimatePresence key={i}>{i < rev && (<motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 200 }} className="absolute z-20 max-w-[120px] p-3 rounded-2xl bg-slate-800/80 border border-slate-900/10 dark:border-white/10 text-center shadow-lg" style={pos[i]}><div className="text-xl mb-1">{s.icon || '✦'}</div><div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{s.label}</div></motion.div>)}</AnimatePresence>))}</div>);
};

const SceneVisual = ({ scene, isPlaying }) => {
  switch (scene?.animationType) {
    case 'flow': return <FlowAnimation steps={scene.visualSteps || []} isPlaying={isPlaying} />;
    case 'buildup': return <BuildupAnimation steps={scene.visualSteps || []} isPlaying={isPlaying} />;
    case 'comparison': return <ComparisonAnimation left={scene.comparisonLeft} right={scene.comparisonRight} isPlaying={isPlaying} />;
    case 'code': return <CodeAnimation code={scene.codeSnippet || ''} isPlaying={isPlaying} />;
    default: return <ConceptAnimation steps={scene.visualSteps || []} icon={scene.icon} isPlaying={isPlaying} />;
  }
};

// ─── Interactive Q&A ──────────────────────────────────────────────────────────
const InteractiveScene = ({ scene, onAnswer, selectedChoice }) => (
  <div className="space-y-5">
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-3xl bg-gradient-to-br from-amber-900/30 to-orange-900/20 border border-amber-500/30">
      <div className="text-xs font-black text-amber-400 uppercase tracking-widest mb-3 flex items-center gap-2"><span>🎯</span> QUICK CHECK</div>
      <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white leading-snug">{scene.question}</h3>
    </motion.div>
    <div className="grid grid-cols-1 gap-3">
      {(scene.choices || []).map((ch, idx) => {
        const isSel = selectedChoice?.text === ch.text; const shown = !!selectedChoice;
        let style = 'bg-white/4 border-slate-900/10 dark:border-white/10 hover:bg-indigo-500/10 hover:border-indigo-500/40 cursor-pointer';
        let Icon = <span className="w-8 h-8 rounded-xl bg-slate-900/10 dark:bg-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400 font-black text-sm shrink-0">{String.fromCharCode(65 + idx)}</span>;
        if (shown && isSel && ch.isCorrect) { style = 'bg-emerald-500/20 border-emerald-500/60 cursor-default'; Icon = <CheckCircle className="w-8 h-8 text-emerald-400 shrink-0" />; }
        else if (shown && isSel && !ch.isCorrect) { style = 'bg-red-500/20 border-red-500/60 cursor-default'; Icon = <XCircle className="w-8 h-8 text-red-400 shrink-0" />; }
        else if (shown && ch.isCorrect) { style = 'bg-emerald-500/10 border-emerald-500/30 cursor-default opacity-70'; Icon = <CheckCircle className="w-8 h-8 text-emerald-400/60 shrink-0" />; }
        else if (shown) { style = 'opacity-40 border-slate-900/5 dark:border-white/5 cursor-default'; }
        return (<motion.button key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 * idx }} whileHover={!selectedChoice ? { x: 5 } : {}} onClick={() => !selectedChoice && onAnswer(ch)} className={`flex items-center gap-4 p-4 rounded-2xl border text-left transition-all ${style}`}>{Icon}<span className="text-sm font-medium text-slate-900 dark:text-white leading-snug">{ch.text}</span></motion.button>);
      })}
    </div>
    <AnimatePresence>{selectedChoice && (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`p-5 rounded-3xl border flex items-start gap-4 ${selectedChoice.isCorrect ? 'bg-emerald-900/30 border-emerald-500/30' : 'bg-slate-800/60 border-slate-900/10 dark:border-white/10'}`}><span className="text-3xl shrink-0">{selectedChoice.isCorrect ? '🥳' : '🤗'}</span><div><div className={`text-xs font-black uppercase tracking-widest mb-1 ${selectedChoice.isCorrect ? 'text-emerald-400' : 'text-amber-400'}`}>{selectedChoice.isCorrect ? '✓ Correct!' : 'Professor says:'}</div><p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">{selectedChoice.teacherResponse}</p></div></motion.div>)}</AnimatePresence>
  </div>
);

// ═══ MAIN COMPONENT ═══════════════════════════════════════════════════════════
const HoneyTeacher = () => {
  const [step, setStep] = useState('home');     // home | select-prof | loading | lesson
  const [topic, setTopic] = useState('');
  const [professor, setProfessor] = useState(null);
  const [customMode, setCustomMode] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customSpecialty, setCustomSpecialty] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [waitingForAnswer, setWaitingForAnswer] = useState(false);
  const [profMood, setProfMood] = useState('neutral');

  const synthRef = useRef(window.speechSynthesis);
  const progressRef = useRef(null);

  useEffect(() => () => { synthRef.current?.cancel(); clearInterval(progressRef.current); }, []);

  const startLesson = async () => {
    if (!topic.trim()) return;
    const prof = customMode ? { id: 'custom', name: customName || 'Custom Prof', tag: customSpecialty || 'Expert', desc: `An expert in ${customSpecialty || topic}, teaching deeply and clearly.` } : professor;
    setProfessor(prof);
    setStep('loading'); setError('');
    try {
      const res = await fetch(`${API_BASE}/ai/public-masterclass`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, teacherPersona: prof }),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const json = await res.json();
      setData(json);
      setCurrentSlide(0); setSelectedChoice(null); setProgress(0); setWaitingForAnswer(false);
      setStep('lesson');
    } catch (err) {
      setError(err.message || 'Failed to start lesson'); setStep('home');
    }
  };

  const speakText = useCallback((text, onDone) => {
    if (!synthRef.current || !text) { onDone?.(); return; }
    synthRef.current.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.92; u.pitch = 1.05;
    const voices = synthRef.current.getVoices();
    const best = voices.find(v => (v.name.includes('Google') || v.name.includes('Microsoft')) && v.lang.startsWith('en'));
    if (best) u.voice = best;
    u.onend = () => { setIsPlaying(false); onDone?.(); };
    u.onerror = () => { setIsPlaying(false); onDone?.(); };
    setIsPlaying(true);
    synthRef.current.speak(u);
  }, []);

  const playScene = useCallback((index) => {
    if (!data?.scenes || index >= data.scenes.length) { setIsPlaying(false); return; }
    const scene = data.scenes[index];
    setCurrentSlide(index); setSelectedChoice(null); setWaitingForAnswer(false); setProgress(0);
    clearInterval(progressRef.current); setProfMood('speaking');
    const est = (scene.teacherScript?.length || 100) * 70;
    let elapsed = 0;
    progressRef.current = setInterval(() => { elapsed += 100; setProgress(Math.min((elapsed / est) * 100, 97)); }, 100);
    speakText(scene.teacherScript, () => {
      clearInterval(progressRef.current); setProgress(100);
      if (scene.type === 'interactive') { setProfMood('thinking'); setWaitingForAnswer(true); setIsPlaying(false); }
      else { setProfMood('neutral'); setTimeout(() => { if (index + 1 < data.scenes.length) playScene(index + 1); }, 600); }
    });
  }, [data, speakText]);

  const handleAnswer = useCallback((choice) => {
    setSelectedChoice(choice); setWaitingForAnswer(false); setProfMood(choice.isCorrect ? 'correct' : 'wrong');
    speakText(choice.teacherResponse, () => {
      setProfMood('neutral');
      setTimeout(() => { if (currentSlide + 1 < (data?.scenes?.length || 0)) playScene(currentSlide + 1); }, 1000);
    });
  }, [currentSlide, data, speakText, playScene]);

  const stopAll = () => { synthRef.current?.cancel(); clearInterval(progressRef.current); setIsPlaying(false); setProgress(0); setWaitingForAnswer(false); };
  const restart = () => { stopAll(); setCurrentSlide(0); setSelectedChoice(null); setProfMood('neutral'); setTimeout(() => playScene(0), 80); };
  const reset = () => { stopAll(); setStep('home'); setData(null); setTopic(''); setProfessor(null); setCustomMode(false); };

  const profFaces = { neutral: professor?.emoji || '🧑‍🏫', correct: '🥳', wrong: '🤗', thinking: '🤔', speaking: professor?.emoji || '👨‍💼' };

  // ── HOME ──────────────────────────────────────────────────────────────────
  if (step === 'home' || step === 'select-prof') return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white relative overflow-hidden flex flex-col">
      <Particles icon="🐝" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.15),transparent_60%)] pointer-events-none" />

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 max-w-4xl mx-auto w-full">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full space-y-10">

          {/* Hero */}
          <div className="text-center space-y-4">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }} className="text-7xl mb-2">🐝</motion.div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Honey Teacher</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xl max-w-xl mx-auto font-medium">
              Your free AI professor. Pick any topic, choose an expert, and start an interactive animated lesson — instantly, no account needed.
            </p>
          </div>

          {/* Topic input */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
              <input
                value={topic} onChange={e => setTopic(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && topic.trim() && setStep('select-prof')}
                placeholder="What do you want to learn today? (e.g. Python loops, How DNS works...)"
                className="w-full pl-14 pr-6 py-5 rounded-2xl bg-slate-900/5 dark:bg-white/5 border border-slate-900/10 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-600 text-lg focus:outline-none focus:border-indigo-500/50 focus:bg-slate-900/10 dark:bg-white/8 transition-all"
              />
            </div>
            {/* Suggested topics - Filtered dynamically */}
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_TOPICS.filter(t => t.toLowerCase().includes(topic.toLowerCase())).map(t => (
                <button key={t} onClick={() => { setTopic(t); setStep('select-prof'); }}
                  className="px-3 py-1.5 rounded-xl bg-slate-900/5 dark:bg-white/5 border border-slate-900/10 dark:border-white/8 text-slate-500 dark:text-slate-400 text-xs font-medium hover:bg-slate-900/10 dark:bg-white/10 hover:text-slate-900 dark:text-white hover:border-indigo-500/30 transition-all">{t}</button>
              ))}
              {topic.trim() && SUGGESTED_TOPICS.filter(t => t.toLowerCase().includes(topic.toLowerCase())).length === 0 && (
                <div className="text-emerald-400 text-xs font-bold px-2 py-1 flex items-center gap-2">
                  <Sparkles className="w-3 h-3" /> Unique topic detected! Press Enter to discover it.
                </div>
              )}
            </div>
          </div>

          {/* Professor grid */}
          <AnimatePresence>
            {(step === 'select-prof' || topic.trim()) && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="text-sm font-black uppercase tracking-widest text-slate-600 text-center">Choose Your Professor</div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {PROFESSORS.map((prof, i) => (
                    <motion.button key={prof.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                      onClick={() => { setProfessor(prof); setCustomMode(false); }}
                      className={`relative p-4 rounded-2xl border text-left transition-all ${professor?.id === prof.id ? `bg-gradient-to-br ${prof.color} ${prof.border} scale-105 shadow-lg` : 'bg-slate-900/5 dark:bg-white/3 border-slate-900/10 dark:border-white/8 hover:bg-white/6 hover:border-slate-900/10 dark:border-white/15'}`}>
                      {professor?.id === prof.id && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-2 right-2 w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center"><CheckCircle className="w-2.5 h-2.5 text-slate-900 dark:text-white" /></motion.div>}
                      <div className="text-3xl mb-2">{prof.emoji}</div>
                      <div className="font-black text-slate-900 dark:text-white text-xs mb-0.5">{prof.name}</div>
                      <div className="text-[10px] text-indigo-400 uppercase tracking-widest">{prof.tag}</div>
                    </motion.button>
                  ))}
                </div>

                {/* Custom professor */}
                <div className={`p-4 rounded-2xl border transition-all ${customMode ? 'bg-amber-900/20 border-amber-500/40' : 'bg-slate-900/5 dark:bg-white/3 border-slate-900/10 dark:border-white/8 hover:border-slate-900/10 dark:border-white/15 cursor-pointer'}`}
                  onClick={() => !customMode && setCustomMode(true)}>
                  {!customMode ? (
                    <div className="flex items-center gap-3"><span className="text-2xl">✨</span><div><div className="font-black text-slate-900 dark:text-white text-sm">Custom Professor</div><div className="text-xs text-slate-500">Define any expertise — Flutter, MCAT, Blockchain...</div></div><Plus className="w-5 h-5 text-amber-400 ml-auto shrink-0" /></div>
                  ) : (
                    <div className="space-y-3" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-2 mb-3"><span className="text-2xl">✨</span><div className="font-black text-slate-900 dark:text-white text-sm">Custom Professor</div><button onClick={() => { setCustomMode(false); }} className="ml-auto p-1 bg-slate-900/10 dark:bg-white/10 rounded-lg"><X className="w-3 h-3" /></button></div>
                      <div className="grid grid-cols-2 gap-3">
                        <input value={customName} onChange={e => setCustomName(e.target.value)} placeholder="Name (e.g. Dr. Flutter)" className="px-3 py-2 rounded-xl bg-slate-900/10 dark:bg-white/8 border border-slate-900/10 dark:border-white/15 text-slate-900 dark:text-white placeholder-slate-600 text-sm focus:outline-none focus:border-amber-500/50" />
                        <input value={customSpecialty} onChange={e => setCustomSpecialty(e.target.value)} placeholder="Specialty (e.g. Flutter Dev)" className="px-3 py-2 rounded-xl bg-slate-900/10 dark:bg-white/8 border border-slate-900/10 dark:border-white/15 text-slate-900 dark:text-white placeholder-slate-600 text-sm focus:outline-none focus:border-amber-500/50" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Start button */}
                <motion.button onClick={startLesson} disabled={!topic.trim() || (!professor && !customMode)}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="w-full py-5 rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 text-slate-900 dark:text-white font-black text-lg shadow-[0_0_40px_rgba(99,102,241,0.4)] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all">
                  <Play className="w-6 h-6" />
                  {professor ? `Start with ${professor.name}` : customMode ? 'Start with Custom Prof' : 'Select a Professor First'}
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
                {error && <p className="text-red-400 text-sm text-center">{error}</p>}
              </motion.div>
            )}
          </AnimatePresence>

          {!topic.trim() && (
            <div className="text-center">
              <motion.button whileHover={{ scale: 1.03 }} onClick={() => setStep('select-prof')}
                className="px-10 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 font-bold text-lg transition-colors shadow-lg">
                Start Learning Free →
              </motion.button>
              <p className="text-slate-700 text-sm mt-3">No account required. Instant AI lesson in seconds.</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );

  // ── LOADING ───────────────────────────────────────────────────────────────
  if (step === 'loading') return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex flex-col items-center justify-center text-slate-900 dark:text-white gap-8">
      <Particles icon={professor?.emoji || '🐝'} />
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }} className="w-28 h-28 rounded-full border-t-4 border-indigo-500 flex items-center justify-center">
        <span className="text-5xl">{professor?.emoji || '🐝'}</span>
      </motion.div>
      <motion.h2 animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} className="text-2xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 text-center">
        {professor?.name || 'Prof. Nova'} is preparing your lesson...
      </motion.h2>
      <p className="text-slate-600 font-medium">{topic}</p>
    </div>
  );

  // ── LESSON PLAYER ─────────────────────────────────────────────────────────
  const scene = data?.scenes?.[currentSlide] || data?.scenes?.[0];
  if (!scene) return null;
  const totalSlides = data.scenes.length;
  const isInteractive = scene.type === 'interactive';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white flex flex-col overflow-hidden relative">
      <Particles icon={scene.icon} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(99,102,241,0.1),transparent_60%)] pointer-events-none" />

      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-slate-900/5 dark:bg-white/5 z-50">
        <motion.div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400"
          animate={{ width: `${(currentSlide / totalSlides) * 100 + (progress / totalSlides)}%` }} transition={{ duration: 0.3 }} />
      </div>

      {/* Header */}
      <header className="relative z-20 px-6 py-4 flex items-center gap-4 bg-black/30 backdrop-blur-2xl border-b border-slate-900/5 dark:border-white/5">
        <button onClick={reset} className="p-2 bg-slate-900/5 dark:bg-white/5 hover:bg-slate-900/10 dark:bg-white/10 rounded-xl transition-colors"><X className="w-5 h-5 text-slate-500 dark:text-slate-400" /></button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2"><Waveform isPlaying={isPlaying} /><span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{professor?.name} · {professor?.tag}</span></div>
          <h1 className="text-sm font-bold text-slate-900 dark:text-white truncate">{topic}</h1>
        </div>
        <div className="flex gap-1">{data.scenes.map((s, idx) => (<button key={idx} onClick={() => { stopAll(); setTimeout(() => playScene(idx), 80); }} className={`h-1.5 rounded-full transition-all ${idx === currentSlide ? 'w-8 bg-indigo-500' : 'w-1.5 bg-slate-800'}`} />))}</div>
      </header>

      {/* Body */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left stage */}
        <div className="flex-1 flex flex-col p-6 md:p-10 gap-5 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div key={currentSlide} initial={{ opacity: 0, y: 30, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.5, type: 'spring', stiffness: 130 }}
              className="rounded-[2.5rem] border border-slate-900/10 dark:border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-800/60 backdrop-blur-2xl overflow-hidden shadow-2xl">
              <div className={`px-8 py-5 border-b border-slate-900/5 dark:border-white/5 flex items-center gap-4 ${isInteractive ? 'bg-amber-500/5' : ''}`}>
                <motion.span className="text-4xl" animate={isPlaying ? { rotate: [0, 6, -6, 0] } : {}} transition={{ duration: 3, repeat: Infinity }}>{scene.icon || '💡'}</motion.span>
                <div className="flex-1 min-w-0">
                  <div className={`text-[10px] font-black uppercase tracking-widest mb-0.5 ${isInteractive ? 'text-amber-400' : 'text-indigo-400'}`}>Scene {currentSlide + 1} · {isInteractive ? '🎯 INTERACTIVE' : scene.animationType || 'concept'}</div>
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white truncate">{scene.title}</h2>
                </div>
                {waitingForAnswer && (<motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black">YOUR TURN</motion.div>)}
              </div>
              <div className="p-8 md:p-10">{isInteractive ? <InteractiveScene scene={scene} onAnswer={handleAnswer} selectedChoice={selectedChoice} /> : <SceneVisual scene={scene} isPlaying={isPlaying} />}</div>
              <motion.div className={`h-[2px] bg-gradient-to-r ${isInteractive ? 'from-amber-500 via-orange-500 to-red-500' : 'from-indigo-500 via-purple-500 to-cyan-500'}`} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.4, duration: 0.8 }} style={{ transformOrigin: 'left' }} />
            </motion.div>
          </AnimatePresence>
          <div>
            <div className="text-[10px] text-slate-600 font-black uppercase tracking-widest mb-2 flex items-center gap-2"><Volume2 className="w-3 h-3" /> Live Script</div>
            <KaraokeSubtitle text={scene.teacherScript} isPlaying={isPlaying} slideKey={currentSlide} />
          </div>
        </div>

        {/* Right controls */}
        <div className="w-full lg:w-72 flex flex-col gap-4 p-6 border-t lg:border-t-0 lg:border-l border-slate-900/5 dark:border-white/5 bg-black/20 backdrop-blur-3xl shrink-0">
          <div className="p-6 rounded-3xl bg-slate-900/5 dark:bg-white/3 border border-slate-900/10 dark:border-white/8 flex flex-col items-center gap-4">
            <motion.div animate={isPlaying ? { scale: [1, 1.05, 1] } : {}} transition={{ duration: 2, repeat: Infinity }} className="text-5xl">{profFaces[profMood]}</motion.div>
            <div className="text-center"><div className="text-xs font-bold text-slate-500 dark:text-slate-400">{professor?.name}</div><div className="text-[10px] text-indigo-400 uppercase tracking-widest">{professor?.tag}</div></div>
            {waitingForAnswer ? (
              <motion.div animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-full py-3 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold text-center">👆 Choose your answer!</motion.div>
            ) : (
              <div className="relative">
                {isPlaying && (<motion.div className="absolute inset-0 rounded-full border-2 border-indigo-500/40" animate={{ scale: [1, 1.4, 1], opacity: [0.8, 0, 0.8] }} transition={{ duration: 1.8, repeat: Infinity }} />)}
                <button onClick={() => { if (isPlaying) { synthRef.current?.pause(); setIsPlaying(false); } else { if (synthRef.current?.paused) { synthRef.current.resume(); setIsPlaying(true); } else playScene(currentSlide); } }}
                  className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.45)] hover:scale-105 active:scale-95 transition-all">
                  <AnimatePresence mode="wait">{isPlaying ? <motion.div key="p" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Pause className="w-6 h-6" /></motion.div> : <motion.div key="pl" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Play className="w-6 h-6 ml-0.5" /></motion.div>}</AnimatePresence>
                </button>
              </div>
            )}
            <div className="flex gap-2 w-full">
              <button onClick={restart} className="flex-1 py-2 bg-slate-900/5 dark:bg-white/5 hover:bg-slate-900/10 dark:bg-white/10 rounded-xl text-xs font-bold flex items-center justify-center gap-1 text-slate-600 dark:text-slate-300 transition-colors"><RotateCcw className="w-3 h-3" /> Restart</button>
              <button onClick={() => { stopAll(); if (currentSlide < totalSlides - 1) setTimeout(() => playScene(currentSlide + 1), 80); }} disabled={currentSlide >= totalSlides - 1} className="flex-1 py-2 bg-slate-900/5 dark:bg-white/5 hover:bg-slate-900/10 dark:bg-white/10 disabled:opacity-30 rounded-xl text-xs font-bold flex items-center justify-center gap-1 text-slate-600 dark:text-slate-300 transition-colors"><SkipForward className="w-3 h-3" /> Skip</button>
            </div>
            <div className="w-full space-y-1">
              <div className="flex justify-between text-[10px] text-slate-700"><span>Progress</span><span>{currentSlide + 1}/{totalSlides}</span></div>
              <div className="h-1 rounded-full bg-slate-900/5 dark:bg-white/5 overflow-hidden"><motion.div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400" animate={{ width: `${progress}%` }} transition={{ duration: 0.2 }} /></div>
            </div>
          </div>

          {/* Scene list */}
          <div className="flex-1 overflow-y-auto space-y-1.5">
            {data.scenes.map((s, idx) => (
              <motion.button key={idx} whileHover={{ x: 3 }} onClick={() => { stopAll(); setTimeout(() => playScene(idx), 80); }}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left border transition-all ${idx === currentSlide ? 'bg-indigo-600/20 border-indigo-500/40 text-slate-900 dark:text-white' : 'bg-slate-900/5 dark:bg-white/2 border-slate-900/5 dark:border-white/5 text-slate-500 hover:text-slate-700 dark:text-slate-200 hover:bg-slate-900/5 dark:bg-white/5'}`}>
                <span className="text-lg">{s.icon || (s.type === 'interactive' ? '🎯' : '📖')}</span>
                <div className="flex-1 min-w-0"><div className="text-xs font-bold truncate">{s.title}</div><div className="text-[10px] text-slate-600 uppercase">{s.type === 'interactive' ? '🎯 interactive' : s.animationType}</div></div>
              </motion.button>
            ))}
          </div>

          {/* CTA to sign up */}
          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-center">
            <Sparkles className="w-5 h-5 text-indigo-400 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-900 dark:text-white mb-0.5">Want to go deeper?</p>
            <p className="text-[10px] text-slate-500 mb-3">Upload your own materials and get lessons built from your exact course notes.</p>
            <a href="/register" className="block py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-slate-900 dark:text-white text-xs font-bold transition-colors">Create Free Account →</a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HoneyTeacher;
