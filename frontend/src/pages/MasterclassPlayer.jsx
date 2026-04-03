import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '../services/apiClient';
import { useAuth } from '../context/AuthContext';
import { Play, Pause, Volume2, Sparkles, Video, ChevronRight, X, SkipForward, RotateCcw, ArrowRight } from 'lucide-react';

// ─── Audio Waveform ─────────────────────────────────────────────────────────
const Waveform = ({ isPlaying }) => (
  <div className="flex items-end gap-[2px] h-5">
    {[...Array(10)].map((_, i) => (
      <motion.div
        key={i}
        className="w-[3px] rounded-full bg-gradient-to-t from-indigo-600 to-cyan-400"
        animate={isPlaying ? {
          height: [`${6 + (i % 3) * 3}px`, `${12 + Math.abs(Math.sin(i)) * 14}px`, `${6 + (i % 3) * 3}px`],
        } : { height: '3px' }}
        transition={{ duration: 0.5 + i * 0.05, repeat: Infinity, ease: 'easeInOut' }}
      />
    ))}
  </div>
);

// ─── Particles ──────────────────────────────────────────────────────────────
const Particles = ({ icon }) => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(10)].map((_, i) => (
      <motion.div key={i}
        className="absolute text-5xl select-none"
        style={{ left: `${10 + i * 9}%`, top: `${10 + (i % 3) * 25}%`, opacity: 0.04, fontSize: `${1 + (i % 2) * 0.6}rem` }}
        animate={{ y: [0, -30, 0], rotate: [0, 10, -10, 0], opacity: [0.04, 0.09, 0.04] }}
        transition={{ duration: 8 + i * 1.5, delay: i * 0.7, repeat: Infinity, ease: 'easeInOut' }}
      >{icon || '✨'}</motion.div>
    ))}
  </div>
);

// ─── Karaoke Subtitle ───────────────────────────────────────────────────────
const KaraokeSubtitle = ({ text, isPlaying, slideKey }) => {
  const words = (text || '').split(' ');
  const [activeWord, setActiveWord] = useState(-1);
  const timer = useRef(null);

  useEffect(() => {
    setActiveWord(-1);
    clearInterval(timer.current);
    if (!isPlaying || !words.length) return;
    const msPerWord = Math.max(180, (text.length / 13) * 1000 / words.length);
    let i = 0;
    timer.current = setInterval(() => {
      setActiveWord(i++);
      if (i >= words.length) clearInterval(timer.current);
    }, msPerWord);
    return () => clearInterval(timer.current);
  }, [slideKey, isPlaying]);

  return (
    <div className="px-5 py-4 rounded-2xl bg-black/50 border border-white/5 backdrop-blur-xl text-center leading-loose">
      {words.map((w, i) => (
        <span key={i}
          className={`inline-block mr-1.5 text-sm font-medium transition-all duration-100 ${
            i === activeWord ? 'text-white scale-110 drop-shadow-[0_0_8px_rgba(99,102,241,0.9)]'
            : i < activeWord ? 'text-slate-500'
            : 'text-slate-700'
          }`}
        >{w}</span>
      ))}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// ANIMATION ENGINES
// ═══════════════════════════════════════════════════════════════════

// ── 1. FLOW: Step-by-step process with animated arrows ──────────────────────
const FlowAnimation = ({ steps = [], isPlaying }) => {
  const [revealed, setRevealed] = useState(0);
  const timer = useRef(null);

  useEffect(() => {
    setRevealed(0);
    clearInterval(timer.current);
    if (!isPlaying) return;
    let i = 1;
    timer.current = setInterval(() => {
      setRevealed(i++);
      if (i > steps.length) clearInterval(timer.current);
    }, 2200);
    return () => clearInterval(timer.current);
  }, [isPlaying, steps]);

  return (
    <div className="flex flex-col gap-3 w-full">
      {steps.map((step, idx) => (
        <React.Fragment key={idx}>
          <AnimatePresence>
            {idx < revealed && (
              <motion.div
                initial={{ opacity: 0, x: -50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-indigo-900/40 to-slate-800/40 border border-indigo-500/20"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: idx * 0.3 }}
                  className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-2xl shrink-0"
                >
                  {step.icon || '📌'}
                </motion.div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-white text-sm">{step.label}</div>
                  {step.description && <div className="text-slate-400 text-xs mt-0.5 leading-snug">{step.description}</div>}
                </div>
                <div className="text-xs font-black text-indigo-400 bg-indigo-500/10 rounded-lg px-2 py-1 shrink-0">
                  {idx + 1}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {idx < steps.length - 1 && idx < revealed - 1 && (
            <motion.div initial={{ opacity: 0, scaleY: 0 }} animate={{ opacity: 1, scaleY: 1 }} className="flex justify-center">
              <motion.div
                animate={{ y: [0, 4, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-indigo-500 text-lg"
              >↓</motion.div>
            </motion.div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// ── 2. BUILDUP: Stacking blocks that accumulate ──────────────────────────────
const BuildupAnimation = ({ steps = [], isPlaying }) => {
  const [revealed, setRevealed] = useState(0);
  const timer = useRef(null);
  const colors = ['from-violet-900/50 to-violet-800/30 border-violet-500/30', 'from-indigo-900/50 to-indigo-800/30 border-indigo-500/30', 'from-cyan-900/50 to-cyan-800/30 border-cyan-500/30', 'from-emerald-900/50 to-emerald-800/30 border-emerald-500/30'];

  useEffect(() => {
    setRevealed(0);
    clearInterval(timer.current);
    if (!isPlaying) return;
    let i = 1;
    timer.current = setInterval(() => {
      setRevealed(i++);
      if (i > steps.length) clearInterval(timer.current);
    }, 1800);
    return () => clearInterval(timer.current);
  }, [isPlaying, steps]);

  return (
    <div className="flex flex-col-reverse gap-2 w-full">
      {[...steps].reverse().map((step, rIdx) => {
        const idx = steps.length - 1 - rIdx;
        return (
          <AnimatePresence key={idx}>
            {idx < revealed && (
              <motion.div
                initial={{ opacity: 0, y: -30, scaleX: 0.8 }}
                animate={{ opacity: 1, y: 0, scaleX: 1 }}
                transition={{ type: 'spring', stiffness: 180, damping: 22 }}
                className={`flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r border ${colors[idx % colors.length]}`}
                style={{ zIndex: steps.length - idx }}
              >
                <span className="text-3xl">{step.icon || '🧱'}</span>
                <div>
                  <div className="font-bold text-white text-sm">{step.label}</div>
                  {step.description && <div className="text-slate-400 text-xs">{step.description}</div>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        );
      })}
    </div>
  );
};

// ── 3. COMPARISON: Two columns side by side ──────────────────────────────────
const ComparisonAnimation = ({ left, right, isPlaying }) => {
  const [revealedLeft, setRevealedLeft] = useState(0);
  const [revealedRight, setRevealedRight] = useState(0);
  const timer = useRef(null);

  useEffect(() => {
    setRevealedLeft(0);
    setRevealedRight(0);
    clearInterval(timer.current);
    if (!isPlaying) return;
    const leftPts = left?.points || [];
    const rightPts = right?.points || [];
    const max = Math.max(leftPts.length, rightPts.length);
    let i = 1;
    timer.current = setInterval(() => {
      setRevealedLeft(i);
      setRevealedRight(i);
      i++;
      if (i > max) clearInterval(timer.current);
    }, 1600);
    return () => clearInterval(timer.current);
  }, [isPlaying, left, right]);

  const Col = ({ data, color, fromLeft, revealed }) => (
    <motion.div
      initial={{ opacity: 0, x: fromLeft ? -60 : 60 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7, type: 'spring', stiffness: 120 }}
      className={`flex-1 rounded-2xl border p-5 space-y-3 ${color}`}
    >
      <div className="text-sm font-black uppercase tracking-widest text-white/80 mb-4">{data?.label || '—'}</div>
      {(data?.points || []).map((pt, i) => (
        <AnimatePresence key={i}>
          {i < revealed && (
            <motion.div
              initial={{ opacity: 0, x: fromLeft ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-start gap-2 text-sm text-slate-300 leading-snug"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current mt-1.5 shrink-0" />
              {pt}
            </motion.div>
          )}
        </AnimatePresence>
      ))}
    </motion.div>
  );

  return (
    <div className="flex gap-4 w-full">
      <Col data={left} color="bg-indigo-900/30 border-indigo-500/30" fromLeft={true} revealed={revealedLeft} />
      <div className="flex items-center">
        <div className="w-px h-full bg-white/10 relative">
          <motion.div
            animate={{ y: ['-20%', '80%', '-20%'] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]"
          />
        </div>
      </div>
      <Col data={right} color="bg-fuchsia-900/30 border-fuchsia-500/30" fromLeft={false} revealed={revealedRight} />
    </div>
  );
};

// ── 4. CODE: Animated typing effect ─────────────────────────────────────────
const CodeAnimation = ({ code = '', isPlaying }) => {
  const [displayed, setDisplayed] = useState('');
  const timer = useRef(null);

  useEffect(() => {
    setDisplayed('');
    clearInterval(timer.current);
    if (!isPlaying || !code) return;
    let i = 0;
    timer.current = setInterval(() => {
      setDisplayed(code.slice(0, ++i));
      if (i >= code.length) clearInterval(timer.current);
    }, 28);
    return () => clearInterval(timer.current);
  }, [isPlaying, code]);

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#0B1121]">
      <div className="flex items-center gap-1.5 px-4 py-3 bg-white/5 border-b border-white/5">
        <div className="w-3 h-3 rounded-full bg-red-500/70" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
        <div className="w-3 h-3 rounded-full bg-green-500/70" />
        <span className="ml-3 text-xs text-slate-600 font-mono">code.snippet</span>
        <motion.div
          className="ml-auto w-2 h-4 bg-emerald-400 rounded-sm"
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
      </div>
      <pre className="p-6 text-sm text-emerald-400 font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed min-h-[120px]">
        {displayed}
        {displayed.length < code.length && isPlaying && (
          <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.5, repeat: Infinity }} className="text-emerald-400">|</motion.span>
        )}
      </pre>
    </div>
  );
};

// ── 5. CONCEPT: Central idea with radiating fact bubbles ─────────────────────
const ConceptAnimation = ({ steps = [], icon, isPlaying }) => {
  const [revealed, setRevealed] = useState(0);
  const timer = useRef(null);
  const positions = [
    { top: '0%', left: '50%', transform: 'translateX(-50%)' },
    { top: '25%', right: '0%' },
    { bottom: '0%', left: '50%', transform: 'translateX(-50%)' },
    { top: '25%', left: '0%' },
  ];

  useEffect(() => {
    setRevealed(0);
    clearInterval(timer.current);
    if (!isPlaying) return;
    let i = 1;
    timer.current = setInterval(() => {
      setRevealed(i++);
      if (i > steps.length) clearInterval(timer.current);
    }, 1600);
    return () => clearInterval(timer.current);
  }, [isPlaying, steps]);

  return (
    <div className="relative w-full flex items-center justify-center" style={{ minHeight: '260px' }}>
      {/* Center */}
      <motion.div
        animate={isPlaying ? { scale: [1, 1.08, 1], boxShadow: ['0 0 0px rgba(99,102,241,0)', '0 0 30px rgba(99,102,241,0.4)', '0 0 0px rgba(99,102,241,0)'] } : {}}
        transition={{ duration: 2.5, repeat: Infinity }}
        className="absolute z-10 w-24 h-24 rounded-full bg-indigo-500/20 border-2 border-indigo-500/50 flex items-center justify-center text-5xl shadow-xl"
        style={{ left: '50%', top: '50%', transform: 'translate(-50%,-50%)' }}
      >
        {icon || '💡'}
      </motion.div>

      {/* Radiating bubbles */}
      {steps.slice(0, 4).map((step, idx) => (
        <AnimatePresence key={idx}>
          {idx < revealed && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 18 }}
              className="absolute z-20 max-w-[130px] p-3 rounded-2xl bg-slate-800/80 border border-white/10 backdrop-blur-sm text-center shadow-lg"
              style={positions[idx]}
            >
              <div className="text-xl mb-1">{step.icon || '✦'}</div>
              <div className="text-xs font-bold text-white leading-tight">{step.label}</div>
              {step.description && <div className="text-[10px] text-slate-500 mt-1 leading-snug">{step.description}</div>}
              {/* Line to center — approximated as an absolutely positioned bar */}
            </motion.div>
          )}
        </AnimatePresence>
      ))}
    </div>
  );
};

// ─── Scene Renderer: picks the right animation engine ───────────────────────
const SceneVisual = ({ scene, isPlaying }) => {
  const type = scene?.animationType || 'concept';

  switch (type) {
    case 'flow':
      return <FlowAnimation steps={scene.visualSteps || []} isPlaying={isPlaying} />;
    case 'buildup':
      return <BuildupAnimation steps={scene.visualSteps || []} isPlaying={isPlaying} />;
    case 'comparison':
      return <ComparisonAnimation left={scene.comparisonLeft} right={scene.comparisonRight} isPlaying={isPlaying} />;
    case 'code':
      return <CodeAnimation code={scene.codeSnippet || ''} isPlaying={isPlaying} />;
    case 'concept':
    default:
      return <ConceptAnimation steps={scene.visualSteps || []} icon={scene.icon} isPlaying={isPlaying} />;
  }
};

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════
const MasterclassPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);

  const synthRef = useRef(window.speechSynthesis);
  const progressRef = useRef(null);

  useEffect(() => {
    fetchMasterclass();
    return () => { synthRef.current?.cancel(); clearInterval(progressRef.current); };
  }, [id, token]);

  const fetchMasterclass = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.post('/ai/masterclass', { materialId: id }, { token });
      setData(response);
    } catch (err) {
      setError(err.message || 'Failed to initialize the AI Masterclass.');
    } finally {
      setLoading(false);
    }
  };

  const playScene = useCallback((index) => {
    if (!data?.scenes || index >= data.scenes.length || !synthRef.current) {
      setIsPlaying(false); clearInterval(progressRef.current); return;
    }
    setCurrentSlide(index);
    setProgress(0);
    clearInterval(progressRef.current);
    synthRef.current.cancel();

    const scene = data.scenes[index];
    const utterance = new SpeechSynthesisUtterance(scene.teacherScript);
    utterance.rate = 0.95;
    utterance.pitch = 1.1;
    const voices = synthRef.current.getVoices();
    const best = voices.find(v => (v.name.includes('Google') || v.name.includes('Microsoft')) && v.lang.startsWith('en'));
    if (best) utterance.voice = best;

    utterance.onstart = () => {
      setIsPlaying(true);
      const est = scene.teacherScript.length * 70;
      let elapsed = 0;
      clearInterval(progressRef.current);
      progressRef.current = setInterval(() => {
        elapsed += 100;
        setProgress(Math.min((elapsed / est) * 100, 97));
      }, 100);
    };
    utterance.onend = () => {
      clearInterval(progressRef.current);
      setProgress(100);
      setTimeout(() => {
        if (index + 1 < data.scenes.length) playScene(index + 1);
        else { setIsPlaying(false); setProgress(0); }
      }, 700);
    };
    utterance.onerror = () => { setIsPlaying(false); clearInterval(progressRef.current); };
    synthRef.current.speak(utterance);
  }, [data]);

  const togglePlay = () => {
    if (!synthRef.current) return;
    if (isPlaying) {
      synthRef.current.pause(); setIsPlaying(false); clearInterval(progressRef.current);
    } else {
      if (synthRef.current.paused) { synthRef.current.resume(); setIsPlaying(true); }
      else playScene(currentSlide);
    }
  };

  const stopAll = () => { synthRef.current?.cancel(); clearInterval(progressRef.current); setIsPlaying(false); setProgress(0); };
  const restart = () => { stopAll(); setCurrentSlide(0); setTimeout(() => playScene(0), 100); };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center text-white gap-8">
      <Particles icon="🧠" />
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        className="w-28 h-28 rounded-full border-t-4 border-indigo-500 flex items-center justify-center">
        <Sparkles className="w-10 h-10 text-indigo-400 animate-pulse" />
      </motion.div>
      <motion.h2 animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}
        className="text-2xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
        Building your Virtual Professor...
      </motion.h2>
      <div className="flex gap-3">
        {['Analyzing Content', 'Writing Script', 'Designing Animations'].map((s, i) => (
          <motion.div key={i} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, delay: i * 0.5, repeat: Infinity }}
            className="px-4 py-2 rounded-full bg-white/4 border border-white/10 text-slate-500 text-xs font-bold">{s}</motion.div>
        ))}
      </div>
    </div>
  );

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error || !data?.scenes?.length) return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center text-white">
      <div className="text-center space-y-4">
        <div className="text-6xl">💔</div>
        <h2 className="text-2xl font-bold">Assembly Failed</h2>
        <p className="text-red-400">{error || 'AI could not structure this lesson.'}</p>
        <button onClick={() => navigate(-1)} className="mt-6 px-8 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 font-bold transition-colors">Go Back</button>
      </div>
    </div>
  );

  const scene = data.scenes[currentSlide] || data.scenes[0];
  const totalSlides = data.scenes.length;

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col overflow-hidden relative">
      <Particles icon={scene.icon} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(99,102,241,0.1),transparent_60%)] pointer-events-none" />

      {/* Global progress */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-white/5 z-50">
        <motion.div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 shadow-[0_0_8px_rgba(99,102,241,0.8)]"
          animate={{ width: `${(currentSlide / totalSlides) * 100 + (progress / totalSlides)}%` }}
          transition={{ duration: 0.3 }} />
      </div>

      {/* Header */}
      <header className="relative z-20 px-6 py-4 flex items-center justify-between bg-black/30 backdrop-blur-2xl border-b border-white/5">
        <div className="flex items-center gap-4">
          <button onClick={() => { stopAll(); navigate(-1); }} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-indigo-400">
              <Waveform isPlaying={isPlaying} />
              <span className="text-[10px] font-black uppercase tracking-widest">Honey AI · Virtual Professor</span>
            </div>
            <h1 className="text-sm font-bold text-white truncate max-w-xs md:max-w-md mt-0.5">{data.topic || 'Masterclass'}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600 hidden md:block">{currentSlide + 1}/{totalSlides}</span>
          <div className="flex gap-1">
            {data.scenes.map((_, idx) => (
              <button key={idx} onClick={() => { stopAll(); setTimeout(() => playScene(idx), 80); }}
                className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-8 bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.9)]' : 'w-1.5 bg-slate-800 hover:bg-slate-600'}`} />
            ))}
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">

        {/* Left: Scene stage */}
        <div className="flex-1 flex flex-col p-6 md:p-10 gap-6 overflow-y-auto">

          {/* Scene card */}
          <AnimatePresence mode="wait">
            <motion.div key={currentSlide}
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.96 }}
              transition={{ duration: 0.55, type: 'spring', stiffness: 130 }}
              className="rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-800/60 backdrop-blur-2xl overflow-hidden shadow-2xl"
            >
              {/* Scene header strip */}
              <div className="px-8 py-5 border-b border-white/5 flex items-center gap-4">
                <motion.span className="text-4xl"
                  animate={isPlaying ? { rotate: [0, 6, -6, 0] } : {}}
                  transition={{ duration: 3, repeat: Infinity }}
                >{scene.icon || '💡'}</motion.span>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mb-0.5">
                    Scene {currentSlide + 1} · {scene.animationType?.toUpperCase() || 'CONCEPT'}
                  </div>
                  <h2 className="text-xl md:text-2xl font-black text-white truncate">{scene.title}</h2>
                </div>
                <motion.div className="shrink-0 w-2 h-2 rounded-full bg-indigo-400"
                  animate={isPlaying ? { opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] } : { opacity: 0.2 }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              </div>

              {/* Animation stage */}
              <div className="p-8 md:p-10">
                <SceneVisual scene={scene} isPlaying={isPlaying} />
              </div>

              {/* Animated underline accent */}
              <motion.div className="h-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500"
                initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.4, duration: 0.8 }}
                style={{ transformOrigin: 'left' }}
              />
            </motion.div>
          </AnimatePresence>

          {/* Karaoke */}
          <div>
            <div className="text-[10px] text-slate-600 font-black uppercase tracking-widest mb-2 flex items-center gap-2">
              <Volume2 className="w-3 h-3" /> Live Professor Script
            </div>
            <KaraokeSubtitle text={scene.teacherScript} isPlaying={isPlaying} slideKey={currentSlide} />
          </div>
        </div>

        {/* Right: Controls sidebar */}
        <div className="w-full lg:w-80 xl:w-96 flex flex-col gap-4 p-6 border-t lg:border-t-0 lg:border-l border-white/5 bg-black/20 backdrop-blur-3xl shrink-0">

          {/* Play Controls */}
          <div className="p-7 rounded-3xl bg-white/3 border border-white/8 flex flex-col items-center gap-5">
            <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Audio Engine</div>
            <div className="relative">
              {isPlaying && (
                <motion.div className="absolute inset-0 rounded-full border-2 border-indigo-500/40"
                  animate={{ scale: [1, 1.4, 1], opacity: [0.8, 0, 0.8] }}
                  transition={{ duration: 1.8, repeat: Infinity }} />
              )}
              <button onClick={togglePlay}
                className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center shadow-[0_0_40px_rgba(99,102,241,0.45)] hover:scale-105 active:scale-95 transition-all">
                <AnimatePresence mode="wait">
                  {isPlaying
                    ? <motion.div key="p" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Pause className="w-8 h-8" /></motion.div>
                    : <motion.div key="pl" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Play className="w-8 h-8 ml-1" /></motion.div>}
                </AnimatePresence>
              </button>
            </div>
            <div className="flex gap-2 w-full">
              <button onClick={restart} className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 text-slate-300 transition-colors">
                <RotateCcw className="w-3.5 h-3.5" /> Restart
              </button>
              <button onClick={() => { stopAll(); if (currentSlide < totalSlides - 1) setTimeout(() => playScene(currentSlide + 1), 80); }}
                disabled={currentSlide >= totalSlides - 1}
                className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 text-slate-300 transition-colors">
                <SkipForward className="w-3.5 h-3.5" /> Next
              </button>
            </div>
            {/* Scene progress bar */}
            <div className="w-full space-y-1">
              <div className="flex justify-between text-[10px] text-slate-700">
                <span>Scene progress</span><span>{Math.round(progress)}%</span>
              </div>
              <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                <motion.div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                  animate={{ width: `${progress}%` }} transition={{ duration: 0.2 }} />
              </div>
            </div>
          </div>

          {/* Scene Navigator */}
          <div className="flex-1 overflow-y-auto space-y-1.5">
            <div className="text-[10px] text-slate-600 font-black uppercase tracking-widest px-1 mb-2">Lesson Scenes</div>
            {data.scenes.map((s, idx) => (
              <motion.button key={idx} whileHover={{ x: 4 }}
                onClick={() => { stopAll(); setTimeout(() => playScene(idx), 80); }}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left border transition-all ${
                  idx === currentSlide
                    ? 'bg-indigo-600/20 border-indigo-500/40 text-white'
                    : 'bg-white/2 border-white/5 text-slate-500 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <span className="text-xl">{s.icon || '📖'}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold truncate">{s.title}</div>
                  <div className="text-[10px] text-slate-600 uppercase tracking-widest">{s.animationType || 'concept'}</div>
                </div>
                {idx === currentSlide && isPlaying && (
                  <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1, repeat: Infinity }}
                    className="w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
                )}
              </motion.button>
            ))}
          </div>

          {/* YouTube */}
          {data.youtubeQuery && (
            <button onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(data.youtubeQuery)}`, '_blank')}
              className="w-full p-5 rounded-3xl bg-[#FF0000]/6 hover:bg-[#FF0000]/12 border border-[#FF0000]/20 transition-all text-left">
              <Video className="w-5 h-5 text-[#FF0000] mb-2" />
              <p className="text-xs font-bold text-white mb-1">Watch Real Examples</p>
              <p className="text-[11px] text-slate-600 truncate">"{data.youtubeQuery}"</p>
            </button>
          )}
        </div>
      </main>
    </div>
  );
};

export default MasterclassPlayer;
