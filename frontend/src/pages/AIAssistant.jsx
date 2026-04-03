import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import aiService from '../services/aiService';

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

  useEffect(() => {
    if (user) fetchRecommendation();
    scrollToBottom();
  }, [user, messages]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
    if (index === quiz[currentQuestion].correctAnswer) setScore(score + 1);
    if (currentQuestion + 1 < quiz.length) setCurrentQuestion(currentQuestion + 1);
    else setQuizFinished(true);
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-500/10 rounded-full blur-[100px] -z-10 animate-pulse"></div>
      <div className="absolute top-1/2 -right-24 w-80 h-80 bg-accent-500/10 rounded-full blur-[100px] -z-10 animate-pulse" style={{ animationDelay: '2s' }}></div>

      <header className="mb-16 text-center space-y-4">
         <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-gradient-to-r from-primary-500/10 to-indigo-500/10 border border-primary-500/20 text-primary-600 dark:text-primary-400 font-black uppercase tracking-[0.2em] text-[10px]">
             ✨ Next-Gen Intelligence
         </div>
         <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 dark:text-white">
            AI Study <span className="gradient-text italic">Hub.</span>
         </h1>
         <p className="max-w-2xl mx-auto text-lg text-slate-500 dark:text-slate-400 font-medium">
            Your personal intellectual partner. Generate quizzes, analyze materials, and get guidance in seconds.
         </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Tools (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
           
           {/* Section 1: Recommendations & Analysis Dashboard */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Recommendations Card */}
              <section className="glass-card p-8 min-h-[400px] flex flex-col">
                 <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-2xl">🚀</div>
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
                    🔄 Recalculate Logic
                 </button>
              </section>

              {/* File Analysis Card */}
              <section className="glass-card p-8 min-h-[400px] flex flex-col">
                 <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-2xl">📁</div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-widest">Material AI</h2>
                 </div>
                 {!analysis && !loadingAnalysis ? (
                    <form onSubmit={handleFileAnalysis} className="flex-1 flex flex-col justify-center gap-6">
                       <p className="text-sm text-slate-500 font-medium text-center">Upload a course material (PDF/Word) and I'll explain the complex concepts.</p>
                       <div className="relative group">
                          <input 
                            type="file" 
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => setSelectedFile(e.target.files[0])}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                          <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8 flex flex-col items-center gap-2 group-hover:border-primary-400 group-hover:bg-primary-500/5 transition-all">
                             <span className="text-3xl">📤</span>
                             <span className="text-xs font-black text-slate-400 group-hover:text-primary-500 uppercase tracking-widest">
                                {selectedFile ? selectedFile.name : 'Select PDF/DOCX'}
                             </span>
                          </div>
                       </div>
                       <button 
                         type="submit" 
                         disabled={!selectedFile}
                         className="btn-primary py-4 py-4 shadow-xl disabled:opacity-50"
                       >
                         Start Analysis
                       </button>
                    </form>
                 ) : (
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                       {loadingAnalysis ? (
                          <div className="h-full flex flex-col items-center justify-center gap-4 text-center">
                             <div className="animate-spin h-10 w-10 border-4 border-primary-500 border-t-transparent rounded-full"></div>
                             <p className="text-sm font-black text-slate-400 animate-pulse uppercase tracking-widest">Honey is reading your material...</p>
                          </div>
                       ) : (
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                             <p className="whitespace-pre-line text-slate-600 dark:text-slate-400">{analysis}</p>
                             <button onClick={() => setAnalysis('')} className="mt-4 btn-secondary py-2 px-6 text-xs">Analyze Another</button>
                          </div>
                       )}
                    </div>
                 )}
              </section>
           </div>

           {/* Quiz Workspace */}
           <section className="glass-card p-10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                 <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">Practice Arena.</h2>
                    <p className="text-slate-500 font-medium">Generate AI quizzes to test your mastery levels.</p>
                 </div>
                 {!quiz && (
                    <div className="flex gap-2 p-2 bg-slate-100 dark:bg-slate-900 rounded-2xl">
                       <span className="px-4 py-2 bg-white dark:bg-slate-800 rounded-xl text-xs font-black text-primary-500 shadow-sm">AI GEN v2.0</span>
                    </div>
                 )}
              </div>

              {!quiz ? (
                 <form onSubmit={handleGenerateQuiz} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input 
                      type="text" 
                      placeholder="Enter a topic (e.g. Cell Biology, Algorithms...)"
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
                 <div className="text-center py-12 space-y-6">
                    <div className="text-6xl animate-bounce">🏆</div>
                    <h3 className="text-4xl font-black text-slate-900 dark:text-white">Mastery Achieved!</h3>
                    <p className="text-xl text-slate-500">You crushed it with <span className="text-primary-500 font-black">{score}/{quiz.length}</span> correct answers.</p>
                    <button onClick={() => setQuiz(null)} className="btn-primary py-4 px-12 text-lg shadow-xl">New Challenge</button>
                 </div>
              ) : (
                 <div className="space-y-8 animate-fade-in">
                    <div className="flex justify-between items-end">
                       <div className="space-y-1">
                          <span className="text-xs font-black text-primary-500 uppercase tracking-widest">Question {currentQuestion + 1} of {quiz.length}</span>
                          <h4 className="text-2xl font-bold text-slate-800 dark:text-slate-200">{quiz[currentQuestion].question}</h4>
                       </div>
                       <div className="text-2xl font-black text-slate-300">0{currentQuestion + 1}</div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {quiz[currentQuestion].options.map((option, idx) => (
                          <button 
                            key={idx} 
                            onClick={() => handleAnswer(idx)}
                            className="p-6 text-left rounded-3xl border-2 border-slate-100 dark:border-slate-800 hover:border-primary-500 hover:bg-primary-500/5 transition-all font-bold text-slate-700 dark:text-slate-300 group flex items-center gap-4"
                          >
                             <span className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs text-slate-400 group-hover:bg-primary-500 group-hover:text-white transition-colors">{String.fromCharCode(65+idx)}</span>
                             {option}
                          </button>
                       ))}
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                       <div className="bg-primary-500 h-full transition-all duration-700" style={{ width: `${((currentQuestion + 1) / quiz.length) * 100}%` }}></div>
                    </div>
                 </div>
              )}
           </section>
        </div>

        {/* RIGHT COLUMN: Chat (4 cols) */}
        <div className="lg:col-span-4 h-full sticky top-24">
           <section className="glass-card flex flex-col h-[700px] overflow-hidden shadow-2xl border-white/40">
              {/* Chat Header */}
              <div className="p-6 bg-gradient-to-r from-primary-500 to-indigo-600 text-white">
                 <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl animate-float">🐝</div>
                    <div>
                       <h3 className="text-lg font-black tracking-tight leading-none mb-1">Honey AI</h3>
                       <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                          <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Synchronized</span>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/30 dark:bg-slate-900/10">
                 {messages.map((m, idx) => (
                    <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                       <div className={`max-w-[85%] p-4 rounded-3xl font-medium text-sm shadow-sm ${
                         m.role === 'user' 
                           ? 'bg-primary-500 text-white rounded-br-none' 
                           : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-bl-none border border-slate-100 dark:border-slate-700'
                       }`}>
                          {m.text}
                       </div>
                    </div>
                 ))}
                 {sendingChat && (
                   <div className="flex justify-start">
                      <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl rounded-bl-none flex gap-1">
                         <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce"></div>
                         <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                         <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                   </div>
                 )}
                 <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md">
                 <form onSubmit={handleSendChat} className="relative">
                    <input 
                      type="text" 
                      placeholder="Ask Honey anything..."
                      className="input-field py-5 pr-16 bg-slate-50 dark:bg-slate-900 border-transparent focus:bg-white dark:focus:bg-slate-800"
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      disabled={sendingChat}
                    />
                    <button 
                      type="submit" 
                      disabled={!chatMessage.trim() || sendingChat}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-primary-500 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                    >
                       →
                    </button>
                 </form>
                 <p className="text-[10px] text-center mt-4 font-bold text-slate-400 uppercase tracking-widest">
                    AI can make mistakes. Always cross-check with your professor.
                 </p>
              </div>
           </section>
        </div>

      </div>
    </div>
  );
};

export default AIAssistant;
