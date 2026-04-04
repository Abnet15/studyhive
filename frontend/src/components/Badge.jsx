import { motion } from 'framer-motion';
import { Lock, Sparkles, CheckCircle2 } from 'lucide-react';

const Badge = ({ name, icon, description, earned = true }) => {
  return (
    <motion.div
      whileHover={earned ? { y: -2, scale: 1.01 } : { scale: 1.01 }}
      className={`relative flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 border ${
        earned 
        ? 'bg-white dark:bg-slate-900 border-primary-200 dark:border-primary-900/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]' 
        : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 border-dashed dark:border-slate-800/80 shadow-sm'
      }`}
    >
      {/* Dynamic Background Glow for Earned */}
      {earned && (
        <div className="absolute inset-0 bg-gradient-to-r from-primary-50 to-transparent dark:from-primary-900/10 dark:to-transparent rounded-2xl pointer-events-none" />
      )}

      {/* Icon Area */}
      <div className={`relative flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center text-3xl shadow-inner ${
        earned 
        ? 'bg-gradient-to-br from-primary-100 to-indigo-50 dark:from-primary-900/40 dark:to-indigo-900/20 text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform' 
        : 'bg-slate-200/50 dark:bg-slate-800/60 grayscale opacity-40'
      }`}>
        {earned && (
          <motion.div 
            animate={{ rotate: 360 }} 
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 rounded-xl border border-primary-300/30 dark:border-primary-600/30 border-dashed"
          />
        )}
        <div className={earned ? 'animate-float' : ''}>{icon}</div>
      </div>

      {/* Text Area */}
      <div className="flex-1 min-w-0 z-10">
        <div className="flex items-center gap-2 mb-1">
          <h3 className={`font-black uppercase tracking-tight text-sm truncate ${earned ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>
            {name}
          </h3>
          {earned && (
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-[9px] font-black tracking-widest text-emerald-600 dark:text-emerald-400 uppercase">
              <CheckCircle2 className="w-3 h-3" /> Unlocked
            </div>
          )}
        </div>
        <p className={`text-[11px] leading-relaxed font-semibold transition-colors ${earned ? 'text-slate-500 dark:text-slate-400' : 'text-slate-400 dark:text-slate-600'}`}>
          {description}
        </p>
      </div>

      {/* Lock Icon */}
      {!earned && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200/50 dark:bg-slate-800/50 flex items-center justify-center ml-2 border border-slate-300/50 dark:border-slate-700/50 group-hover:bg-slate-200 dark:group-hover:bg-slate-800 transition-colors">
           <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
        </div>
      )}
    </motion.div>
  );
};

export default Badge;

