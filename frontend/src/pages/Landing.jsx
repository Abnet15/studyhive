import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useMaterials } from '../context/MaterialContext';
import { Sparkles, ArrowRight, BrainCircuit, Rocket, Target, Users, LayoutDashboard } from 'lucide-react';

const Landing = () => {
  const { user } = useAuth();
  const { materialsLoading } = useMaterials();

  const fadeIn = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50 dark:bg-[#030712]">
      {/* ───── Background Elements ───── */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary-500/20 rounded-full blur-[150px] animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent-500/20 rounded-full blur-[150px] animate-blob" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-[40%] left-[50%] w-[30%] h-[30%] bg-indigo-500/20 rounded-full blur-[150px] animate-blob" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* ───── Hero Section ───── */}
      <section className="relative pt-24 pb-20 md:pt-36 md:pb-32 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial="hidden" animate="visible" variants={staggerContainer}
            className="text-center lg:text-left space-y-8"
          >
            <motion.div variants={fadeIn} className="inline-flex items-center gap-3 px-5 py-2 rounded-full glass-card border-primary-500/30 shadow-[0_0_20px_rgba(14,165,233,0.15)] animate-float">
               <Sparkles className="w-4 h-4 text-primary-500 animate-pulse" />
               <span className="text-sm font-bold text-slate-700 dark:text-slate-200">BiT AI Hackathon 2026 Special Edition</span>
            </motion.div>
            
            <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.05]">
              <span className="text-slate-900 dark:text-white">Elevate Your</span><br />
              <span className="gradient-text uppercase tracking-tighter drop-shadow-sm">Studying</span>
            </motion.h1>

            <motion.p variants={fadeIn} className="text-lg md:text-2xl text-slate-600 dark:text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
              The collaborative hub for ambitious students. Powered by a <span className="text-primary-500 font-bold">Generative AI Engine</span> to help you learn 10x faster.
            </motion.p>

            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start pt-4">
              {!user ? (
                <>
                  <Link to="/register" className="btn-primary group text-lg flex items-center justify-center">
                    Start Learning Free
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link to="/login" className="btn-secondary text-lg">
                    Sign In
                  </Link>
                </>
              ) : (
                <Link to="/dashboard" className="btn-primary text-lg flex items-center justify-center">
                  <LayoutDashboard className="w-5 h-5" />
                  Open Dashboard
                </Link>
              )}
            </motion.div>
          </motion.div>

          {/* AI Visual Mockup */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            className="relative hidden lg:block"
          >
             <div className="absolute -inset-4 bg-gradient-to-tr from-primary-500/30 to-accent-500/30 rounded-[3rem] blur-3xl animate-pulse-glow"></div>
             <div className="glass-card p-8 space-y-6 relative border-white/50 dark:border-white/10 animate-float shadow-2xl" style={{ animationDuration: '6s' }}>
                <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-700/50 pb-6">
                   <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary-500 to-indigo-500 flex items-center justify-center text-white shadow-xl">
                      <BrainCircuit className="w-7 h-7 animate-pulse" />
                   </div>
                   <div>
                      <div className="font-bold text-lg text-slate-900 dark:text-white">Honey AI Assistant</div>
                      <div className="flex items-center gap-2 mt-1">
                         <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
                         <span className="text-xs text-green-500 font-bold uppercase tracking-widest">Active & Ready</span>
                      </div>
                   </div>
                </div>
                <div className="space-y-5">
                   <motion.div 
                     initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1 }}
                     className="p-5 rounded-2xl rounded-tl-sm bg-slate-100 dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-300 font-medium"
                   >
                      I've analyzed your "Data Structures" PDF. I found 15 key terms. Ready for a practice quiz?
                   </motion.div>
                   <motion.div 
                     initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 2 }}
                     className="flex justify-end"
                   >
                      <div className="p-4 rounded-2xl rounded-tr-sm bg-primary-600 text-white text-sm font-bold shadow-xl shadow-primary-500/20">
                         Create the Quiz! ✨
                      </div>
                   </motion.div>
                </div>
             </div>
          </motion.div>
        </div>
      </section>

      {/* ───── AI Features Highlight ───── */}
      <section className="py-24 relative z-10 bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl border-y border-white/40 dark:border-white/5">
         <div className="max-w-7xl mx-auto px-4">
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeIn}
              className="text-center mb-20 space-y-4"
            >
               <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white tracking-tight">Meet <span className="gradient-text">Honey AI</span></h2>
               <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg md:text-xl">
                  Stop reading endless PDFs. StudyHive extracts what matters instantly.
               </p>
            </motion.div>

            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
               {[
                 { title: 'Smart Summaries', desc: 'Instantly get the core concepts of a 50-page document condensed into a 2-minute read.', icon: <BrainCircuit className="w-8 h-8 text-white"/>, color: 'from-blue-500 to-cyan-400' },
                 { title: 'Auto Flashcards', desc: 'Honey AI automatically scans uploads and extracts the 5 most critical terms.', icon: <Sparkles className="w-8 h-8 text-white"/>, color: 'from-purple-500 to-pink-500' },
                 { title: 'Exam Generator', desc: 'Test your knowledge on the fly with auto-generated multiple-choice quizzes.', icon: <Target className="w-8 h-8 text-white"/>, color: 'from-orange-500 to-amber-500' }
               ].map((item, idx) => (
                 <motion.div key={idx} variants={fadeIn} className="glass-card p-10 group hover:-translate-y-3 transition-all duration-500 hover:shadow-2xl hover:shadow-primary-500/10">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-tr ${item.color} flex items-center justify-center mb-8 shadow-lg shadow-${item.color.split('-')[1]}/30 group-hover:scale-110 transition-transform`}>
                       {item.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">{item.title}</h3>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{item.desc}</p>
                 </motion.div>
               ))}
            </motion.div>
         </div>
      </section>

      {/* ───── Social Proof ───── */}
      <section className="py-24 bg-[#0a0f1c] text-white relative overflow-hidden">
         <div className="absolute top-0 right-0 w-[60%] h-full bg-primary-600/10 skew-x-12 -z-10 blur-3xl"></div>
         <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 items-center gap-16">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}>
               <h2 className="text-4xl md:text-6xl font-extrabold mb-8 tracking-tight">Join the smart <br/> learning era.</h2>
               <p className="text-slate-400 text-xl mb-12 leading-relaxed">
                  StudyHive isn't just a drive folder. It's a living ecosystem of curated, AI-enhanced knowledge built to guarantee your academic success.
               </p>
               <div className="flex gap-12">
                  <div className="space-y-2">
                     <div className="text-5xl font-extrabold text-white">98%</div>
                     <div className="text-sm font-bold uppercase tracking-widest text-primary-400">Exam Pass Rate</div>
                  </div>
                  <div className="space-y-2">
                     <div className="text-5xl font-extrabold text-white">10x</div>
                     <div className="text-sm font-bold uppercase tracking-widest text-accent-400">Faster Prep</div>
                  </div>
               </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
              className="grid grid-cols-2 gap-4"
            >
               <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[2.5rem] p-8 aspect-square flex flex-col justify-end hover:bg-white/10 transition-colors">
                  <Users className="w-12 h-12 text-primary-400 mb-4" />
                  <div className="font-bold text-xl">Collaboration</div>
               </div>
               <div className="bg-gradient-to-br from-primary-600 to-indigo-600 rounded-[2.5rem] p-8 aspect-square flex flex-col justify-end translate-y-8 shadow-2xl shadow-primary-500/20">
                  <Rocket className="w-12 h-12 text-white mb-4" />
                  <div className="font-bold text-xl text-white">Acceleration</div>
               </div>
            </motion.div>
         </div>
      </section>
      
      {/* ───── Footer CTA ───── */}
      <section className="py-32 px-4 text-center relative z-10">
         <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="max-w-4xl mx-auto space-y-12">
            <h2 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.1]">
               Built for the future of <br/><span className="gradient-text italic pr-2">Education.</span>
            </h2>
            <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
               <Link to="/register" className="btn-primary py-5 px-12 text-lg lg:text-xl">
                  Join StudyHive Free
               </Link>
            </div>
         </motion.div>
      </section>
    </div>
  );
};

export default Landing;
