import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

const Badge = ({ name, icon, description, earned = true }) => {
  return (
    <motion.div
      whileHover={earned ? { y: -10, scale: 1.02 } : {}}
      className={`glass-card p-6 flex items-center gap-5 transition-all duration-500 relative overflow-hidden h-32 ${
        earned
          ? 'border-primary-500/30 shadow-[0_10px_30px_-10px_rgba(14,165,233,0.3)] bg-gradient-to-br from-white to-primary-50/30 dark:from-slate-900 dark:to-primary-900/10'
          : 'opacity-40 grayscale blur-[1px] bg-slate-100 dark:bg-slate-800/50'
      }`}
    >
      {!earned && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/10 backdrop-blur-[2px] z-10">
           <Lock className="w-6 h-6 text-slate-500/50" />
        </div>
      )}

      {/* Decorative pulse for earned badges */}
      {earned && (
         <div className="absolute -top-12 -right-12 w-24 h-24 bg-primary-500/10 rounded-full blur-2xl animate-pulse"></div>
      )}

      <div className={`text-5xl flex-shrink-0 transition-transform duration-700 ${earned ? 'animate-float group-hover:scale-110' : ''}`}>
        {icon}
      </div>
      
      <div className="space-y-1 relative z-10">
        <h3 className={`font-black uppercase tracking-tight text-sm ${earned ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
          {name}
        </h3>
        <p className={`text-[10px] leading-relaxed font-bold uppercase tracking-widest ${earned ? 'text-primary-500' : 'text-slate-400'}`}>
          {description}
        </p>
      </div>
    </motion.div>
  );
};

export default Badge;

