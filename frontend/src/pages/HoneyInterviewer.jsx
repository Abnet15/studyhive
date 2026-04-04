import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Mic, MicOff, Square, Upload, Briefcase, MessageCircle, FileText, ChevronRight, CheckCircle, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Particles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(12)].map((_, i) => (
      <motion.div key={i} className="absolute w-1 h-1 rounded-full bg-indigo-500/30"
        style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
        animate={{ y: [0, -40, 0], opacity: [0.1, 0.4, 0.1], scale: [1, 1.5, 1] }}
        transition={{ duration: 4 + Math.random() * 3, delay: Math.random() * 2, repeat: Infinity }}
      />
    ))}
  </div>
);

const HoneyInterviewer = () => {
  const { token, user } = useAuth();
  const [step, setStep] = useState('select_mode'); // 'select_mode' | 'setup' | 'connecting' | 'call'
  const [mode, setMode] = useState('interview'); // 'interview' | 'english'
  const [contextText, setContextText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [language, setLanguage] = useState('English');
  
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [textInput, setTextInput] = useState('');
  
  const [error, setError] = useState('');

  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const scrollRef = useRef(null);

  // ─── Setup Speech Recognition ───────────────────────────────────────────────
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onstart = () => setIsListening(true);
      
      rec.onresult = (e) => {
        let interim = '';
        let final = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          if (e.results[i].isFinal) final += e.results[i][0].transcript;
          else interim += e.results[i][0].transcript;
        }
        setLiveTranscript(interim);
        if (final) {
          handleUserSpeechDone(final);
        }
      };

      rec.onerror = (e) => {
        console.error('Speech Recognition Error:', e.error);
        if (e.error !== 'no-speech') setIsListening(false);
      };

      rec.onend = () => {
        // If it was supposed to be listening, it might have timed out automatically
        setIsListening(false);
      };

      recognitionRef.current = rec;
    } else {
      setError('Voice recognition is not supported in this browser. Please use Chrome or Edge.');
    }

    return () => {
      recognitionRef.current?.stop();
      synthRef.current?.cancel();
    };
  }, []);

  // Auto-scroll chat history
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [chatHistory, liveTranscript]);

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (!textInput.trim() || isSpeaking) return;
    const text = textInput;
    setTextInput('');
    handleUserSpeechDone(text);
  };

  const handleUserSpeechDone = async (text) => {
    if (!text.trim()) return;
    
    // Stop listening while AI thinks/speaks
    recognitionRef.current?.stop();
    setIsListening(false);
    setLiveTranscript('');

    const newMessage = { role: 'user', text };
    const updatedHistory = [...chatHistory, newMessage];
    setChatHistory(updatedHistory);

    try {
      await getAIResponse(updatedHistory);
    } catch (err) {
      console.error(err);
      setError('Communication error. Please try again.');
    }
  };

  const getAIResponse = async (history) => {
    setIsSpeaking(true);
    
    // Build form data if file is attached (only usually needed for setup, but we send it once and keep sending contextText)
    // Actually, on the very first call, we send the file. The backend returns contextText?
    // Let's simplify: Send file + initial context + mode ONCE to extract context. 
    // But since it's a stateless backend API, we'll just send the context string if we already have it.
    
    const formData = new FormData();
    formData.append('mode', mode);
    formData.append('history', JSON.stringify(history));
    
    let finalContext = contextText;
    if (mode === 'interview') {
      finalContext += `\n\nLANGUAGE REQUEST: Please conduct this interview and speak exactly in ${language}. `;
      if (language === 'Amharic') {
         finalContext += `IMPORTANT: Speak naturally and idiomatically like a native Ethiopian person. Avoid robotic or direct translations. Use polite conversational Amharic script (አማርኛ) perfectly.`;
      }
    }
    
    if (finalContext) formData.append('context', finalContext);
    if (selectedFile && mode === 'interview') formData.append('file', selectedFile);

    try {
      const res = await fetch(`${API_BASE}/ai/voice-chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!res.ok) throw new Error('API Error');
      const data = await res.json();
      const aiText = data.response || "I didn't quite catch that.";

      setChatHistory(prev => [...prev, { role: 'model', text: aiText }]);
      speakText(aiText);

    } catch (err) {
      setIsSpeaking(false);
      setError('Network error processing your voice.');
    }
  };

  const speakText = (text) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();

    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95;
    
    const langPrefixes = { 'English': 'en', 'Amharic': 'am', 'French': 'fr', 'Spanish': 'es', 'German': 'de' };
    const targetPrefix = mode === 'interview' ? (langPrefixes[language] || 'en') : 'en';

    const langCodesExact = { 'English': 'en-US', 'Amharic': 'am-ET', 'French': 'fr-FR', 'Spanish': 'es-ES', 'German': 'de-DE' };
    u.lang = mode === 'interview' ? (langCodesExact[language] || 'en-US') : 'en-US';

    const voices = synthRef.current.getVoices();
    let best = voices.find(v => v.lang.startsWith(targetPrefix) && (v.name.includes('Google') || v.name.includes('Microsoft')));
    if (!best) best = voices.find(v => v.lang.startsWith(targetPrefix));
    
    // Explicitly fallback to Google/Microsoft Amharic voice if it exists
    if (language === 'Amharic') {
      const amVoice = voices.find(v => v.lang === 'am-ET' || v.name.includes('Amharic') || v.name.includes('am-ET'));
      if (amVoice) best = amVoice;
    }

    if (best) u.voice = best;

    u.onstart = () => setIsSpeaking(true);
    u.onend = () => {
      setIsSpeaking(false);
      // Auto-resume listening after AI finishes speaking
      if (step === 'call') {
         setTimeout(() => startListening(), 500);
      }
    };
    u.onerror = () => setIsSpeaking(false);
    
    synthRef.current.speak(u);
  };

  const startListening = () => {
    if (isSpeaking) synthRef.current?.cancel();

    if (recognitionRef.current) {
        const langCodes = { 'English': 'en-US', 'Amharic': 'am-ET', 'French': 'fr-FR', 'Spanish': 'es-ES', 'German': 'de-DE' };
        recognitionRef.current.lang = mode === 'interview' ? (langCodes[language] || 'en-US') : 'en-US';
    }

    try {
      recognitionRef.current?.start();
      setIsListening(true);
    } catch(e) {
      // already started usually
    }
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const startCall = async () => {
    setStep('connecting');
    // First trigger the AI to say hello using an empty history
    await getAIResponse([]);
    setStep('call');
  };

  const endCall = () => {
    stopListening();
    synthRef.current?.cancel();
    setStep('select_mode');
    setChatHistory([]);
    setSelectedFile(null);
    setContextText('');
    setLanguage('English');
  };


  // ─── RENDERS ────────────────────────────────────────────────────────────────
  
  if (step === 'select_mode' || step === 'setup') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white flex flex-col -mt-14 sm:-mt-16 pt-14 sm:pt-16 py-10 px-4 md:px-8 relative overflow-hidden">
        <Particles />
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="w-full max-w-3xl mx-auto flex-1 flex flex-col pt-10 relative z-10">
          <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-fuchsia-400 mb-4">Honey Interviewer</h1>
            <p className="text-slate-400 dark:text-slate-400 text-lg">Your voice-driven AI recruiter and conversation partner. Pick your path.</p>
          </motion.div>

          {step === 'select_mode' && (
            <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} className="grid md:grid-cols-2 gap-5 mb-8">
              <button onClick={() => { setMode('interview'); setStep('setup'); }} className="p-8 rounded-3xl border-2 border-indigo-500/30 text-left transition-all bg-indigo-900/10 hover:bg-indigo-900/40 hover:border-indigo-500 shadow-xl group">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><Briefcase className="w-8 h-8" /></div>
                <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">Job Interview Prep</h3>
                <p className="text-sm text-slate-400 dark:text-slate-400 leading-relaxed">Simulate a real technical or behavioral job interview. Upload a job posting, select a language, and answer questions posed by our AI Hiring Manager.</p>
              </button>
              
              <button onClick={() => { setMode('english'); setStep('setup'); }} className="p-8 rounded-3xl border-2 border-fuchsia-500/30 text-left transition-all bg-fuchsia-900/10 hover:bg-fuchsia-900/40 hover:border-fuchsia-500 shadow-xl group">
                <div className="w-16 h-16 rounded-2xl bg-fuchsia-500/20 text-fuchsia-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><MessageCircle className="w-8 h-8" /></div>
                <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">English Practice</h3>
                <p className="text-sm text-slate-400 dark:text-slate-400 leading-relaxed">Improve your casual or professional English conversation skills. The AI acts as a native partner and gently provides feedback on your grammar in real-time.</p>
              </button>
            </motion.div>
          )}

          {step === 'setup' && (
            <motion.div initial={{opacity: 0, x: 20}} animate={{opacity: 1, x: 0}} className="bg-slate-50 dark:bg-slate-900/60 border border-slate-900/20 dark:border-white/10 rounded-3xl p-6 md:p-8 mb-8 backdrop-blur-xl relative">
              <button onClick={() => setStep('select_mode')} className="absolute -top-12 left-0 flex items-center gap-2 text-sm font-bold text-slate-400 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-colors">
                 <span className="text-lg">←</span> Back to Modes
              </button>

              <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                <FileText className="w-6 h-6 text-indigo-400" /> 
                {mode === 'interview' ? 'Interview Details' : 'Conversation Topic'}
              </h3>
              
              {mode === 'interview' && (
                <div className="mb-6">
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-400 mb-2 uppercase tracking-wide">Interview Language</label>
                  <select 
                    value={language} 
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full bg-white/40 dark:bg-black/40 border border-slate-900/20 dark:border-white/10 rounded-xl p-4 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="English">English</option>
                    <option value="Amharic">Amharic</option>
                    <option value="French">French</option>
                    <option value="Spanish">Spanish</option>
                    <option value="German">German</option>
                  </select>
                  {language === 'Amharic' && (
                    <p className="text-[10px] text-emerald-400 mt-2 font-bold">
                      * Tip: For the most realistic Ethiopian voice, use Microsoft Edge.
                    </p>
                  )}
                </div>
              )}

              <p className="text-xs text-slate-400 dark:text-slate-400 mb-2 mt-4 font-bold uppercase tracking-wide">
                {mode === 'interview' ? 'Job Description' : 'What do you want to talk about?'}
              </p>
              <textarea
                value={contextText} onChange={e => setContextText(e.target.value)}
                placeholder={mode === 'interview' ? "Paste the Job Description here..." : "e.g., 'I want to practice ordering food at a restaurant'"}
                className="w-full h-32 bg-white/40 dark:bg-black/40 border border-slate-900/20 dark:border-white/10 rounded-2xl p-4 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 mb-4 resize-none"
              />
              
              {mode === 'interview' && (
                <label className="flex items-center justify-center gap-2 w-full py-4 rounded-xl border border-dashed border-slate-900/30 dark:border-white/20 bg-slate-900/5 dark:bg-white/5 hover:bg-slate-900/10 dark:bg-white/10 cursor-pointer transition-colors group mb-4">
                  <input type="file" className="hidden" accept=".pdf,.doc,.docx,.txt" onChange={e => setSelectedFile(e.target.files?.[0])} />
                  <Upload className="w-5 h-5 text-slate-400 dark:text-slate-400 group-hover:text-indigo-400 transition-colors" />
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:text-white">{selectedFile ? selectedFile.name : 'Or upload Job Spec (PDF, DOCX)'}</span>
                </label>
              )}

              {error && <div className="text-red-400 mb-4 text-center font-medium bg-red-500/10 py-3 rounded-xl border border-red-500/20">{error}</div>}

              <button onClick={startCall} className="w-full py-5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/30 hover:scale-[1.02] active:scale-95 transition-all mt-4">
                <Mic className="w-6 h-6" /> {mode === 'interview' ? 'Submit Job Spec & Start Interview' : 'Submit Topic & Start Practice'}
              </button>
            </motion.div>
          )}

        </div>
      </div>
    );
  }

  // Active Call Screen
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white flex flex-col -mt-14 sm:-mt-16 pt-14 sm:pt-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.15),transparent_70%)] pointer-events-none" />
      
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-900/10 dark:border-white/5 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-black">AI</div>
          <div>
            <div className="text-sm font-bold leading-tight">{mode === 'interview' ? 'Hiring Manager' : 'Conversation Partner'}</div>
            <div className="text-[10px] text-green-400 uppercase tracking-widest flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Connected
            </div>
          </div>
        </div>
        <button onClick={endCall} className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/40 border border-red-500/50 text-red-400 text-xs font-bold transition-colors">End Call</button>
      </header>

      {/* Main Call Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        
        {/* Pulsing Avatar */}
        <div className="relative mb-16">
          <AnimatePresence>
            {(isListening || isSpeaking) && (
              <>
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: [1, 1.5, 1], opacity: [0, 0.3, 0] }} transition={{ duration: 2, repeat: Infinity }} className={`absolute inset-0 rounded-full blur-xl ${isSpeaking ? 'bg-indigo-500' : 'bg-emerald-500'}`} />
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: [1, 2.5, 1], opacity: [0, 0.1, 0] }} transition={{ duration: 2.5, repeat: Infinity, delay: 0.2 }} className={`absolute inset-0 rounded-full blur-2xl ${isSpeaking ? 'bg-purple-500' : 'bg-cyan-500'}`} />
              </>
            )}
          </AnimatePresence>
          
          <motion.div animate={isListening ? { scale: 1.05 } : isSpeaking ? { scale: [1, 1.1, 1] } : { scale: 1 }} transition={isSpeaking ? { duration: 0.5, repeat: Infinity, repeatType: 'reverse' } : {}} className={`w-36 h-36 md:w-48 md:h-48 rounded-full border-4 flex items-center justify-center flex-col z-10 relative bg-slate-50 dark:bg-slate-900 shadow-2xl ${isSpeaking ? 'border-indigo-500 shadow-indigo-500/50' : isListening ? 'border-emerald-500 shadow-emerald-500/50' : 'border-slate-900/20 dark:border-white/10'}`}>
            <span className="text-5xl md:text-7xl mb-2">{isSpeaking ? '💬' : isListening ? '👂' : '😴'}</span>
            <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 dark:text-slate-400">{isSpeaking ? 'AI Speaking' : isListening ? 'Listening...' : 'Paused'}</span>
          </motion.div>
        </div>

        {/* Live Subtitles / History */}
        <div className="w-full max-w-2xl h-48 md:h-64 rounded-3xl bg-white/40 dark:bg-black/40 border border-slate-900/10 dark:border-white/5 backdrop-blur-xl p-5 overflow-y-auto mb-10 flex flex-col gap-4 font-medium" ref={scrollRef}>
          {chatHistory.length === 0 && !isSpeaking && !isListening && (
            <div className="text-center text-slate-400 dark:text-slate-500 my-auto text-sm flex flex-col items-center gap-3">
               <div className="w-8 h-8 md:w-10 md:h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
               {mode === 'interview' && (contextText || selectedFile) 
                  ? "🧠 AI is analyzing your Job Description and preparing an interview strategy..." 
                  : "🧠 AI is preparing your personalized English lesson..."}
            </div>
          )}
          {chatHistory.map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 font-black tracking-wider uppercase mb-1">{msg.role === 'user' ? 'You' : 'AI'}</div>
              <div className={`px-4 py-2.5 rounded-2xl max-w-[85%] text-sm leading-relaxed ${msg.role === 'user' ? 'bg-indigo-600 text-slate-900 dark:text-white rounded-br-none' : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-900/10 dark:border-white/5'}`}>{msg.text}</div>
            </div>
          ))}
          {liveTranscript && (
            <div className="flex flex-col items-end">
              <div className="text-[10px] text-emerald-500 font-black tracking-wider uppercase mb-1">You (Muttering)</div>
              <div className="px-4 py-2.5 rounded-2xl max-w-[85%] text-sm leading-relaxed bg-emerald-900/30 text-emerald-100 border border-emerald-500/30 rounded-br-none italic">{liveTranscript}...</div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="w-full max-w-2xl flex flex-col items-center gap-5">
          <button onClick={isListening ? stopListening : startListening} className={`w-20 h-20 rounded-full flex items-center justify-center border-4 transition-all ${isListening ? 'bg-red-500/20 border-red-500 text-red-500 shadow-lg shadow-red-500/20' : 'bg-slate-900/10 dark:bg-white/10 border-slate-900/30 dark:border-white/20 text-slate-900 dark:text-white hover:bg-slate-900/20 dark:bg-white/20'}`}>
            {isListening ? <Square className="w-8 h-8 flex-shrink-0 fill-current" /> : <Mic className="w-8 h-8" />}
          </button>
          
          <form onSubmit={handleTextSubmit} className="w-full flex items-center gap-3 bg-white/60 dark:bg-slate-900/70 p-2 pl-4 rounded-2xl border border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-sm transition-all focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20">
            <input 
              type="text" 
              value={textInput} 
              onChange={e => setTextInput(e.target.value)} 
              placeholder={isSpeaking ? "AI is speaking..." : mode === 'english' ? "Type your message to practice writing..." : "Type your answer here..."}
              disabled={isSpeaking}
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 text-slate-900 dark:text-white disabled:opacity-50 outline-none placeholder-slate-400 dark:placeholder-slate-500"
            />
            <button 
              type="submit" 
              disabled={!textInput.trim() || isSpeaking}
              className="p-3 rounded-xl bg-indigo-500 text-white disabled:opacity-50 disabled:bg-slate-300 dark:disabled:bg-slate-700 hover:bg-indigo-600 transition-colors shadow-md"
            >
              <Send className="w-5 h-5 -ml-0.5" />
            </button>
          </form>

          <p className="text-slate-400 dark:text-slate-500 text-xs text-center max-w-sm font-medium">
            {isListening ? "Speak clearly into your microphone..." : "Microphone is off. Click to talk, or type your response to practice writing!"}
          </p>
        </div>

      </main>
    </div>
  );
};

export default HoneyInterviewer;
