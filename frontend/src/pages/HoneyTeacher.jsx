import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '../services/apiClient';
import { useAuth } from '../context/AuthContext';
import { 
  Play, Pause, Sparkles, Video, X, SkipForward, RotateCcw, 
  Volume2, CheckCircle, XCircle, Plus, ChevronRight, Search, BrainCircuit 
} from 'lucide-react';

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
  }, [slideKey, isPlaying, text, words.length]);
  return (
    <div className="px-5 py-4 rounded-2xl bg-white/70 dark:bg-black/50 border border-slate-200 dark:border-white/5 backdrop-blur-xl text-center leading-loose min-h-[60px] transition-colors">
      {words.map((w, i) => (
        <span key={i} className={`inline-block mr-1.5 text-sm font-medium transition-all duration-75 ${i === activeWord ? 'text-indigo-600 dark:text-white scale-110 drop-shadow-[0_0_8px_rgba(99,102,241,0.4)]' : i < activeWord ? 'text-slate-400 dark:text-slate-500' : 'text-slate-300 dark:text-slate-700'}`}>{w}</span>
      ))}
    </div>
  );
};

const ProfessorAvatar = ({ isPlaying, mood, professor }) => {
  const faces = { neutral: professor?.emoji || '🧑‍🏫', correct: '🥳', wrong: '🤗', thinking: '🤔', speaking: professor?.emoji || '👨‍💼' };
  return (
    <div className="flex flex-col items-center gap-1">
      <motion.div animate={isPlaying ? { scale: [1, 1.05, 1], rotate: [0, 1, -1, 0] } : {}} transition={{ duration: 2, repeat: Infinity }} className="text-5xl">{faces[mood] || faces.neutral}</motion.div>
      <div className="text-xs font-bold text-slate-500 dark:text-slate-400">{professor?.name || 'Prof. Nova'}</div>
      <div className="text-[10px] text-indigo-500 dark:text-indigo-400 uppercase tracking-widest font-black">{professor?.tag || 'Universal Expert'}</div>
      {isPlaying && (
        <div className="flex gap-0.5 mt-1">
          {[0, 1, 2].map(i => (<motion.div key={i} className="w-1 h-1 rounded-full bg-indigo-500 dark:bg-indigo-400" animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }} transition={{ duration: 0.7, delay: i * 0.15, repeat: Infinity }} />))}
        </div>
      )}
    </div>
  );
};

const TeacherSelector = ({ topic, onSelect }) => {
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
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-5xl">
      <div className="text-center mb-12">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="inline-block px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
          Session Topic: {topic}
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3 text-slate-900 dark:text-white">
          Match with your <span className="gradient-text">Perfect Tutor</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg font-medium max-w-xl mx-auto">
          Hive AI will adopt this persona to teach you {topic} deeply and professionally.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {BUILT_IN_PROFESSORS.map((prof, i) => (
          <motion.button
            key={prof.id}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            onClick={() => { setSelected(prof); setCustomMode(false); }}
            className={`relative p-5 rounded-3xl border text-left transition-all group ${
              selected?.id === prof.id
                ? `bg-indigo-50 dark:bg-white/5 border-indigo-500 dark:border-indigo-400 shadow-xl scale-105`
                : 'bg-white dark:bg-white/3 border-slate-200 dark:border-white/8 hover:bg-slate-50 dark:hover:bg-white/6 hover:border-indigo-300 dark:hover:border-white/15'
            }`}
          >
            {selected?.id === prof.id && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-3 right-3 w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                <CheckCircle className="w-3 h-3" />
              </motion.div>
            )}
            <div className="text-4xl mb-3">{prof.emoji}</div>
            <div className="font-black text-slate-900 dark:text-white text-sm mb-0.5">{prof.name}</div>
            <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-2">{prof.tag}</div>
            <div className="text-xs text-slate-500 leading-snug">{prof.desc}</div>
          </motion.button>
        ))}
      </div>

      <motion.div className={`p-6 rounded-3xl border mb-8 transition-all ${customMode ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-500/40' : 'bg-white dark:bg-white/3 border-slate-200 dark:border-white/8 hover:border-slate-300 dark:hover:border-white/15 cursor-pointer'}`}
        onClick={() => !customMode && setCustomMode(true)}
      >
        {!customMode ? (
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-3xl">✨</div>
            <div>
              <div className="font-black text-slate-900 dark:text-white">Create a Specialty Professor</div>
              <div className="text-sm text-slate-500">Pick a specific identity tailored to your niche topic or teaching preference.</div>
            </div>
            <Plus className="w-6 h-6 text-amber-500 ml-auto shrink-0" />
          </div>
        ) : (
          <div className="space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">✨</span>
              <div className="font-black text-slate-900 dark:text-white">Custom Expert Definition</div>
              <button onClick={() => { setCustomMode(false); setSelected(null); }} className="ml-auto p-1 bg-slate-100 dark:bg-white/10 rounded-lg text-slate-500 dark:text-slate-400"><X className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input value={customName} onChange={e => setCustomName(e.target.value)} placeholder="Professor Name" className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-white/8 border border-slate-200 dark:border-white/15 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none" />
              <input value={customSpecialty} onChange={e => setCustomSpecialty(e.target.value)} placeholder="Specialty (e.g. Physics, History)" className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-white/8 border border-slate-200 dark:border-white/15 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none" />
              <input value={customDesc} onChange={e => setCustomDesc(e.target.value)} placeholder="Brief description of teaching style..." className="md:col-span-2 w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-white/8 border border-slate-200 dark:border-white/15 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none" />
            </div>
          </div>
        )}
      </motion.div>

      <div className="flex justify-center">
        <motion.button onClick={handleStart} disabled={!selected && !customMode} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="px-12 py-5 rounded-3xl bg-indigo-600 text-white font-black text-lg disabled:opacity-30 flex items-center gap-3 transition-all shadow-xl hover:shadow-indigo-500/40">
          <Play className="w-6 h-6" /> Start Tutorial <ChevronRight className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.div>
  );
};

const SceneVisual = ({ scene, isPlaying }) => {
  const steps = scene.visualSteps || [];
  
  if (scene.animationType === 'code') {
    return <div className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-[#0B1121] p-6 text-sm text-emerald-400 font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-inner">{scene.codeSnippet}</div>;
  }
  
  return (
    <div className="flex flex-col gap-4">
      {steps.map((s, i) => (
        <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.2 }}
          className="flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 shadow-sm">
          <div className="text-3xl bg-slate-50 dark:bg-white/5 w-12 h-12 rounded-xl flex items-center justify-center shrink-0">{s.icon || '📌'}</div>
          <div>
            <div className="font-black text-slate-900 dark:text-white text-base">{s.label}</div>
            <div className="text-slate-500 dark:text-slate-400 text-xs font-medium">{s.description}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const InteractiveScene = ({ scene, onAnswer, selectedChoice }) => (
  <div className="space-y-6">
    <div className="p-6 rounded-3xl bg-amber-500/10 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-500/30">
      <div className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Sparkles className="w-3 h-3"/> Active Practice</div>
      <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">{scene.question}</h3>
    </div>
    <div className="grid grid-cols-1 gap-3">
      {(scene.choices || []).map((choice, idx) => {
        const isSel = selectedChoice?.text === choice.text;
        const shown = !!selectedChoice;
        let style = 'bg-white dark:bg-white/4 border-slate-200 dark:border-white/10 hover:border-indigo-400 dark:hover:border-indigo-500/40 hover:bg-slate-50';
        if (shown && isSel) style = choice.isCorrect ? 'bg-emerald-50 dark:bg-emerald-500/20 border-emerald-500 text-emerald-900 dark:text-emerald-300' : 'bg-red-50 dark:bg-red-500/20 border-red-500 text-red-900 dark:text-red-300';
        else if (shown && choice.isCorrect) style = 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-200';
        
        return (
          <button key={idx} onClick={() => !selectedChoice && onAnswer(choice)} disabled={shown}
            className={`flex items-center gap-4 p-5 rounded-2xl border text-left transition-all shadow-sm ${style}`}>
            <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${shown && isSel ? 'bg-white' : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400'}`}>{String.fromCharCode(65 + idx)}</span>
            <span className="text-sm font-bold">{choice.text}</span>
          </button>
        );
      })}
    </div>
    {selectedChoice && (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`p-6 rounded-[2rem] border text-sm shadow-lg ${selectedChoice.isCorrect ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-500/30 text-emerald-900 dark:text-emerald-200' : 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-300'}`}>
        <span className="font-black uppercase tracking-widest text-[10px] block mb-2">{selectedChoice.isCorrect ? 'Excellent!' : 'Teacher Insights:'}</span>
        <p className="font-medium text-base leading-relaxed">{selectedChoice.teacherResponse}</p>
      </motion.div>
    )}
  </div>
);

const HoneyTeacher = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [step, setStep] = useState('topic');
  const [topic, setTopic] = useState('');
  const [professor, setProfessor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [professorMood, setProfessorMood] = useState('neutral');
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [waitingForAnswer, setWaitingForAnswer] = useState(false);

  const synthRef = useRef(window.speechSynthesis);
  const progressRef = useRef(null);

  const startGeneration = async (prof) => {
    setProfessor(prof);
    setStep('loading');
    setLoading(true); setError('');
    try {
      const response = await apiClient.post('/ai/public-masterclass', {
        topic: topic,
        teacherPersona: { id: prof.id, name: prof.name, tag: prof.tag, desc: prof.desc }
      });
      setData(response);
      setStep('player');
    } catch (err) {
      setError(err.message || 'The AI Professors are currently in a meeting. Try again shortly!');
      setStep('topic');
    } finally {
      setLoading(false);
    }
  };

  const speakText = useCallback((text, onDone) => {
    if (!synthRef.current || !text) { onDone?.(); return; }
    synthRef.current.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95; u.pitch = 1.0;
    const voices = synthRef.current.getVoices();
    const best = voices.find(v => v.lang.startsWith('en'));
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
    let elapsed = 0;
    const est = (scene.teacherScript?.length || 100) * 80;
    progressRef.current = setInterval(() => { elapsed += 100; setProgress(Math.min((elapsed / est) * 100, 98)); }, 100);
    speakText(scene.teacherScript, () => {
      clearInterval(progressRef.current); setProgress(100);
      if (scene.type === 'interactive') { setProfessorMood('thinking'); setWaitingForAnswer(true); setIsPlaying(false); }
      else { setProfessorMood('neutral'); setTimeout(() => { if (index + 1 < data.scenes.length) playScene(index + 1); }, 1200); }
    });
  }, [data, speakText]);

  const handleAnswer = useCallback((choice) => {
    setSelectedChoice(choice); setWaitingForAnswer(false); setProfessorMood(choice.isCorrect ? 'correct' : 'wrong');
    speakText(choice.teacherResponse, () => {
      setProfessorMood('neutral');
      setTimeout(() => { if (currentSlide + 1 < (data?.scenes?.length || 0)) playScene(currentSlide + 1); }, 1500);
    });
  }, [currentSlide, data, speakText, playScene]);

  useEffect(() => {
    return () => { synthRef.current?.cancel(); clearInterval(progressRef.current); };
  }, []);

  if (step === 'topic') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white flex flex-col items-center justify-center p-6 text-center transition-all duration-700">
        <Particles />
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl w-full space-y-12">
          <div className="w-24 h-24 rounded-[2rem] bg-indigo-600/10 dark:bg-indigo-600/20 flex items-center justify-center mx-auto shadow-2xl border border-indigo-200 dark:border-indigo-400/30">
            <BrainCircuit className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="space-y-4">
             <h1 className="text-6xl md:text-7xl font-black tracking-tighter text-slate-900 dark:text-white">Honey <span className="gradient-text italic">Teacher.</span></h1>
             <p className="text-slate-500 dark:text-slate-400 font-bold text-xl leading-relaxed max-w-lg mx-auto">Get an interactive, voice-narrated lesson from an expert persona in seconds.</p>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); if (topic.trim()) setStep('professor'); }} className="relative group">
             <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="What do you want to learn today?"
               className="w-full py-8 px-14 rounded-[2.5rem] bg-white dark:bg-white/5 border-2 border-slate-100 dark:border-white/10 text-xl md:text-2xl font-black transition-all focus:border-indigo-500 focus:bg-indigo-50/50 dark:focus:bg-indigo-500/5 outline-none text-center text-slate-900 dark:text-white shadow-2xl placeholder-slate-300 dark:placeholder-slate-700"
             />
             <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-400 w-7 h-7" />
             <button type="submit" disabled={!topic.trim()} className="mt-8 btn-primary px-12 py-6 text-xl w-full disabled:opacity-20 shadow-[0_20px_40px_rgba(99,102,241,0.3)]">Step Into the Hive</button>
          </form>
        </motion.div>
      </div>
    );
  }

  if (step === 'professor') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white flex flex-col items-center justify-center px-6 py-20 transition-all duration-700">
        <TeacherSelector topic={topic} onSelect={startGeneration} />
      </div>
    );
  }

  if (step === 'loading') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex flex-col items-center justify-center text-slate-900 dark:text-white gap-8 text-center p-6 transition-all duration-700">
        <div className="w-32 h-32 rounded-full border-4 border-indigo-500/10 flex items-center justify-center relative">
           <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }} className="absolute -inset-1 rounded-full border-t-4 border-indigo-500"></motion.div>
           <span className="text-7xl">{professor.emoji}</span>
        </div>
        <h2 className="text-4xl font-black gradient-text uppercase tracking-widest">{professor.name} is preparing...</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-sm font-bold text-lg">Synthesizing resources for: <span className="text-indigo-600 dark:text-indigo-400">"{topic}"</span></p>
      </div>
    );
  }

  const scene = data?.scenes[currentSlide] || {};
  
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white flex flex-col overflow-hidden relative transition-all duration-700">
      <Particles icon={scene.icon} />
      <header className="px-8 py-5 flex items-center justify-between bg-white/70 dark:bg-black/40 backdrop-blur-2xl border-b border-slate-200 dark:border-white/5 z-20">
        <div className="flex items-center gap-6">
          <button onClick={() => setStep('topic')} className="p-2.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-2xl transition-colors text-slate-600 dark:text-slate-400"><X className="w-6 h-6" /></button>
          <div className="flex flex-col">
             <div className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Honey Teacher</div>
             <div className="text-sm font-black text-slate-900 dark:text-white">{topic}</div>
          </div>
        </div>
        <div className="flex gap-1.5 bg-slate-100 dark:bg-white/5 p-1.5 rounded-full">
          {data.scenes.map((s, idx) => (<div key={idx} className={`h-2 rounded-full transition-all duration-500 ${idx === currentSlide ? 'w-10 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'w-2 bg-slate-300 dark:bg-slate-800 hover:bg-slate-400 dark:hover:bg-slate-700'}`} />))}
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className="flex-1 flex flex-col p-6 lg:p-12 gap-8 overflow-y-auto">
          <motion.div key={currentSlide} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            className="flex-1 rounded-[3.5rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/50 backdrop-blur-3xl overflow-hidden flex flex-col shadow-2xl transition-all">
            <div className={`px-10 py-8 border-b border-slate-100 dark:border-white/5 flex items-center gap-8 ${scene.type === 'interactive' ? 'bg-amber-500/5' : ''}`}>
              <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-4xl shadow-sm">{scene.icon || '📖'}</div>
              <div>
                <div className={`text-[10px] font-black uppercase tracking-widest ${scene.type === 'interactive' ? 'text-amber-600 dark:text-amber-400' : 'text-indigo-600 dark:text-indigo-400'}`}>{scene.type === 'interactive' ? 'Knowledge Check' : 'Concept Insight'}</div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">{scene.title}</h2>
              </div>
            </div>
            <div className="p-10 md:p-14 flex-1">
              {scene.type === 'interactive' ? <InteractiveScene scene={scene} onAnswer={handleAnswer} selectedChoice={selectedChoice} /> : <SceneVisual scene={scene} isPlaying={isPlaying} />}
            </div>
          </motion.div>
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[11px] uppercase font-black text-slate-500 dark:text-slate-600 tracking-[0.2em]"><Volume2 className="w-3.5 h-3.5" /> Direct Audio Feed · {professor.name}</div>
            <KaraokeSubtitle text={scene.teacherScript} isPlaying={isPlaying} slideKey={currentSlide} />
          </div>
        </div>

        <aside className="w-full lg:w-[400px] p-8 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-black/20 backdrop-blur-3xl flex flex-col gap-8 transition-all">
           <div className="p-10 rounded-[3rem] bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex flex-col items-center text-center gap-8 shadow-xl">
              <ProfessorAvatar isPlaying={isPlaying} mood={professorMood} professor={professor} />
              {!waitingForAnswer ? (
                <button onClick={() => isPlaying ? synthRef.current.cancel() : playScene(currentSlide)} 
                  className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-[0_20px_50px_rgba(99,102,241,0.4)] hover:scale-105 active:scale-95 transition-all text-white">
                  {isPlaying ? <Pause className="w-10 h-10" /> : <Play className="w-10 h-10 ml-1.5" />}
                </button>
              ) : (
                <div className="py-5 px-8 rounded-2xl bg-amber-500/10 border border-amber-300 dark:border-amber-500/20 text-amber-600 dark:text-amber-500 text-xs font-black animate-pulse uppercase tracking-[0.3em]">Awaiting Input</div>
              )}
              <div className="flex gap-3 w-full mt-2">
                 <button onClick={() => playScene(0)} className="flex-1 py-4 bg-slate-100 dark:bg-white/5 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">Reset</button>
                 <button onClick={() => currentSlide < data.scenes.length - 1 && playScene(currentSlide + 1)} disabled={currentSlide >= data.scenes.length - 1} className="flex-1 py-4 bg-slate-100 dark:bg-white/5 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-400 disabled:opacity-20">Skip</button>
              </div>
           </div>
           
           {data.youtubeQuery && (
              <button 
                onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(data.youtubeQuery)}`)} 
                className="mt-auto p-7 rounded-[2.5rem] bg-red-600/5 dark:bg-red-600/5 border border-red-200 dark:border-red-500/10 text-left group hover:bg-red-600/10 transition-all shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                   <Video className="w-8 h-8 text-red-600 group-hover:scale-110 transition-transform" />
                   <div className="px-3 py-1 rounded-full bg-red-600 text-white text-[9px] font-black uppercase tracking-widest">Context</div>
                </div>
                <div className="text-base font-black text-slate-900 dark:text-white mb-1">Deep Dive Resource</div>
                <div className="text-xs text-slate-500 dark:text-slate-600 font-bold truncate italic">"{data.youtubeQuery}"</div>
              </button>
           )}
        </aside>
      </main>
    </div>
  );
};

export default HoneyTeacher;
