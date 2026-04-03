import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import aiService from '../services/aiService';
import ConfettiAnimation from '../components/ConfettiAnimation';
import { Sparkles, Brain, MessageSquare, FileText, Send, RefreshCcw, Trash2, CheckCircle2, XCircle } from 'lucide-react';

const AIAssistant = () => {
  const { user, token } = useAuth();
  
  // Recommendations state
  const [recommendation, setRecommendation] = useState('');
  const [loadingRec, setLoadingRec] = useState(false);
  
  // Quiz states
  const [quizTopic, setQuizTopic] = useState('');
  const [quiz, setQuiz] = useState(null);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [feedback, setFeedback] = useState(null); // { isCorrect: boolean, selectedIndex: number }

  // File Analysis states
  const [selectedFile, setSelectedFile] = useState(null);
  const [analysis, setAnalysis] = useState('');
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  // Chat states
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hi! I\'m Honey, your AI Study Buddy. How can I help you today? 🐝' }
  ]);
  const [chatMessage, setChatMessage] = useState('');
  const [sendingChat, setSendingChat] = useState(false);
  const chatEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (user) fetchRecommendation();
  }, [user]);

  useEffect(() => {
    // Scroll only the chat messages container, never the page
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  const fetchRecommendation = async () => {
    setLoadingRec(true);
    try {
      const data = await aiService.getRecommendations(token);
      setRecommendation(data.recommendation);
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
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
    if (feedback) return; // Prevent double clicking
    
    const isCorrect = index === quiz[currentQuestion].correctAnswer;
    setFeedback({ isCorrect, selectedIndex: index });
    
    if (isCorrect) setScore(score + 1);

    setTimeout(() => {
      setFeedback(null);
      if (currentQuestion + 1 < quiz.length) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        setQuizFinished(true);
      }
    }, 1200);
  };

  const handleFileAnalysis = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;
    setLoadingAnalysis(true);
    setAnalysis('');
    try {
      const data = await aiService.analyzeFile(selectedFile, token);
      setAnalysis(data.analysis);
    } catch (err) {
      alert('Error analyzing file. Please ensure it\'s a valid PDF or Word doc.');
    } finally {
      setLoadingAnalysis(false);
    }
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
      setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, I lost my connection to the hive. Try again later! 🥀' }]);
    } finally {
      setSendingChat(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] transition-colors duration-700 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 py-12 relative">
      <ConfettiAnimation trigger={quizFinished} />
      
      {/* Background Decor */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-500/10 rounded-full blur-[100px] -z-10 animate-pulse"></div>
      <div className="absolute top-1/2 -right-24 w-80 h-80 bg-fuchsia-500/10 rounded-full blur-[100px] -z-10 animate-pulse" style={{ animationDelay: '2s' }}></div>

      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-16 text-center space-y-4"
      >
         <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-gradient-to-r from-primary-500/10 to-indigo-500/10 border border-primary-500/20 text-primary-600 dark:text-primary-400 font-black uppercase tracking-[0.2em] text-[10px]">
             ✨ Next-Gen Intelligence
         </div>
         <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 dark:text-white">
            AI Study <span className="gradient-text italic">Hub.</span>
         </h1>
         <p className="max-w-2xl mx-auto text-lg text-slate-500 dark:text-slate-400 font-medium">
            Your personal intellectual partner. Generate quizzes, analyze materials, and get guidance in seconds.
         </p>
      </motion.header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Tools (8 cols) */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-8 space-y-8"
        >
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Recommendations Card */}
              <motion.section variants={itemVariants} className="glass-card p-8 min-h-[400px] flex flex-col group hover:shadow-primary-500/10 transition-all">
                 <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🚀</div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-widest">Your Path</h2>
                 </div>
                 <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {loadingRec ? (
                       <div className="space-y-4 animate-pulse">
                          {[1,2,3].map(i => <div key={i} className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full w-full"></div>)}
                       </div>
                    ) : (
                       <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed whitespace-pre-line">
                          {recommendation || "Analyzing your profile to build your personalized study journey..."}
                       </p>
                    )}
                 </div>
                 <button onClick={fetchRecommendation} className="mt-6 text-sm font-black text-primary-500 hover:text-primary-600 uppercase tracking-widest flex items-center gap-2 transition-transform active:scale-95">
                    <RefreshCcw className={`w-4 h-4 ${loadingRec ? 'animate-spin' : ''}`} /> Recalculate Logic
                 </button>
              </motion.section>

              {/* File Analysis Card */}
              <motion.section variants={itemVariants} className="glass-card p-8 min-h-[400px] flex flex-col group hover:shadow-indigo-500/10 transition-all">
                 <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">📁</div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-widest">Material AI</h2>
                 </div>
                 {!analysis && !loadingAnalysis ? (
                    <form onSubmit={handleFileAnalysis} className="flex-1 flex flex-col justify-center gap-6">
                       <p className="text-sm text-slate-500 font-medium text-center">Upload material and I'll explain complex concepts.</p>
                       <div className="relative group/input">
                          <input 
                            type="file" 
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => setSelectedFile(e.target.files[0])}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                          <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8 flex flex-col items-center gap-2 group-hover/input:border-primary-400 group-hover/input:bg-primary-500/5 transition-all">
                             <FileText className="w-10 h-10 text-slate-300 group-hover/input:text-primary-500 transition-colors" />
                             <span className="text-xs font-black text-slate-400 group-hover/input:text-primary-500 uppercase tracking-widest text-center truncate w-full">
                                {selectedFile ? selectedFile.name : 'Drop PDF/DOCX here'}
                             </span>
                          </div>
                       </div>
                       <button 
                         type="submit" 
                         disabled={!selectedFile}
                         className="btn-primary py-4 shadow-xl disabled:opacity-50"
                       >
                         Start Analysis
                       </button>
                    </form>
                 ) : (
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                       {loadingAnalysis ? (
                          <div className="h-full flex flex-col items-center justify-center gap-4 text-center">
                             <div className="animate-spin h-10 w-10 border-4 border-primary-500 border-t-transparent rounded-full"></div>
                             <p className="text-sm font-black text-slate-400 animate-pulse uppercase tracking-widest">Honey is reading...</p>
                          </div>
                       ) : (
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                             <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="whitespace-pre-line text-slate-600 dark:text-slate-400 font-medium">{analysis}</motion.p>
                             <button onClick={() => setAnalysis('')} className="mt-6 btn-secondary py-2 px-6 text-xs flex items-center gap-2">
                                <Trash2 className="w-3 h-3" /> Clear Analysis
                             </button>
                          </div>
                       )}
                    </div>
                 )}
              </motion.section>
           </div>

           {/* Quiz Workspace */}
           <motion.section variants={itemVariants} className="glass-card p-10 overflow-hidden relative">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                 <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">Practice Arena.</h2>
                    <p className="text-slate-500 font-medium">Test your mastery with AI-generated challenges.</p>
                 </div>
                 <Brain className="w-12 h-12 text-primary-500/20 absolute -top-2 -right-2 rotate-12" />
              </div>

              {!quiz ? (
                 <form onSubmit={handleGenerateQuiz} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input 
                      type="text" 
                      placeholder="Enter topic (e.g. Algorithms, Botany...)"
                      className="md:col-span-3 input-field py-5 text-lg"
                      value={quizTopic}
                      onChange={(e) => setQuizTopic(e.target.value)}
                      required
                    />
                    <button type="submit" disabled={loadingQuiz} className="btn-primary py-5 text-lg shadow-2xl flex items-center justify-center gap-2">
                       {loadingQuiz ? <div className="animate-spin h-6 w-6 border-2 border-white/30 border-t-white rounded-full"></div> : "Build Quiz"}
                    </button>
                 </form>
              ) : quizFinished ? (
                 <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-12 space-y-6">
                    <div className="text-7xl mb-4">🏆</div>
                    <h3 className="text-4xl font-black text-slate-900 dark:text-white">Mastery Achieved!</h3>
                    <div className="inline-block p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[3rem] border border-slate-100 dark:border-slate-800">
                       <span className="text-6xl font-black text-primary-500">{score}</span>
                       <span className="text-2xl font-bold text-slate-400"> / {quiz.length}</span>
                    </div>
                    <p className="text-lg text-slate-500 font-medium max-w-sm mx-auto">Great job! Your performance has been synced with your study progress badges.</p>
                    <button onClick={() => setQuiz(null)} className="btn-primary py-4 px-12 text-lg shadow-xl hover:scale-105 transition-transform">New Challenge</button>
                 </motion.div>
              ) : (
                 <div className="space-y-8">
                    <div className="flex justify-between items-end">
                       <div className="space-y-1">
                          <span className="text-xs font-black text-primary-500 uppercase tracking-[0.2em]">Question {currentQuestion + 1} / {quiz.length}</span>
                          <h4 className="text-2xl font-bold text-slate-800 dark:text-slate-200">{quiz[currentQuestion].question}</h4>
                       </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <AnimatePresence mode="wait">
                       {quiz[currentQuestion].options.map((option, idx) => {
                          const isSelected = feedback?.selectedIndex === idx;
                          const isCorrect = idx === quiz[currentQuestion].correctAnswer;
                          
                          let cardClass = "border-slate-100 dark:border-slate-800 hover:border-primary-500 hover:bg-primary-500/5";
                          if (feedback && isSelected) {
                            cardClass = feedback.isCorrect ? "border-green-500 bg-green-500/10" : "border-red-500 bg-red-500/10";
                          } else if (feedback && isCorrect) {
                            cardClass = "border-green-500 bg-green-500/10";
                          }

                          return (
                            <motion.button 
                              key={idx + currentQuestion} 
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleAnswer(idx)}
                              disabled={!!feedback}
                              className={`p-6 text-left rounded-3xl border-2 transition-all font-bold text-slate-700 dark:text-slate-300 flex items-center gap-4 ${cardClass}`}
                            >
                               <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black transition-colors ${
                                 feedback && isSelected ? (feedback.isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white') : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-primary-500 group-hover:text-white'
                               }`}>
                                  {feedback && isSelected ? (feedback.isCorrect ? <CheckCircle2 className="w-5 h-5"/> : <XCircle className="w-5 h-5"/>) : String.fromCharCode(65+idx)}
                               </span>
                               {option}
                            </motion.button>
                          );
                       })}
                       </AnimatePresence>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${((currentQuestion + 1) / quiz.length) * 100}%` }}
                         className="bg-primary-500 h-full shadow-[0_0_15px_rgba(14,165,233,0.5)]"
                       ></motion.div>
                    </div>
                 </div>
              )}
           </motion.section>
        </motion.div>

        {/* RIGHT COLUMN: Chat (4 cols) */}
        <div className="lg:col-span-4 h-full sticky top-24">
           <motion.section 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             className="glass-card flex flex-col h-[750px] overflow-hidden shadow-2xl border-white/40 group"
           >
              {/* Chat Header */}
              <div className="p-6 bg-gradient-to-r from-primary-600 to-indigo-700 text-white relative">
                 <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                 <div className="flex items-center gap-4 relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl animate-float shadow-inner">🐝</div>
                    <div>
                       <h3 className="text-xl font-black tracking-tight leading-none mb-1">Honey Studio</h3>
                       <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Online & Learning</span>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Messages Area */}
              <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/50 dark:bg-slate-900/20">
                 <AnimatePresence initial={false}>
                    {messages.map((m, idx) => (
                       <motion.div 
                         key={idx} 
                         initial={{ opacity: 0, scale: 0.9, y: 10 }}
                         animate={{ opacity: 1, scale: 1, y: 0 }}
                         className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                       >
                          <div className={`max-w-[85%] p-5 rounded-[2rem] font-medium text-sm shadow-sm transition-all duration-300 ${
                            m.role === 'user' 
                              ? 'bg-primary-600 text-white rounded-br-none' 
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-bl-none border border-slate-100 dark:border-slate-800'
                          }`}>
                             {m.text}
                          </div>
                       </motion.div>
                    ))}
                 </AnimatePresence>
                 {sendingChat && (
                   <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                      <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl rounded-bl-none flex gap-1 shadow-sm">
                         <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce"></div>
                         <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                         <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                   </motion.div>
                 )}
                 <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
                 <form onSubmit={handleSendChat} className="relative">
                    <input 
                      type="text" 
                      placeholder="Ask Honey anything..."
                      className="input-field py-5 pr-16 bg-slate-100 dark:bg-slate-950 border-transparent focus:bg-white dark:focus:bg-slate-900 shadow-inner"
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      disabled={sendingChat}
                    />
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="submit" 
                      disabled={!chatMessage.trim() || sendingChat}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary-500 to-indigo-600 text-white flex items-center justify-center shadow-lg disabled:opacity-50"
                    >
                       <Send className="w-5 h-5" />
                    </motion.button>
                 </form>
                 <div className="flex justify-center gap-4 mt-6">
                    <div className="flex items-center gap-1.5 opacity-40 hover:opacity-100 transition-opacity cursor-help">
                       <MessageSquare className="w-3 h-3" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Logic 1.5</span>
                    </div>
                    <div className="flex items-center gap-1.5 opacity-40 hover:opacity-100 transition-opacity cursor-help">
                       <Sparkles className="w-3 h-3" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Creative</span>
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
