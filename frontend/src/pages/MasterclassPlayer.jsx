import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '../services/apiClient';
import { useAuth } from '../context/AuthContext';
import { Play, Pause, Sparkles, Video, X, SkipForward, RotateCcw, Volume2, CheckCircle, XCircle, Plus, ChevronRight, ArrowRight } from 'lucide-react';



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
    <div className="px-5 py-4 rounded-2xl bg-white dark:bg-black/50 border border-slate-200 dark:border-white/5 backdrop-blur-xl text-center leading-loose min-h-[60px] transition-colors">
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
      <div className="text-[10px] text-indigo-500 dark:text-indigo-400 font-black uppercase tracking-widest">{professor?.tag || 'Universal Expert'}</div>
      {isPlaying && (
        <div className="flex gap-0.5 mt-1">
          {[0, 1, 2].map(i => (<motion.div key={i} className="w-1 h-1 rounded-full bg-indigo-500 dark:bg-indigo-400" animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }} transition={{ duration: 0.7, delay: i * 0.15, repeat: Infinity }} />))}
        </div>
      )}
    </div>
  );
};

const SceneVisual = ({ scene, isPlaying }) => {
  // ── CODE: Animated line-by-line code reveal ──
  if (scene?.animationType === 'code') {
    const lines = (scene.codeSnippet || '').split('\n');
    return (
      <div className="w-full rounded-2xl border border-emerald-500/20 bg-[#0B1121] p-6 text-sm font-mono overflow-x-auto shadow-[0_0_30px_rgba(16,185,129,0.1)]">
        {lines.map((line, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15, duration: 0.4 }}
            className="text-emerald-400 leading-relaxed whitespace-pre-wrap">
            <span className="text-slate-600 mr-3 select-none">{(i + 1).toString().padStart(2, ' ')}</span>{line}
          </motion.div>
        ))}
      </div>
    );
  }

  // ── COMPARISON: Side-by-side animated columns ──
  if (scene?.animationType === 'comparison' && scene.comparisonLeft && scene.comparisonRight) {
    return (
      <div className="grid grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
          className="p-5 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
          <div className="font-black text-blue-400 text-sm uppercase tracking-widest mb-3">{scene.comparisonLeft.label}</div>
          {(scene.comparisonLeft.points || []).map((p, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.15 }}
              className="flex items-start gap-2 mb-2">
              <span className="text-blue-400 mt-0.5">▸</span>
              <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">{p}</span>
            </motion.div>
          ))}
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
          className="p-5 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
          <div className="font-black text-purple-400 text-sm uppercase tracking-widest mb-3">{scene.comparisonRight.label}</div>
          {(scene.comparisonRight.points || []).map((p, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.15 }}
              className="flex items-start gap-2 mb-2">
              <span className="text-purple-400 mt-0.5">▸</span>
              <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">{p}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    );
  }

  // ── CONCEPT: Central idea with radiating facts ──
  if (scene?.animationType === 'concept') {
    const steps = scene?.visualSteps || [];
    return (
      <div className="relative">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
          className="text-center mb-6 p-6 rounded-3xl bg-gradient-to-br from-indigo-500/15 to-purple-500/15 border border-indigo-500/20">
          <div className="text-4xl mb-2">{scene.icon || '💡'}</div>
          <div className="font-black text-lg text-slate-900 dark:text-white">{scene.title}</div>
        </motion.div>
        <div className="grid grid-cols-2 gap-3">
          {steps.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 + i * 0.15, type: 'spring' }}
              className="flex items-start gap-3 p-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 shadow-sm">
              <div className="text-2xl shrink-0">{s.icon || '📌'}</div>
              <div>
                <div className="font-bold text-slate-900 dark:text-white text-sm">{s.label}</div>
                <div className="text-slate-500 dark:text-slate-400 text-xs">{s.description}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  // ── FLOW / BUILDUP: Animated step-by-step with connecting lines ──
  const steps = scene?.visualSteps || [];
  const isBuildup = scene?.animationType === 'buildup';
  return (
    <div className="flex flex-col gap-2">
      {steps.map((s, i) => (
        <div key={i}>
          <motion.div initial={{ opacity: 0, x: isBuildup ? 0 : -25, y: isBuildup ? 20 : 0, scale: isBuildup ? 0.9 : 1 }}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            transition={{ delay: i * 0.25, duration: 0.5, type: 'spring' }}
            className="flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-3xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-500/10 dark:to-purple-500/10 w-12 h-12 rounded-xl flex items-center justify-center shrink-0">{s.icon || '📌'}</div>
            <div className="flex-1">
              <div className="font-black text-slate-900 dark:text-white text-base">{s.label}</div>
              <div className="text-slate-500 dark:text-slate-400 text-xs font-medium leading-relaxed">{s.description}</div>
            </div>
            {!isBuildup && i < steps.length - 1 && <span className="text-indigo-400 text-lg shrink-0">→</span>}
          </motion.div>
          {isBuildup && i < steps.length - 1 && (
            <motion.div initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: i * 0.25 + 0.15 }}
              className="w-0.5 h-4 bg-gradient-to-b from-indigo-400 to-purple-400 mx-auto rounded-full" />
          )}
        </div>
      ))}
    </div>
  );
};

const InteractiveScene = ({ scene, onAnswer, selectedChoice }) => (
  <div className="space-y-6">
    <div className="p-6 rounded-3xl bg-amber-500/10 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-500/30">
      <div className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Sparkles className="w-3 h-3"/> Active Participation</div>
      <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">{scene.question}</h3>
    </div>
    <div className="grid grid-cols-1 gap-3">
      {(scene.choices || []).map((choice, idx) => {
        const isSel = selectedChoice?.text === choice.text; const shown = !!selectedChoice;
        let style = 'bg-white dark:bg-white/4 border-slate-200 dark:border-white/10 hover:border-indigo-400 dark:hover:border-indigo-500/40 hover:bg-slate-50';
        if (shown && isSel) style = choice.isCorrect ? 'bg-emerald-50 dark:bg-emerald-500/20 border-emerald-500 text-emerald-900 dark:text-emerald-300' : 'bg-red-50 dark:bg-red-500/20 border-red-500 text-red-900 dark:text-red-300';
        else if (shown && choice.isCorrect) style = 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-200';
        return (<button key={idx} onClick={() => !selectedChoice && onAnswer(choice)} disabled={shown} className={`flex items-center gap-4 p-5 rounded-2xl border text-left transition-all shadow-sm ${style}`}><span className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${shown && isSel ? 'bg-white' : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400'}`}>{String.fromCharCode(65 + idx)}</span><span className="text-sm font-bold">{choice.text}</span></button>);
      })}
    </div>
    {selectedChoice && (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`p-6 rounded-[2rem] border text-sm shadow-lg ${selectedChoice.isCorrect ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-500/30 text-emerald-900 dark:text-emerald-200' : 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-300'}`}><span className="font-black uppercase tracking-widest text-[10px] block mb-2">{selectedChoice.isCorrect ? 'Correct!' : 'Professor Insight:'}</span><p className="font-medium text-base leading-relaxed">{selectedChoice.teacherResponse}</p></motion.div>
    )}
  </div>
);

// ═══ MAIN COMPONENT ═══════════════════════════════════════════════════════════
const MasterclassPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();

  const [professor, setProfessor] = useState(null);
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
  const timeoutRef = useRef(null);
  const isCancelledRef = useRef(false);

  const handleProfessorSelect = async (prof) => {
    setProfessor(prof); setLoading(true); setError('');
    try {
      const isAdhoc = id === 'adhoc';
      const response = await apiClient.post('/ai/public-masterclass', { 
        materialId: isAdhoc ? undefined : id,
        topic: isAdhoc ? location.state?.filename : undefined,
        providedSnippet: isAdhoc ? location.state?.extractedText : undefined,
        teacherPersona: { id: prof.id, name: prof.name, tag: prof.tag, desc: prof.desc }, 
        duration: typeof prof.duration === 'number' ? prof.duration : 5 
      });
      setData(response);
    } catch (err) { setError(err.message || 'Failed to initialize the AI Masterclass.'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    return () => { synthRef.current?.cancel(); clearInterval(progressRef.current); clearTimeout(timeoutRef.current); };
  }, []);

  const speakText = useCallback((text, onDone) => {
    if (!synthRef.current || !text) { onDone?.(); return; }
    synthRef.current.cancel(); const u = new SpeechSynthesisUtterance(text); u.rate = 0.95; u.pitch = 1.0;
    const voices = synthRef.current.getVoices(); const best = voices.find(v => v.lang.startsWith('en'));
    if (best) u.voice = best; u.onend = () => { setIsPlaying(false); onDone?.(); }; u.onerror = () => { setIsPlaying(false); onDone?.(); };
    setIsPlaying(true); synthRef.current.speak(u);
  }, []);

  const playScene = useCallback((index) => {
    if (!data?.scenes || index >= data.scenes.length) { setIsPlaying(false); return; }
    isCancelledRef.current = false;
    const scene = data.scenes[index]; setCurrentSlide(index); setSelectedChoice(null); setWaitingForAnswer(false); setProgress(0);
    clearInterval(progressRef.current); clearTimeout(timeoutRef.current); setProfessorMood('speaking'); let elapsed = 0; const est = (scene.teacherScript?.length || 100) * 80;
    progressRef.current = setInterval(() => { elapsed += 100; setProgress(Math.min((elapsed / est) * 100, 98)); }, 100);
    speakText(scene.teacherScript, () => { 
        clearInterval(progressRef.current); 
        setProgress(100); 
        if (isCancelledRef.current) return; // Prevent auto-advance if user pressed stop

        if (scene.type === 'interactive') { 
            setProfessorMood('thinking'); setWaitingForAnswer(true); setIsPlaying(false); 
        } else { 
            setProfessorMood('neutral'); 
            timeoutRef.current = setTimeout(() => { if (index + 1 < data.scenes.length) playScene(index + 1); }, 1200); 
        } 
    });
  }, [data, speakText]);

  const handleAnswer = useCallback((choice) => {
    setSelectedChoice(choice); setWaitingForAnswer(false); setProfessorMood(choice.isCorrect ? 'correct' : 'wrong');
    speakText(choice.teacherResponse, () => { 
        setProfessorMood('neutral'); 
        if (isCancelledRef.current) return;
        timeoutRef.current = setTimeout(() => { if (currentSlide + 1 < (data?.scenes?.length || 0)) playScene(currentSlide + 1); }, 1500); 
    });
  }, [currentSlide, data, speakText, playScene]);

  const stopAll = useCallback(() => { 
      isCancelledRef.current = true; 
      synthRef.current?.cancel(); 
      clearInterval(progressRef.current); 
      clearTimeout(timeoutRef.current); 
      setIsPlaying(false); 
      setProgress(0); 
      setWaitingForAnswer(false); 
      setProfessorMood('neutral');
  }, []);

  const restart = () => { stopAll(); setCurrentSlide(0); setSelectedChoice(null); setProfessorMood('neutral'); timeoutRef.current = setTimeout(() => playScene(0), 100); };

  if (!professor) {
    const isAdhoc = id === 'adhoc';
    const topicDisplay = isAdhoc ? location.state?.filename : 'this material';
    
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex items-center justify-center p-6 text-slate-900 dark:text-white transition-colors">
         <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-xl w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-10 rounded-[3rem] shadow-2xl flex flex-col items-center text-center gap-8">
            <div className="w-24 h-24 rounded-full bg-indigo-500/10 flex items-center justify-center text-5xl border-4 border-indigo-500/20 shadow-[0_0_50px_rgba(99,102,241,0.2)]">🦸‍♂️</div>
            <div className="space-y-2">
               <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Interactive Masterclass</h2>
               <p className="text-sm font-medium text-slate-500 dark:text-slate-400 max-w-md mx-auto">Select how long you want to study <span className="font-bold text-indigo-500 truncate">{topicDisplay}</span> today.</p>
            </div>
            
            <div className="grid grid-cols-1 w-full gap-4 mt-4">
               {[
                 { time: 5, label: "Quick Overview", desc: "Fast-paced core concepts." },
                 { time: 10, label: "Standard Lesson", desc: "Balanced examples and quizzes." },
                 { time: 15, label: "Deep Dive", desc: "Comprehensive, in-depth analogies." }
               ].map(opt => (
                 <button key={opt.time} onClick={() => handleProfessorSelect({ id: 'super_teacher', name: 'Super Teacher', emoji: '🦸‍♂️', tag: 'Master of Everything', desc: 'Teaches everything perfectly.', duration: opt.time })} className="flex flex-row items-center justify-between p-5 rounded-2xl bg-slate-50 hover:bg-indigo-50 dark:bg-slate-800/50 dark:hover:bg-indigo-500/10 border-2 border-transparent hover:border-indigo-500/30 transition-all text-left group">
                    <div className="flex flex-col">
                       <span className="font-black text-lg text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{opt.time} Minutes</span>
                       <span className="text-sm text-slate-500 font-medium">{opt.label} • {opt.desc}</span>
                    </div>
                    <ArrowRight className="w-6 h-6 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                 </button>
               ))}
            </div>
            <button onClick={() => navigate(-1)} className="w-full py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white font-black text-sm uppercase tracking-widest transition-all">Cancel</button>
         </motion.div>
      </div>
    );
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex flex-col items-center justify-center text-slate-900 dark:text-white gap-8 text-center p-6 transition-colors">
      <div className="w-32 h-32 rounded-full border-4 border-indigo-500/10 flex items-center justify-center relative"><motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }} className="absolute -inset-1 rounded-full border-t-4 border-indigo-500" /><span className="text-7xl">{professor.emoji}</span></div>
      <h2 className="text-4xl font-black gradient-text uppercase tracking-widest">{professor.name} is preparing your masterclass...</h2>
      <p className="text-slate-500 dark:text-slate-400 max-w-sm font-bold text-lg">Synthesizing document into immersive scenes...</p>
    </div>
  );
  if (error || (!loading && !data?.scenes?.length)) return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex items-center justify-center text-slate-900 dark:text-white transition-colors">
       <div className="text-center space-y-6 max-w-md p-10 bg-white dark:bg-white/5 rounded-[3rem] border border-slate-200 dark:border-white/10 shadow-2xl">
          <div className="text-7xl">🧪</div><h2 className="text-3xl font-black">Synthesis Failed</h2><p className="text-slate-500 dark:text-slate-400 font-medium">{error || 'AI could not structure this masterclass.'}</p>
          <div className="flex gap-3 justify-center mt-8"><button onClick={restart} className="flex-1 py-4 rounded-2xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 font-black transition-colors">Retune AI</button><button onClick={() => navigate(-1)} className="flex-1 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black transition-colors shadow-lg">Go Back</button></div>
       </div>
    </div>
  );

  const scene = data.scenes[currentSlide] || data.scenes[0]; const totalSlides = data.scenes.length; const isInteractive = scene?.type === 'interactive';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white flex flex-col overflow-hidden relative transition-all duration-700">
      <Particles icon={scene.icon} />
      <header className="px-8 py-5 flex items-center justify-between bg-white/70 dark:bg-black/40 backdrop-blur-2xl border-b border-slate-200 dark:border-white/5 z-20">
        <div className="flex items-center gap-6">
          <button onClick={() => { stopAll(); navigate(-1); }} className="p-2.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-2xl transition-colors text-slate-600 dark:text-slate-400"><X className="w-6 h-6" /></button>
          <div className="flex flex-col">
             <div className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Masterclass synthesized from file</div>
             <div className="text-sm font-black text-slate-900 dark:text-white">{data.topic || 'Masterclass'}</div>
          </div>
        </div>
        <div className="flex gap-1.5 bg-slate-100 dark:bg-white/5 p-1.5 rounded-full">
          {data.scenes.map((s, idx) => (<button key={idx} onClick={() => { stopAll(); setTimeout(() => playScene(idx), 80); }} className={`h-2 rounded-full transition-all duration-500 ${idx === currentSlide ? 'w-10 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'w-2 bg-slate-300 dark:bg-slate-800 hover:bg-slate-400 dark:hover:bg-slate-700'}`} />))}
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className="flex-1 flex flex-col p-6 lg:p-12 gap-8 overflow-y-auto">
          <motion.div key={currentSlide} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="flex-1 rounded-[3.5rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/50 backdrop-blur-3xl overflow-hidden flex flex-col shadow-2xl transition-all">
            <div className={`px-10 py-8 border-b border-slate-100 dark:border-white/5 flex items-center gap-8 ${isInteractive ? 'bg-amber-500/5' : ''}`}>
               <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-4xl shadow-sm">{scene.icon || '📖'}</div>
               <div><div className={`text-[10px] font-black uppercase tracking-widest ${isInteractive ? 'text-amber-600 dark:text-amber-400' : 'text-indigo-600 dark:text-indigo-400'}`}>{isInteractive ? 'Knowledge Check' : 'Concept Point'}</div><h2 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">{scene.title}</h2></div>
            </div>
            <div className="p-10 md:p-14 flex-1">{isInteractive ? <InteractiveScene scene={scene} onAnswer={handleAnswer} selectedChoice={selectedChoice} /> : <SceneVisual scene={scene} isPlaying={isPlaying} />}</div>
          </motion.div>
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[11px] uppercase font-black text-slate-500 dark:text-slate-600 tracking-[0.2em]"><Volume2 className="w-3.5 h-3.5" /> Narrator: {professor.name}</div>
            <KaraokeSubtitle text={scene.teacherScript} isPlaying={isPlaying} slideKey={currentSlide} />
          </div>
        </div>

        <aside className="w-full lg:w-[400px] p-8 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-black/20 backdrop-blur-3xl flex flex-col gap-8 transition-all">
           <div className="p-10 rounded-[3rem] bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex flex-col items-center text-center gap-8 shadow-xl">
              <ProfessorAvatar isPlaying={isPlaying} mood={professorMood} professor={professor} />
              {!waitingForAnswer ? (
                <button onClick={() => isPlaying ? stopAll() : playScene(currentSlide)} className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-[0_20px_50px_rgba(99,102,241,0.4)] hover:scale-105 active:scale-95 transition-all text-white">{isPlaying ? <Pause className="w-10 h-10" /> : <Play className="w-10 h-10 ml-1.5" />}</button>
              ) : (
                <div className="py-5 px-8 rounded-2xl bg-amber-500/10 border border-amber-300 dark:border-amber-500/20 text-amber-600 dark:text-amber-500 text-xs font-black animate-pulse uppercase tracking-[0.3em]">Awaiting Input</div>
              )}
              <div className="flex gap-3 w-full mt-2"><button onClick={restart} className="flex-1 py-4 bg-slate-100 dark:bg-white/5 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">Reset</button><button onClick={() => { stopAll(); if (currentSlide < totalSlides - 1) setTimeout(() => playScene(currentSlide + 1), 80); }} disabled={currentSlide >= totalSlides - 1} className="flex-1 py-4 bg-slate-100 dark:bg-white/5 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-400 disabled:opacity-20">Skip</button></div>
           </div>
           {data.youtubeQuery && (
              <button onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(data.youtubeQuery)}`)} className="mt-auto p-7 rounded-[2.5rem] bg-red-600/5 border border-red-200 dark:border-red-500/10 text-left group hover:bg-red-600/10 transition-all shadow-sm">
                <div className="flex items-center justify-between mb-4"><Video className="w-8 h-8 text-red-600 group-hover:scale-110 transition-transform" /><div className="px-3 py-1 rounded-full bg-red-600 text-white text-[9px] font-black uppercase tracking-widest">Video</div></div>
                <div className="text-base font-black text-slate-900 dark:text-white mb-1">Deep Dive context</div>
                <div className="text-xs text-slate-500 dark:text-slate-600 font-bold truncate italic">"{data.youtubeQuery}"</div>
              </button>
           )}
        </aside>
      </main>
    </div>
  );
};

export default MasterclassPlayer;
