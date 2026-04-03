import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '../services/apiClient';
import { useAuth } from '../context/AuthContext';
import { Play, Pause, Sparkles, Video, X, SkipForward, RotateCcw, Volume2, CheckCircle, XCircle, Plus, ChevronRight } from 'lucide-react';

// ─── Built-in Professor Personas ─────────────────────────────────────────────
const BUILT_IN_PROFESSORS = [
  { id: 'general',    name: 'Prof. Nova',      emoji: '🌟', tag: 'Universal Expert',    color: 'from-indigo-600/40 to-violet-600/40', border: 'border-indigo-500/40', desc: 'World-class generalist. Explains anything with vivid analogies and clear examples.' },
  { id: 'python',     name: 'Dr. Pythia',      emoji: '🐍', tag: 'Python & Algorithms',  color: 'from-emerald-700/40 to-green-600/40', border: 'border-emerald-500/40', desc: 'Deep Python expertise—from basics to advanced OOP, data structures, and algorithm optimization.' },
  { id: 'webdev',     name: 'Prof. Stack',     emoji: '🌐', tag: 'Full-Stack Web Dev',   color: 'from-blue-700/40 to-cyan-600/40',    border: 'border-blue-500/40',    desc: 'React, Node.js, APIs, HTML/CSS. Builds real projects as examples step by step.' },
  { id: 'datascience',name: 'Dr. Insight',     emoji: '📊', tag: 'Data Science & ML',   color: 'from-orange-700/40 to-amber-600/40', border: 'border-orange-500/40',  desc: 'Statistics, pandas, numpy, scikit-learn, and neural networks explained intuitively.' },
  { id: 'math',       name: 'Prof. Euler',     emoji: '∑',  tag: 'Mathematics',          color: 'from-pink-700/40 to-rose-600/40',    border: 'border-pink-500/40',    desc: 'Discrete math, calculus, linear algebra, and proofs—made visual and intuitive.' },
  { id: 'ai',         name: 'Dr. Synapse',     emoji: '🤖', tag: 'AI & Deep Learning',  color: 'from-purple-700/40 to-fuchsia-600/40',border: 'border-purple-500/40', desc: 'CNNs, LLMs, transformers, training loops. Teaches AI from concept to implementation.' },
  { id: 'java',       name: 'Prof. Brew',      emoji: '☕', tag: 'Java & OOP',           color: 'from-red-700/40 to-orange-600/40',   border: 'border-red-500/40',     desc: 'Java fundamentals, design patterns, Spring Boot, and enterprise-grade architecture.' },
  { id: 'security',   name: 'Dr. Cipher',      emoji: '🔐', tag: 'Cybersecurity',        color: 'from-slate-700/40 to-zinc-600/40',   border: 'border-slate-500/40',   desc: 'Network security, cryptography, penetration testing basics, and defensive coding.' },
];

// ─── Professor Selection Screen ───────────────────────────────────────────────
const TeacherSelector = ({ onSelect }) => {
  const [selected, setSelected] = useState(null);
  const [customMode, setCustomMode] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customSpecialty, setCustomSpecialty] = useState('');
  const [customDesc, setCustomDesc] = useState('');

  const handleStart = () => {
    if (customMode) {
      if (!customName.trim() || !customSpecialty.trim()) return;
      onSelect({ id: 'custom', name: customName, emoji: '✨', tag: customSpecialty, desc: customDesc || `An expert in ${customSpecialty} who teaches everything deeply and clearly.` });
    } else if (selected) {
      onSelect(selected);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.15),transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(168,85,247,0.1),transparent_60%)] pointer-events-none" />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: 'spring' }}
            className="text-6xl mb-4">🎓</motion.div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3">
            Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Virtual Professor</span>
          </h1>
          <p className="text-slate-400 text-lg font-medium max-w-xl mx-auto">
            Each professor has a unique teaching style and deep domain expertise. Pick one — or create your own.
          </p>
        </div>

        {/* Built-in professors grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {BUILT_IN_PROFESSORS.map((prof, i) => (
            <motion.button
              key={prof.id}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              onClick={() => { setSelected(prof); setCustomMode(false); }}
              className={`relative p-5 rounded-3xl border text-left transition-all group ${
                selected?.id === prof.id
                  ? `bg-gradient-to-br ${prof.color} ${prof.border} shadow-lg scale-105`
                  : 'bg-white/3 border-white/8 hover:bg-white/6 hover:border-white/15'
              }`}
            >
              {selected?.id === prof.id && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-3 right-3 w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 text-white" />
                </motion.div>
              )}
              <div className="text-4xl mb-3">{prof.emoji}</div>
              <div className="font-black text-white text-sm mb-0.5">{prof.name}</div>
              <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2">{prof.tag}</div>
              <div className="text-xs text-slate-500 leading-snug">{prof.desc}</div>
            </motion.button>
          ))}
        </div>

        {/* Custom Professor Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className={`p-6 rounded-3xl border mb-8 transition-all ${customMode ? 'bg-gradient-to-br from-amber-900/30 to-yellow-900/20 border-amber-500/40' : 'bg-white/3 border-white/8 hover:border-white/15 cursor-pointer'}`}
          onClick={() => !customMode && setCustomMode(true)}
        >
          {!customMode ? (
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-3xl">✨</div>
              <div>
                <div className="font-black text-white">Add Your Own Professor</div>
                <div className="text-sm text-slate-500">Define a custom teaching persona — e.g., "Flutter Expert", "MCAT Biology Tutor", "Blockchain Developer"</div>
              </div>
              <Plus className="w-6 h-6 text-amber-400 ml-auto shrink-0" />
            </div>
          ) : (
            <div className="space-y-4" onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">✨</span>
                <div>
                  <div className="font-black text-white">Custom Professor</div>
                  <div className="text-xs text-amber-400 uppercase tracking-widest">AI will fully adopt this teaching identity</div>
                </div>
                <button onClick={() => { setCustomMode(false); setSelected(null); }} className="ml-auto p-1 bg-white/10 rounded-lg"><X className="w-4 h-4" /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-2 block">Professor Name *</label>
                  <input value={customName} onChange={e => setCustomName(e.target.value)} placeholder="e.g. Dr. Flutter" className="w-full px-4 py-3 rounded-2xl bg-white/8 border border-white/15 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-amber-500/50" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-2 block">Specialty / Domain *</label>
                  <input value={customSpecialty} onChange={e => setCustomSpecialty(e.target.value)} placeholder="e.g. Flutter Mobile Dev, MCAT Biology" className="w-full px-4 py-3 rounded-2xl bg-white/8 border border-white/15 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-amber-500/50" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-2 block">Teaching Style (optional)</label>
                  <input value={customDesc} onChange={e => setCustomDesc(e.target.value)} placeholder="e.g. Uses real app-building examples, covers from basics to production-ready patterns" className="w-full px-4 py-3 rounded-2xl bg-white/8 border border-white/15 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-amber-500/50" />
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Start button */}
        <div className="flex justify-center">
          <motion.button
            onClick={handleStart}
            disabled={!selected && !customMode}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="px-12 py-5 rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-lg shadow-[0_0_40px_rgba(99,102,241,0.5)] disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-3 transition-all"
          >
            <Play className="w-6 h-6" />
            {selected ? `Start with ${selected.name}` : customMode ? 'Start with Custom Professor' : 'Select a Professor First'}
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Waveform ────────────────────────────────────────────────────────────────
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

// ─── Particles ───────────────────────────────────────────────────────────────
const Particles = ({ icon }) => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(8)].map((_, i) => (
      <motion.div key={i} className="absolute select-none"
        style={{ left: `${10 + i * 11}%`, top: `${5 + (i % 3) * 28}%`, opacity: 0.05, fontSize: `${0.8 + (i % 2) * 0.5}rem` }}
        animate={{ y: [0, -25, 0], rotate: [0, 8, -8, 0], opacity: [0.05, 0.1, 0.05] }}
        transition={{ duration: 7 + i * 1.2, delay: i * 0.6, repeat: Infinity }}
      >{icon || '✨'}</motion.div>
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
    <div className="px-5 py-4 rounded-2xl bg-black/50 border border-white/5 backdrop-blur-xl text-center leading-loose min-h-[60px]">
      {words.map((w, i) => (
        <span key={i} className={`inline-block mr-1.5 text-sm font-medium transition-all duration-75 ${i === activeWord ? 'text-white scale-110 drop-shadow-[0_0_8px_rgba(99,102,241,0.9)]' : i < activeWord ? 'text-slate-500' : 'text-slate-700'}`}>{w}</span>
      ))}
    </div>
  );
};

// ─── Professor Avatar ─────────────────────────────────────────────────────────
const ProfessorAvatar = ({ isPlaying, mood, professor }) => {
  const faces = { neutral: professor?.emoji || '🧑‍🏫', correct: '🥳', wrong: '🤗', thinking: '🤔', speaking: professor?.emoji || '👨‍💼' };
  return (
    <div className="flex flex-col items-center gap-1">
      <motion.div animate={isPlaying ? { scale: [1, 1.05, 1], rotate: [0, 1, -1, 0] } : {}} transition={{ duration: 2, repeat: Infinity }} className="text-5xl">{faces[mood] || faces.neutral}</motion.div>
      <div className="text-xs font-bold text-slate-400">{professor?.name || 'Prof. Nova'}</div>
      <div className="text-[10px] text-indigo-400 uppercase tracking-widest">{professor?.tag || 'Universal Expert'}</div>
      {isPlaying && (
        <div className="flex gap-0.5 mt-1">
          {[0, 1, 2].map(i => (<motion.div key={i} className="w-1 h-1 rounded-full bg-indigo-400" animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }} transition={{ duration: 0.7, delay: i * 0.15, repeat: Infinity }} />))}
        </div>
      )}
    </div>
  );
};

// ═══ ANIMATION ENGINES ═══════════════════════════════════════════════════════
const FlowAnimation = ({ steps = [], isPlaying }) => {
  const [rev, setRev] = useState(0); const t = useRef(null);
  useEffect(() => { setRev(0); clearInterval(t.current); if (!isPlaying) return; let i = 1; t.current = setInterval(() => { setRev(i++); if (i > steps.length) clearInterval(t.current); }, 2000); return () => clearInterval(t.current); }, [isPlaying, steps.length]);
  return (
    <div className="flex flex-col gap-3">
      {steps.map((s, i) => (
        <React.Fragment key={i}>
          <AnimatePresence>{i < rev && (<motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ type: 'spring', stiffness: 200 }} className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-indigo-900/40 to-slate-800/40 border border-indigo-500/20">
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-2xl shrink-0">{s.icon || '📌'}</motion.div>
            <div className="flex-1"><div className="font-bold text-white text-sm">{s.label}</div><div className="text-slate-400 text-xs mt-0.5">{s.description}</div></div>
            <div className="text-xs font-black text-indigo-400 bg-indigo-500/10 rounded-lg px-2 py-1">{i + 1}</div>
          </motion.div>)}</AnimatePresence>
          {i < steps.length - 1 && i < rev - 1 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center"><motion.div animate={{ y: [0, 4, 0] }} transition={{ duration: 1, repeat: Infinity }} className="text-indigo-500 text-xl">↓</motion.div></motion.div>)}
        </React.Fragment>
      ))}
    </div>
  );
};

const BuildupAnimation = ({ steps = [], isPlaying }) => {
  const [rev, setRev] = useState(0); const t = useRef(null);
  const colors = ['from-violet-900/50 border-violet-500/30', 'from-indigo-900/50 border-indigo-500/30', 'from-cyan-900/50 border-cyan-500/30', 'from-emerald-900/50 border-emerald-500/30'];
  useEffect(() => { setRev(0); clearInterval(t.current); if (!isPlaying) return; let i = 1; t.current = setInterval(() => { setRev(i++); if (i > steps.length) clearInterval(t.current); }, 1800); return () => clearInterval(t.current); }, [isPlaying, steps.length]);
  return (
    <div className="flex flex-col-reverse gap-2">
      {[...steps].reverse().map((s, ri) => { const idx = steps.length - 1 - ri; return (<AnimatePresence key={idx}>{idx < rev && (<motion.div initial={{ opacity: 0, y: -30, scaleX: 0.8 }} animate={{ opacity: 1, y: 0, scaleX: 1 }} transition={{ type: 'spring', stiffness: 180 }} className={`flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r to-slate-800/30 border ${colors[idx % colors.length]}`}><span className="text-3xl">{s.icon || '🧱'}</span><div><div className="font-bold text-white text-sm">{s.label}</div><div className="text-slate-400 text-xs">{s.description}</div></div></motion.div>)}</AnimatePresence>); })}
    </div>
  );
};

const ComparisonAnimation = ({ left, right, isPlaying }) => {
  const [revL, setRevL] = useState(0); const [revR, setRevR] = useState(0); const t = useRef(null);
  useEffect(() => { setRevL(0); setRevR(0); clearInterval(t.current); if (!isPlaying) return; const max = Math.max(left?.points?.length || 0, right?.points?.length || 0); let i = 1; t.current = setInterval(() => { setRevL(i); setRevR(i); i++; if (i > max) clearInterval(t.current); }, 1600); return () => clearInterval(t.current); }, [isPlaying, left, right]);
  const Col = ({ data, color, fromLeft, rev }) => (<motion.div initial={{ opacity: 0, x: fromLeft ? -60 : 60 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, type: 'spring' }} className={`flex-1 rounded-2xl border p-5 space-y-3 ${color}`}><div className="text-sm font-black uppercase tracking-widest text-white/80 mb-4">{data?.label}</div>{(data?.points || []).map((pt, i) => (<AnimatePresence key={i}>{i < rev && (<motion.div initial={{ opacity: 0, x: fromLeft ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-start gap-2 text-sm text-slate-300"><span className="w-1.5 h-1.5 rounded-full bg-current mt-1.5 shrink-0" />{pt}</motion.div>)}</AnimatePresence>))}</motion.div>);
  return (<div className="flex gap-4"><Col data={left} color="bg-indigo-900/30 border-indigo-500/30" fromLeft rev={revL} /><div className="flex items-center"><div className="w-px self-stretch bg-white/10 relative"><motion.div animate={{ y: ['-20%', '80%', '-20%'] }} transition={{ duration: 3, repeat: Infinity }} className="absolute left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" /></div></div><Col data={right} color="bg-fuchsia-900/30 border-fuchsia-500/30" fromLeft={false} rev={revR} /></div>);
};

const CodeAnimation = ({ code = '', isPlaying }) => {
  const [shown, setShown] = useState(''); const t = useRef(null);
  useEffect(() => { setShown(''); clearInterval(t.current); if (!isPlaying || !code) return; let i = 0; t.current = setInterval(() => { setShown(code.slice(0, ++i)); if (i >= code.length) clearInterval(t.current); }, 25); return () => clearInterval(t.current); }, [isPlaying, code]);
  return (<div className="w-full rounded-2xl overflow-hidden border border-white/10 bg-[#0B1121]"><div className="flex items-center gap-1.5 px-4 py-3 bg-white/5 border-b border-white/5"><div className="w-3 h-3 rounded-full bg-red-500/70" /><div className="w-3 h-3 rounded-full bg-yellow-500/70" /><div className="w-3 h-3 rounded-full bg-green-500/70" /><span className="ml-3 text-xs text-slate-600 font-mono">snippet</span>{isPlaying && <motion.div animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.8, repeat: Infinity }} className="ml-auto w-2 h-4 bg-emerald-400 rounded-sm" />}</div><pre className="p-6 text-sm text-emerald-400 font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed min-h-[100px]">{shown}{shown.length < code.length && isPlaying && <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.5, repeat: Infinity }}>|</motion.span>}</pre></div>);
};

const ConceptAnimation = ({ steps = [], icon, isPlaying }) => {
  const [rev, setRev] = useState(0); const t = useRef(null);
  const pos = [{ top: '5%', left: '50%', transform: 'translateX(-50%)' }, { top: '30%', right: '2%' }, { bottom: '5%', left: '50%', transform: 'translateX(-50%)' }, { top: '30%', left: '2%' }];
  useEffect(() => { setRev(0); clearInterval(t.current); if (!isPlaying) return; let i = 1; t.current = setInterval(() => { setRev(i++); if (i > steps.length) clearInterval(t.current); }, 1600); return () => clearInterval(t.current); }, [isPlaying, steps.length]);
  return (<div className="relative flex items-center justify-center" style={{ minHeight: '240px' }}><motion.div animate={isPlaying ? { scale: [1, 1.08, 1], boxShadow: ['0 0 0px rgba(99,102,241,0)', '0 0 30px rgba(99,102,241,0.4)', '0 0 0px rgba(99,102,241,0)'] } : {}} transition={{ duration: 2.5, repeat: Infinity }} className="absolute w-20 h-20 rounded-full bg-indigo-500/20 border-2 border-indigo-500/50 flex items-center justify-center text-4xl z-10" style={{ left: '50%', top: '50%', transform: 'translate(-50%,-50%)' }}>{icon || '💡'}</motion.div>{steps.slice(0, 4).map((s, i) => (<AnimatePresence key={i}>{i < rev && (<motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 200 }} className="absolute z-20 max-w-[120px] p-3 rounded-2xl bg-slate-800/80 border border-white/10 text-center shadow-lg" style={pos[i]}><div className="text-xl mb-1">{s.icon || '✦'}</div><div className="text-xs font-bold text-white leading-tight">{s.label}</div>{s.description && <div className="text-[10px] text-slate-500 mt-1">{s.description}</div>}</motion.div>)}</AnimatePresence>))}</div>);
};

// ─── Interactive Q&A ──────────────────────────────────────────────────────────
const InteractiveScene = ({ scene, onAnswer, selectedChoice }) => (
  <div className="space-y-6">
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
      className="p-6 rounded-3xl bg-gradient-to-br from-amber-900/30 to-orange-900/20 border border-amber-500/30 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl" />
      <div className="text-xs font-black text-amber-400 uppercase tracking-widest mb-3 flex items-center gap-2"><span className="text-lg">🎯</span> QUICK CHECK — Test Your Understanding</div>
      <h3 className="text-xl md:text-2xl font-bold text-white leading-snug relative z-10">{scene.question}</h3>
    </motion.div>
    <div className="grid grid-cols-1 gap-3">
      {(scene.choices || []).map((choice, idx) => {
        const isSel = selectedChoice?.text === choice.text; const shown = !!selectedChoice;
        let style = 'bg-white/4 border-white/10 hover:bg-indigo-500/10 hover:border-indigo-500/40 cursor-pointer';
        let Icon = <span className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-slate-400 font-black text-sm shrink-0">{String.fromCharCode(65 + idx)}</span>;
        if (shown && isSel && choice.isCorrect) { style = 'bg-emerald-500/20 border-emerald-500/60 cursor-default'; Icon = <CheckCircle className="w-8 h-8 text-emerald-400 shrink-0" />; }
        else if (shown && isSel && !choice.isCorrect) { style = 'bg-red-500/20 border-red-500/60 cursor-default'; Icon = <XCircle className="w-8 h-8 text-red-400 shrink-0" />; }
        else if (shown && choice.isCorrect) { style = 'bg-emerald-500/10 border-emerald-500/30 cursor-default opacity-70'; Icon = <CheckCircle className="w-8 h-8 text-emerald-400/60 shrink-0" />; }
        else if (shown) { style = 'bg-white/2 border-white/5 cursor-default opacity-40'; }
        return (<motion.button key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + idx * 0.1 }} whileHover={!selectedChoice ? { x: 6 } : {}} onClick={() => !selectedChoice && onAnswer(choice)} className={`flex items-center gap-4 p-4 rounded-2xl border text-left transition-all ${style}`}>{Icon}<span className="text-sm font-medium text-white leading-snug">{choice.text}</span></motion.button>);
      })}
    </div>
    <AnimatePresence>{selectedChoice && (<motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.2 }} className={`p-5 rounded-3xl border flex items-start gap-4 ${selectedChoice.isCorrect ? 'bg-emerald-900/30 border-emerald-500/30' : 'bg-slate-800/60 border-white/10'}`}><span className="text-3xl shrink-0">{selectedChoice.isCorrect ? '🥳' : '🤗'}</span><div><div className={`text-xs font-black uppercase tracking-widest mb-1 ${selectedChoice.isCorrect ? 'text-emerald-400' : 'text-amber-400'}`}>{selectedChoice.isCorrect ? '✓ Correct! Professor says:' : 'Professor says:'}</div><p className="text-sm text-slate-200 leading-relaxed font-medium">{selectedChoice.teacherResponse}</p></div></motion.div>)}</AnimatePresence>
  </div>
);

const SceneVisual = ({ scene, isPlaying }) => {
  switch (scene?.animationType) {
    case 'flow': return <FlowAnimation steps={scene.visualSteps || []} isPlaying={isPlaying} />;
    case 'buildup': return <BuildupAnimation steps={scene.visualSteps || []} isPlaying={isPlaying} />;
    case 'comparison': return <ComparisonAnimation left={scene.comparisonLeft} right={scene.comparisonRight} isPlaying={isPlaying} />;
    case 'code': return <CodeAnimation code={scene.codeSnippet || ''} isPlaying={isPlaying} />;
    default: return <ConceptAnimation steps={scene.visualSteps || []} icon={scene.icon} isPlaying={isPlaying} />;
  }
};

// ═══ MAIN COMPONENT ═══════════════════════════════════════════════════════════
const MasterclassPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [professor, setProfessor] = useState(null); // null = show selector
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const [professorMood, setProfessorMood] = useState('neutral');
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [waitingForAnswer, setWaitingForAnswer] = useState(false);

  const synthRef = useRef(window.speechSynthesis);
  const progressRef = useRef(null);

  const handleProfessorSelect = async (prof) => {
    setProfessor(prof);
    setLoading(true); setError('');
    try {
      const response = await apiClient.post('/ai/public-masterclass', {
        materialId: id,
        teacherPersona: {
          id: prof.id,
          name: prof.name,
          tag: prof.tag,
          desc: prof.desc,
        }
      });
      setData(response);
    } catch (err) {
      setError(err.message || 'Failed to initialize the AI Masterclass.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => { synthRef.current?.cancel(); clearInterval(progressRef.current); };
  }, []);

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
    clearInterval(progressRef.current); setProfessorMood('speaking');
    const est = (scene.teacherScript?.length || 100) * 70;
    let elapsed = 0;
    progressRef.current = setInterval(() => { elapsed += 100; setProgress(Math.min((elapsed / est) * 100, 97)); }, 100);
    speakText(scene.teacherScript, () => {
      clearInterval(progressRef.current); setProgress(100);
      if (scene.type === 'interactive') { setProfessorMood('thinking'); setWaitingForAnswer(true); setIsPlaying(false); }
      else { setProfessorMood('neutral'); setTimeout(() => { if (index + 1 < data.scenes.length) playScene(index + 1); }, 800); }
    });
  }, [data, speakText]);

  const handleAnswer = useCallback((choice) => {
    setSelectedChoice(choice); setWaitingForAnswer(false); setProfessorMood(choice.isCorrect ? 'correct' : 'wrong');
    speakText(choice.teacherResponse, () => {
      setProfessorMood('neutral');
      setTimeout(() => { if (currentSlide + 1 < (data?.scenes?.length || 0)) playScene(currentSlide + 1); }, 1200);
    });
  }, [currentSlide, data, speakText, playScene]);

  const stopAll = () => { synthRef.current?.cancel(); clearInterval(progressRef.current); setIsPlaying(false); setProgress(0); setWaitingForAnswer(false); };
  const restart = () => { stopAll(); setCurrentSlide(0); setSelectedChoice(null); setProfessorMood('neutral'); setTimeout(() => playScene(0), 100); };

  // ── Professor selector screen
  if (!professor) return <TeacherSelector onSelect={handleProfessorSelect} />;

  // ── Loading
  if (loading) return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center text-white gap-8">
      <Particles icon={professor.emoji} />
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }} className="w-28 h-28 rounded-full border-t-4 border-indigo-500 flex items-center justify-center">
        <span className="text-5xl">{professor.emoji}</span>
      </motion.div>
      <motion.h2 animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} className="text-2xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 text-center">
        {professor.name} is preparing your lesson...
      </motion.h2>
      <p className="text-slate-600 text-sm font-medium">{professor.tag}</p>
    </div>
  );

  // ── Error
  if (error || !data?.scenes?.length) return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center text-white">
      <div className="text-center space-y-4">
        <div className="text-6xl">💔</div><h2 className="text-2xl font-bold">Lesson Failed</h2>
        <p className="text-red-400">{error || 'AI could not structure this lesson.'}</p>
        <div className="flex gap-3 justify-center mt-6">
          <button onClick={() => { setProfessor(null); setData(null); setError(''); }} className="px-8 py-3 rounded-2xl bg-white/10 hover:bg-white/15 font-bold transition-colors">Change Professor</button>
          <button onClick={() => navigate(-1)} className="px-8 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 font-bold transition-colors">Go Back</button>
        </div>
      </div>
    </div>
  );

  const scene = data.scenes[currentSlide] || data.scenes[0];
  const totalSlides = data.scenes.length;
  const isInteractive = scene?.type === 'interactive';

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col overflow-hidden relative">
      <Particles icon={scene.icon} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(99,102,241,0.1),transparent_60%)] pointer-events-none" />

      {/* Progress */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-white/5 z-50">
        <motion.div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 shadow-[0_0_8px_rgba(99,102,241,0.8)]"
          animate={{ width: `${(currentSlide / totalSlides) * 100 + (progress / totalSlides)}%` }} transition={{ duration: 0.3 }} />
      </div>

      {/* Header */}
      <header className="relative z-20 px-6 py-4 flex items-center justify-between bg-black/30 backdrop-blur-2xl border-b border-white/5">
        <div className="flex items-center gap-4">
          <button onClick={() => { stopAll(); navigate(-1); }} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"><X className="w-5 h-5 text-slate-400" /></button>
          <div>
            <div className="flex items-center gap-2">
              <Waveform isPlaying={isPlaying} />
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{professor.name} · {professor.tag}</span>
              {isInteractive && <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-widest border border-amber-500/30 animate-pulse">Interactive</span>}
            </div>
            <h1 className="text-sm font-bold text-white truncate max-w-xs md:max-w-md mt-0.5">{data.topic || 'Masterclass'}</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => { stopAll(); setProfessor(null); setData(null); }} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-slate-400 transition-colors">Change Prof.</button>
          <div className="flex gap-1">
            {data.scenes.map((s, idx) => (<button key={idx} onClick={() => { stopAll(); setTimeout(() => playScene(idx), 80); }} className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentSlide ? (s.type === 'interactive' ? 'w-8 bg-amber-400' : 'w-8 bg-indigo-500') : 'w-1.5 bg-slate-800 hover:bg-slate-600'}`} />))}
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className="flex-1 flex flex-col p-6 md:p-10 gap-5 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div key={currentSlide} initial={{ opacity: 0, y: 30, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -30, scale: 0.96 }} transition={{ duration: 0.55, type: 'spring', stiffness: 130 }}
              className="rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-800/60 backdrop-blur-2xl overflow-hidden shadow-2xl">
              <div className={`px-8 py-5 border-b border-white/5 flex items-center gap-4 ${isInteractive ? 'bg-amber-500/5' : ''}`}>
                <motion.span className="text-4xl" animate={isPlaying ? { rotate: [0, 6, -6, 0] } : {}} transition={{ duration: 3, repeat: Infinity }}>{scene.icon || '💡'}</motion.span>
                <div className="flex-1 min-w-0">
                  <div className={`text-[10px] font-black uppercase tracking-widest mb-0.5 ${isInteractive ? 'text-amber-400' : 'text-indigo-400'}`}>Scene {currentSlide + 1} · {isInteractive ? '🎯 INTERACTIVE CHECK' : (scene.animationType || 'concept').toUpperCase()}</div>
                  <h2 className="text-xl md:text-2xl font-black text-white truncate">{scene.title}</h2>
                </div>
                {waitingForAnswer && (<motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }} transition={{ duration: 1.5, repeat: Infinity }} className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black">YOUR TURN</motion.div>)}
              </div>
              <div className="p-8 md:p-10">{isInteractive ? <InteractiveScene scene={scene} onAnswer={handleAnswer} selectedChoice={selectedChoice} /> : <SceneVisual scene={scene} isPlaying={isPlaying} />}</div>
              <motion.div className={`h-[2px] bg-gradient-to-r ${isInteractive ? 'from-amber-500 via-orange-500 to-red-500' : 'from-indigo-500 via-purple-500 to-cyan-500'}`} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.4, duration: 0.8 }} style={{ transformOrigin: 'left' }} />
            </motion.div>
          </AnimatePresence>
          <div>
            <div className="text-[10px] text-slate-600 font-black uppercase tracking-widest mb-2 flex items-center gap-2"><Volume2 className="w-3 h-3" /> {professor.name} — Live Script</div>
            <KaraokeSubtitle text={scene.teacherScript} isPlaying={isPlaying} slideKey={currentSlide} />
          </div>
        </div>

        {/* Right panel */}
        <div className="w-full lg:w-80 xl:w-96 flex flex-col gap-4 p-6 border-t lg:border-t-0 lg:border-l border-white/5 bg-black/20 backdrop-blur-3xl shrink-0">
          <div className="p-7 rounded-3xl bg-white/3 border border-white/8 flex flex-col items-center gap-5">
            <ProfessorAvatar isPlaying={isPlaying} mood={professorMood} professor={professor} />
            {waitingForAnswer ? (
              <motion.div animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-full py-3 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-300 text-sm font-bold text-center">👆 Choose your answer above!</motion.div>
            ) : (
              <div className="relative">
                {isPlaying && (<motion.div className="absolute inset-0 rounded-full border-2 border-indigo-500/40" animate={{ scale: [1, 1.4, 1], opacity: [0.8, 0, 0.8] }} transition={{ duration: 1.8, repeat: Infinity }} />)}
                <button onClick={() => { if (isPlaying) { synthRef.current?.pause(); setIsPlaying(false); } else { if (synthRef.current?.paused) { synthRef.current.resume(); setIsPlaying(true); } else playScene(currentSlide); } }}
                  className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center shadow-[0_0_40px_rgba(99,102,241,0.45)] hover:scale-105 active:scale-95 transition-all">
                  <AnimatePresence mode="wait">{isPlaying ? <motion.div key="p" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Pause className="w-8 h-8" /></motion.div> : <motion.div key="pl" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Play className="w-8 h-8 ml-1" /></motion.div>}</AnimatePresence>
                </button>
              </div>
            )}
            <div className="flex gap-2 w-full">
              <button onClick={restart} className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 text-slate-300 transition-colors"><RotateCcw className="w-3.5 h-3.5" /> Restart</button>
              <button onClick={() => { stopAll(); if (currentSlide < totalSlides - 1) setTimeout(() => playScene(currentSlide + 1), 80); }} disabled={currentSlide >= totalSlides - 1} className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 text-slate-300 transition-colors"><SkipForward className="w-3.5 h-3.5" /> Skip</button>
            </div>
            <div className="w-full space-y-1">
              <div className="flex justify-between text-[10px] text-slate-700"><span>Scene progress</span><span>{Math.round(progress)}%</span></div>
              <div className="h-1 rounded-full bg-white/5 overflow-hidden"><motion.div className={`h-full rounded-full ${isInteractive ? 'bg-amber-400' : 'bg-gradient-to-r from-indigo-500 to-cyan-400'}`} animate={{ width: `${progress}%` }} transition={{ duration: 0.2 }} /></div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5">
            <div className="text-[10px] text-slate-600 font-black uppercase tracking-widest px-1 mb-2">Lesson Scenes</div>
            {data.scenes.map((s, idx) => (
              <motion.button key={idx} whileHover={{ x: 4 }} onClick={() => { stopAll(); setTimeout(() => playScene(idx), 80); }}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left border transition-all ${idx === currentSlide ? (s.type === 'interactive' ? 'bg-amber-500/20 border-amber-500/40 text-white' : 'bg-indigo-600/20 border-indigo-500/40 text-white') : 'bg-white/2 border-white/5 text-slate-500 hover:text-slate-200 hover:bg-white/5'}`}>
                <span className="text-xl">{s.icon || (s.type === 'interactive' ? '🎯' : '📖')}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold truncate">{s.title}</div>
                  <div className={`text-[10px] uppercase tracking-widest ${s.type === 'interactive' ? 'text-amber-500/70' : 'text-slate-600'}`}>{s.type === 'interactive' ? '🎯 interactive' : (s.animationType || 'concept')}</div>
                </div>
                {idx === currentSlide && isPlaying && (<motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1, repeat: Infinity }} className={`w-2 h-2 rounded-full shrink-0 ${s.type === 'interactive' ? 'bg-amber-400' : 'bg-indigo-400'}`} />)}
              </motion.button>
            ))}
          </div>

          {data.youtubeQuery && (
            <button onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(data.youtubeQuery)}`, '_blank')} className="w-full p-5 rounded-3xl bg-[#FF0000]/6 hover:bg-[#FF0000]/12 border border-[#FF0000]/20 transition-all text-left">
              <Video className="w-5 h-5 text-[#FF0000] mb-2" /><p className="text-xs font-bold text-white mb-1">Watch Real Examples</p><p className="text-[11px] text-slate-600 truncate">"{data.youtubeQuery}"</p>
            </button>
          )}
        </div>
      </main>
    </div>
  );
};

export default MasterclassPlayer;
