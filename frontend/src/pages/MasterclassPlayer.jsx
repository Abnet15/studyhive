import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '../services/apiClient';
import { useAuth } from '../context/AuthContext';
import { Play, Pause, Volume2, Sparkles, Youtube, ChevronRight, X } from 'lucide-react';

const MasterclassPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const synthRef = useRef(window.speechSynthesis);
  const utteranceRef = useRef(null);

  // We decode the topic from the URL parameter (e.g., /masterclass/Photosynthesis)
  const topic = decodeURIComponent(id || 'General Educational Material');

  useEffect(() => {
    fetchMasterclass();
    return () => stopAudio(); // cleanup on unmount
  }, [topic, token]);

  const fetchMasterclass = async () => {
    setLoading(true);
    setError('');
    try {
      // POST request to backend AI endpoint
      const response = await apiClient.post('/ai/masterclass', { topic }, { token });
      setData(response);
      prepareAudio(response.teacherScript);
    } catch (err) {
      setError(err.message || 'Failed to initialize the AI Masterclass.');
    } finally {
      setLoading(false);
    }
  };

  const prepareAudio = (script) => {
    if (!synthRef.current) return;
    const utterance = new SpeechSynthesisUtterance(script);
    utterance.rate = 1.0;
    utterance.pitch = 1.1; // Slightly enthusiastic
    
    // Attempt to pick a premium English voice
    const voices = synthRef.current.getVoices();
    const preferredVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Microsoft') && v.lang === 'en-US');
    if (preferredVoice) utterance.voice = preferredVoice;

    // Hook onto boundaries to advance slides automatically based on time/words
    utterance.onboundary = (event) => {
      if (data && data.visualSlides) {
        // Roughly advance slides based on character position in the script
        const progress = event.charIndex / script.length;
        const totalSlides = data.visualSlides.length;
        const calculatedSlide = Math.floor(progress * totalSlides);
        if (calculatedSlide !== currentSlide && calculatedSlide < totalSlides) {
          setCurrentSlide(calculatedSlide);
        }
      }
    };

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    
    utteranceRef.current = utterance;
  };

  const togglePlay = () => {
    if (!synthRef.current || !utteranceRef.current) return;

    if (isPlaying) {
      synthRef.current.pause();
      setIsPlaying(false);
    } else {
      if (synthRef.current.paused) {
        synthRef.current.resume();
      } else {
        synthRef.current.speak(utteranceRef.current);
      }
      setIsPlaying(true);
    }
  };

  const stopAudio = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsPlaying(false);
    }
  };

  const nextSlide = () => {
    if (data && currentSlide < data.visualSlides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-6">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
        <div className="w-24 h-24 relative flex items-center justify-center">
           <div className="absolute inset-0 rounded-full border-t-4 border-indigo-500 animate-spin"></div>
           <Sparkles className="w-10 h-10 text-primary-500 animate-pulse" />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-indigo-400">
           Synthesizing AI Masterclass...
        </h2>
        <p className="text-slate-400 font-medium">Honey is writing the script and generating visual assets.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="max-w-md text-center space-y-4">
          <div className="text-6xl mb-4">💔</div>
          <h2 className="text-2xl font-bold">Assembly Failed</h2>
          <p className="text-red-400">{error}</p>
          <button onClick={() => navigate(-1)} className="mt-8 btn-primary">Return to Material</button>
        </div>
      </div>
    );
  }

  const slide = data.visualSlides[currentSlide] || data.visualSlides[0];

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col overflow-hidden relative">
      {/* Dynamic Ambiance based on slide */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[150px] pointer-events-none -z-10 animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-fuchsia-600/20 rounded-full blur-[120px] pointer-events-none -z-10 animate-blob" style={{ animationDelay: '2s' }}></div>

      {/* Header */}
      <header className="px-8 py-6 flex justify-between items-center z-20 bg-slate-900/50 backdrop-blur-xl border-b border-white/5 shadow-2xl">
         <div className="flex items-center gap-4">
            <button onClick={() => { stopAudio(); navigate(-1); }} className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors group">
              <X className="w-5 h-5 text-slate-400 group-hover:text-white" />
            </button>
            <div className="space-y-1">
               <div className="text-xs font-black text-primary-500 uppercase tracking-widest flex items-center gap-2">
                 <Volume2 className="w-3 h-3" /> Honey AI Interactive Lesson
               </div>
               <h1 className="text-xl font-bold truncate max-w-sm md:max-w-2xl">{topic}</h1>
            </div>
         </div>
      </header>

      {/* Main Player Area */}
      <main className="flex-1 flex flex-col lg:flex-row relative z-10">
         
         {/* Presentation Screen */}
         <div className="flex-1 flex flex-col p-8 md:p-16 justify-center">
            <AnimatePresence mode="wait">
               <motion.div 
                 key={currentSlide}
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -20 }}
                 transition={{ duration: 0.5, type: 'spring' }}
                 className="max-w-4xl mx-auto w-full glass-card p-12 md:p-20 rounded-[3rem] border border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden bg-white/5"
               >
                  <div className="absolute -top-32 -right-32 text-[20rem] opacity-5 rotate-12 blur-sm pointer-events-none">{slide.icon || '💡'}</div>
                  
                  <div className="relative z-10 space-y-10">
                     <span className="inline-block p-4 bg-primary-500/20 text-primary-400 rounded-3xl text-6xl shadow-inner border border-primary-500/20">
                       {slide.icon || '💡'}
                     </span>
                     
                     <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                        {slide.title}
                     </h2>

                     {slide.codeSnippet && (
                       <div className="p-8 bg-[#0B1121]/80 rounded-3xl border border-white/10 font-mono text-sm shadow-xl overflow-x-auto text-emerald-400">
                         {slide.codeSnippet}
                       </div>
                     )}

                     {slide.bulletPoints && slide.bulletPoints.length > 0 && (
                       <ul className="space-y-4">
                          {slide.bulletPoints.map((bp, idx) => (
                             <motion.li 
                               initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + (idx * 0.1) }}
                               key={idx} className="flex gap-4 text-xl text-slate-300 font-medium items-start"
                             >
                                <ChevronRight className="w-8 h-8 text-primary-500 shrink-0 mt-0.5" />
                                {bp}
                             </motion.li>
                          ))}
                       </ul>
                     )}
                  </div>
               </motion.div>
            </AnimatePresence>

            {/* AI Teacher Transcript (Subtitles) */}
            <div className="mt-12 max-w-4xl mx-auto w-full text-center">
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-8 py-6 rounded-3xl bg-slate-900/60 border border-white/5 shadow-inner">
                 <p className="text-lg md:text-xl font-medium text-slate-300 leading-relaxed max-h-32 overflow-y-auto custom-scrollbar">
                   "{data.teacherScript}"
                 </p>
               </motion.div>
            </div>
         </div>

         {/* Right Sidebar: Context & Actions */}
         <div className="w-full lg:w-96 bg-slate-900/40 backdrop-blur-3xl border-l border-white/5 p-8 flex flex-col gap-8 shadow-2xl">
            
            {/* Playback Controls */}
            <div className="bg-white/5 p-8 rounded-3xl border border-white/10 space-y-6 flex flex-col items-center shadow-xl">
               <div className="text-center font-bold text-slate-400 uppercase tracking-widest text-xs">Audio Engine</div>
               <button 
                 onClick={togglePlay}
                 className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center text-white shadow-[0_0_40px_rgba(79,70,229,0.4)] hover:scale-105 active:scale-95 transition-all"
               >
                 {isPlaying ? <Pause className="w-10 h-10" /> : <Play className="w-10 h-10 ml-2" />}
               </button>
               <div className="flex gap-4 mt-4 w-full">
                 <button onClick={() => stopAudio()} className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold transition-colors">Stop</button>
                 <button onClick={nextSlide} className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold transition-colors">Next Slide</button>
               </div>
            </div>

            {/* Slide Navigation Dots */}
            <div className="flex flex-wrap gap-2 justify-center py-4">
               {data.visualSlides.map((_, idx) => (
                 <button 
                   key={idx}
                   onClick={() => setCurrentSlide(idx)}
                   className={`h-2 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-8 bg-primary-500 shadow-[0_0_10px_rgba(14,165,233,0.8)]' : 'w-2 bg-slate-700 hover:bg-slate-500'}`}
                 />
               ))}
            </div>

            {/* Real World Validation (YouTube Recommendation) */}
            <div className="mt-auto group cursor-pointer relative overflow-hidden bg-[#FF0000]/10 hover:bg-[#FF0000]/20 border border-[#FF0000]/20 rounded-3xl p-6 transition-all" onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(data.youtubeQuery)}`, '_blank')}>
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF0000]/20 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
               <Youtube className="w-8 h-8 text-[#FF0000] mb-4" />
               <h4 className="font-bold text-white mb-2">Watch Real Examples</h4>
               <p className="text-sm text-slate-400 leading-tight">
                  Click to open the best YouTube tutorials for: <span className="font-medium text-slate-300">"{data.youtubeQuery}"</span>
               </p>
            </div>
         </div>

      </main>
    </div>
  );
};

export default MasterclassPlayer;
