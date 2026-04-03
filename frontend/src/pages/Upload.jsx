import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import UploadForm from '../components/UploadForm';
import { motion } from 'framer-motion';
import { UploadCloud, Sparkles, ShieldCheck, Zap } from 'lucide-react';

const Upload = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen px-4 py-12 bg-slate-50 dark:bg-[#030712] relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-[150px] pointer-events-none -z-10 animate-blob"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-accent-500/10 rounded-full blur-[150px] pointer-events-none -z-10 animate-blob" style={{ animationDelay: '3s' }}></div>

      <div className="max-w-4xl mx-auto space-y-10">
        {/* Premium Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-[1.5rem] bg-gradient-to-tr from-primary-600 to-indigo-600 text-white shadow-2xl shadow-primary-500/30 mb-2">
            <UploadCloud className="w-10 h-10" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Share Your <span className="gradient-text italic">Knowledge</span>
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-xl mx-auto leading-relaxed">
            Upload study materials & exams. Our <span className="text-primary-500 font-bold">Honey AI</span> will automatically generate smart summaries, key terms, and practice quizzes.
          </p>
        </motion.div>

        {/* Feature Pills */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-4"
        >
          {[
            { icon: <Sparkles className="w-4 h-4" />, text: 'AI Auto-Summary', color: 'text-primary-500 bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800' },
            { icon: <Zap className="w-4 h-4" />, text: 'Instant Processing', color: 'text-accent-500 bg-accent-50 dark:bg-accent-900/20 border-accent-200 dark:border-accent-800' },
            { icon: <ShieldCheck className="w-4 h-4" />, text: 'Secure Upload', color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' },
          ].map((pill, i) => (
            <div key={i} className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border ${pill.color}`}>
              {pill.icon} {pill.text}
            </div>
          ))}
        </motion.div>

        {/* Upload Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.3 }}
        >
          <UploadForm />
        </motion.div>
      </div>
    </div>
  );
};

export default Upload;
