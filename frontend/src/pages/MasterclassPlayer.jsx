import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { apiClient } from '../services/apiClient';
import { useAuth } from '../context/AuthContext';
import { Play, Pause, Volume2, Sparkles, Video, ChevronRight, X, SkipForward, RotateCcw, Maximize2 } from 'lucide-react';

// ─── Animated Audio Waveform ────────────────────────────────────────────────
const Waveform = ({ isPlaying }) => (
  <div className="flex items-end gap-[3px] h-8">
    {[...Array(12)].map((_, i) => (
      <motion.div
        key={i}
        className="w-1 rounded-full bg-gradient-to-t from-indigo-600 to-cyan-400"
        animate={isPlaying ? {
          height: ['8px', `${16 + Math.random() * 24}px`, '8px'],
          opacity: [0.6, 1, 0.6],
        } : { height: '4px', opacity: 0.3 }}
        transition={{
          duration: 0.4 + Math.random() * 0.4,
          repeat: Infinity,
          delay: i * 0.05,
          ease: 'easeInOut',
        }}
      />
    ))}
  </div>
);

// ─── Floating Particles Background ─────────────────────────────────────────
const ParticleField = ({ icon }) => {
  const particles = [...Array(12)].map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 0.6 + Math.random() * 1.2,
    duration: 8 + Math.random() * 12,
    delay: Math.random() * 5,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute text-4xl select-none"
          style={{ left: `${p.x}%`, top: `${p.y}%`, fontSize: `${p.size}rem`, filter: 'blur(1px)', opacity: 0.05 }}
          animate={{ y: [0, -40, 0], rotate: [0, 15, -15, 0], opacity: [0.05, 0.12, 0.05] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        >
          {icon || '✨'}
        </motion.div>
      ))}
    </div>
  );
};

// ─── Karaoke Subtitle ───────────────────────────────────────────────────────
const KaraokeSubtitle = ({ text, isPlaying, slideKey }) => {
  const words = text?.split(' ') || [];
  const [activeWord, setActiveWord] = useState(-1);
  const intervalRef = useRef(null);

  useEffect(() => {
    setActiveWord(-1);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (isPlaying && words.length > 0) {
      const avgWordDuration = (words.join(' ').length / 12) * 1000 / words.length;
      let idx = 0;
      intervalRef.current = setInterval(() => {
        setActiveWord(idx);
        idx++;
        if (idx >= words.length) clearInterval(intervalRef.current);
      }, Math.max(200, avgWordDuration));
    }
    return () => clearInterval(intervalRef.current);
  }, [slideKey, isPlaying]);

  return (
    <div className="px-4 py-5 rounded-2xl bg-black/40 border border-white/5 backdrop-blur-xl shadow-inner text-center leading-relaxed max-h-28 overflow-y-auto">
      {words.map((word, i) => (
        <motion.span
          key={i}
          className={`inline-block mr-1.5 transition-all duration-100 text-sm md:text-base font-medium ${
            i === activeWord
              ? 'text-white scale-110 text-shadow-glow'
              : i < activeWord
              ? 'text-slate-400'
              : 'text-slate-600'
          }`}
        >
          {word}
        </motion.span>
      ))}
    </div>
  );
};

// ─── Animated Concept Card ──────────────────────────────────────────────────
const ConceptCard = ({ scene, index, isPlaying }) => {
  return (
    <motion.div
      key={index}
      initial={{ opacity: 0, scale: 0.94, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94, y: -30 }}
      transition={{ duration: 0.6, type: 'spring', stiffness: 120 }}
      className="relative rounded-[2.5rem] border border-white/10 overflow-hidden shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)] bg-gradient-to-br from-slate-900/80 to-slate-800/60 backdrop-blur-2xl"
    >
      {/* Gradient orb inside card */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-600/25 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-fuchsia-600/15 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative z-10 p-10 md:p-16 space-y-8">
        {/* Icon with pulse ring */}
        <div className="relative w-24 h-24 flex items-center justify-center">
          <motion.div
            className="absolute inset-0 rounded-3xl bg-primary-500/20 border border-primary-500/30"
            animate={isPlaying ? { scale: [1, 1.15, 1], opacity: [0.5, 0.2, 0.5] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.span
            className="text-6xl z-10"
            animate={isPlaying ? { rotate: [0, 5, -5, 0] } : {}}
            transition={{ duration: 3, repeat: Infinity }}
          >
            {scene.icon || '💡'}
          </motion.span>
        </div>

        {/* Title with animated underline */}
        <div>
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl md:text-5xl font-black tracking-tight leading-tight text-white"
          >
            {scene.title}
          </motion.h2>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '60%' }}
            transition={{ delay: 0.6, duration: 0.8, ease: 'easeOut' }}
            className="h-1 mt-3 rounded-full bg-gradient-to-r from-primary-500 to-indigo-500"
          />
        </div>

        {/* Code Snippet with typing animation */}
        {scene.codeSnippet && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl bg-[#0B1121] border border-white/10 border-l-4 border-l-emerald-500 overflow-hidden shadow-2xl"
          >
            <div className="flex gap-1.5 px-4 py-3 border-b border-white/5">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
            </div>
            <pre className="p-6 text-sm text-emerald-400 font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {scene.codeSnippet}
            </pre>
          </motion.div>
        )}

        {/* Bullet points — staggered animated cards */}
        {scene.bulletPoints?.length > 0 && (
          <ul className="space-y-3">
            {scene.bulletPoints.map((bp, idx) => (
              <motion.li
                key={idx}
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + idx * 0.18, type: 'spring', stiffness: 120 }}
                className="flex gap-4 items-start p-4 rounded-2xl bg-white/4 border border-white/8 hover:bg-white/8 transition-all group"
              >
                <motion.div
                  className="shrink-0 w-8 h-8 rounded-xl bg-primary-500/20 flex items-center justify-center text-primary-400 font-bold text-sm border border-primary-500/30"
                  animate={isPlaying ? { boxShadow: ['0 0 0px rgba(99,102,241,0)', '0 0 12px rgba(99,102,241,0.5)', '0 0 0px rgba(99,102,241,0)'] } : {}}
                  transition={{ delay: idx * 0.5, duration: 2, repeat: Infinity }}
                >
                  {idx + 1}
                </motion.div>
                <span className="text-slate-300 font-medium leading-snug text-base group-hover:text-white transition-colors">{bp}</span>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </motion.div>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────
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
  const materialId = id;

  useEffect(() => {
    fetchMasterclass();
    return () => {
      if (synthRef.current) synthRef.current.cancel();
      clearInterval(progressRef.current);
    };
  }, [materialId, token]);

  const fetchMasterclass = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.post('/ai/masterclass', { materialId }, { token });
      setData(response);
    } catch (err) {
      setError(err.message || 'Failed to initialize the AI Masterclass.');
    } finally {
      setLoading(false);
    }
  };

  const playScene = useCallback((index) => {
    if (!data?.scenes || index >= data.scenes.length || !synthRef.current) {
      setIsPlaying(false);
      clearInterval(progressRef.current);
      return;
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
    const preferred = voices.find(v =>
      (v.name.includes('Google') || v.name.includes('Microsoft')) && v.lang.startsWith('en')
    );
    if (preferred) utterance.voice = preferred;

    utterance.onstart = () => {
      setIsPlaying(true);
      const est = scene.teacherScript.length * 60; // ~ms estimate
      let elapsed = 0;
      clearInterval(progressRef.current);
      progressRef.current = setInterval(() => {
        elapsed += 100;
        setProgress(Math.min((elapsed / est) * 100, 98));
      }, 100);
    };

    utterance.onend = () => {
      clearInterval(progressRef.current);
      setProgress(100);
      setTimeout(() => {
        if (index + 1 < data.scenes.length) {
          playScene(index + 1);
        } else {
          setIsPlaying(false);
          setProgress(0);
        }
      }, 600);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      clearInterval(progressRef.current);
    };

    synthRef.current.speak(utterance);
  }, [data]);

  const togglePlay = () => {
    if (!synthRef.current) return;
    if (isPlaying) {
      synthRef.current.pause();
      setIsPlaying(false);
      clearInterval(progressRef.current);
    } else {
      if (synthRef.current.paused) {
        synthRef.current.resume();
        setIsPlaying(true);
      } else {
        playScene(currentSlide);
      }
    }
  };

  const stopAll = () => {
    synthRef.current?.cancel();
    clearInterval(progressRef.current);
    setIsPlaying(false);
    setProgress(0);
  };

  const restart = () => {
    stopAll();
    setCurrentSlide(0);
    setTimeout(() => playScene(0), 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center text-white space-y-8">
        <ParticleField icon="🧠" />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="w-28 h-28 rounded-full border-t-4 border-r-4 border-indigo-500 flex items-center justify-center"
        >
          <Sparkles className="w-10 h-10 text-primary-400" />
        </motion.div>
        <motion.h2
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-2xl font-black uppercase tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-indigo-400 text-center"
        >
          Honey AI is writing the script...
        </motion.h2>
        <p className="text-slate-500 text-sm font-medium">Extracting content · Crafting scenes · Preparing audio</p>
        <div className="flex gap-2">
          {['Extracting', 'Scripting', 'Animating'].map((step, i) => (
            <motion.div key={i} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, delay: i * 0.4, repeat: Infinity }}
              className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-slate-400 text-xs font-bold"
            >
              {step}
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data?.scenes?.length) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center text-white">
        <div className="text-center space-y-4">
          <div className="text-6xl">💔</div>
          <h2 className="text-2xl font-bold">Assembly Failed</h2>
          <p className="text-red-400">{error || 'AI could not structure the lesson.'}</p>
          <button onClick={() => navigate(-1)} className="mt-6 px-8 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 font-bold transition-colors">Go Back</button>
        </div>
      </div>
    );
  }

  const scene = data.scenes[currentSlide] || data.scenes[0];
  const totalSlides = data.scenes.length;

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col overflow-hidden relative">
      {/* Background field */}
      <ParticleField icon={scene.icon || '💡'} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(99,102,241,0.12),transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(168,85,247,0.10),transparent_60%)] pointer-events-none" />

      {/* Progress bar at very top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/5 z-50">
        <motion.div
          className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 shadow-[0_0_10px_rgba(99,102,241,0.8)]"
          animate={{ width: `${((currentSlide / totalSlides) * 100) + (progress / totalSlides)}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Header */}
      <header className="px-6 py-5 flex justify-between items-center z-20 bg-black/30 backdrop-blur-2xl border-b border-white/5">
        <div className="flex items-center gap-4">
          <button onClick={() => { stopAll(); navigate(-1); }} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-colors group">
            <X className="w-5 h-5 text-slate-400 group-hover:text-white" />
          </button>
          <div>
            <div className="text-xs font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
              <Waveform isPlaying={isPlaying} />
            </div>
            <h1 className="text-base font-bold truncate max-w-xs md:max-w-lg mt-0.5">{data.topic || 'Masterclass'}</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 font-medium hidden md:block">Scene {currentSlide + 1} / {totalSlides}</span>
          <div className="flex gap-1.5">
            {data.scenes.map((_, idx) => (
              <button
                key={idx}
                onClick={() => { stopAll(); setTimeout(() => playScene(idx), 80); }}
                className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-8 bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.9)]' : 'w-1.5 bg-slate-700 hover:bg-slate-500'}`}
              />
            ))}
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">

        {/* Left: Animated Concept Stage */}
        <div className="flex-1 flex flex-col p-6 md:p-10 overflow-y-auto">
          <AnimatePresence mode="wait">
            <ConceptCard key={currentSlide} scene={scene} index={currentSlide} isPlaying={isPlaying} />
          </AnimatePresence>

          {/* Karaoke Subtitle */}
          <div className="mt-5">
            <div className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mb-2 flex items-center gap-2">
              <Volume2 className="w-3 h-3" /> Virtual Professor — Live Script
            </div>
            <KaraokeSubtitle text={scene.teacherScript} isPlaying={isPlaying} slideKey={currentSlide} />
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-full lg:w-80 xl:w-96 flex flex-col gap-5 p-6 border-t lg:border-t-0 lg:border-l border-white/5 bg-black/20 backdrop-blur-3xl shrink-0">

          {/* Big Play Button */}
          <div className="flex flex-col items-center gap-4 p-8 rounded-3xl bg-white/4 border border-white/8">
            <div className="text-xs font-black text-slate-500 uppercase tracking-widest">Honey AI · Virtual Professor</div>

            {/* Animated ring around play button */}
            <div className="relative">
              {isPlaying && (
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-indigo-500/50"
                  animate={{ scale: [1, 1.35, 1], opacity: [0.8, 0, 0.8] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
              <button
                onClick={togglePlay}
                className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center text-white shadow-[0_0_40px_rgba(99,102,241,0.5)] hover:scale-105 active:scale-95 transition-all"
              >
                <AnimatePresence mode="wait">
                  {isPlaying
                    ? <motion.div key="pause" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Pause className="w-8 h-8" /></motion.div>
                    : <motion.div key="play" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Play className="w-8 h-8 ml-1" /></motion.div>
                  }
                </AnimatePresence>
              </button>
            </div>

            <div className="flex gap-2 w-full">
              <button onClick={restart} className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors text-slate-300">
                <RotateCcw className="w-3.5 h-3.5" /> Restart
              </button>
              <button
                onClick={() => { stopAll(); if (currentSlide < totalSlides - 1) setTimeout(() => playScene(currentSlide + 1), 80); }}
                disabled={currentSlide >= totalSlides - 1}
                className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors text-slate-300"
              >
                <SkipForward className="w-3.5 h-3.5" /> Next
              </button>
            </div>

            {/* Per-scene progress */}
            <div className="w-full space-y-1">
              <div className="flex justify-between text-[10px] text-slate-600">
                <span>Scene progress</span><span>{Math.round(progress)}%</span>
              </div>
              <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.2 }}
                />
              </div>
            </div>
          </div>

          {/* Scene list */}
          <div className="flex-1 overflow-y-auto space-y-2">
            <div className="text-[10px] text-slate-600 font-black uppercase tracking-widest px-1">Lesson Scenes</div>
            {data.scenes.map((s, idx) => (
              <motion.button
                key={idx}
                onClick={() => { stopAll(); setTimeout(() => playScene(idx), 80); }}
                whileHover={{ x: 4 }}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-all border ${
                  idx === currentSlide
                    ? 'bg-indigo-600/20 border-indigo-500/40 text-white'
                    : 'bg-white/3 border-white/5 text-slate-400 hover:bg-white/6 hover:text-slate-200'
                }`}
              >
                <span className="text-xl shrink-0">{s.icon || '📖'}</span>
                <span className="text-xs font-bold truncate">{s.title}</span>
                {idx === currentSlide && isPlaying && (
                  <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity }} className="ml-auto w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
                )}
              </motion.button>
            ))}
          </div>

          {/* YouTube Real World */}
          {data.youtubeQuery && (
            <button
              onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(data.youtubeQuery)}`, '_blank')}
              className="w-full p-5 rounded-3xl bg-[#FF0000]/8 hover:bg-[#FF0000]/15 border border-[#FF0000]/20 transition-all group text-left"
            >
              <Video className="w-6 h-6 text-[#FF0000] mb-2" />
              <p className="text-xs font-bold text-white mb-1">Watch Real Examples</p>
              <p className="text-[11px] text-slate-500 leading-snug truncate">"{data.youtubeQuery}"</p>
            </button>
          )}
        </div>
      </main>
    </div>
  );
};

export default MasterclassPlayer;
