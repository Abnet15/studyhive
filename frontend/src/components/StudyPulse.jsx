import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Zap, Trophy, Target } from 'lucide-react';

const StudyPulse = ({ user }) => {
  // Mock data for the activity pulse (last 21 days)
  const pulseData = [
    2, 0, 5, 8, 3, 0, 0, 
    4, 1, 9, 2, 6, 3, 0,
    1, 7, 4, 2, 5, 8, 3
  ];

  const getHeatColor = (val) => {
    if (val === 0) return 'bg-slate-100 dark:bg-slate-800/50';
    if (val < 3) return 'bg-primary-200 dark:bg-primary-900/30';
    if (val < 6) return 'bg-primary-400 dark:bg-primary-700/60';
    return 'bg-primary-600 dark:bg-primary-500 shadow-[0_0_10px_rgba(14,165,233,0.4)]';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-6 border-slate-200 dark:border-slate-800 space-y-6 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
         <Zap className="w-24 h-24 text-primary-500" />
      </div>

      <div className="flex justify-between items-start">
         <div className="space-y-1">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-tight">
               Study Pulse
            </h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Efficiency Metrics</p>
         </div>
         <div className="flex items-center gap-1.5 px-3 py-1 bg-orange-500/10 text-orange-600 rounded-full border border-orange-500/20">
            <Flame className="w-3.5 h-3.5 fill-orange-500" />
            <span className="text-xs font-black">4 DAY STREAK</span>
         </div>
      </div>

      {/* Heatmap Grid */}
      <div className="flex flex-wrap gap-1.5">
         {pulseData.map((val, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.02 }}
              className={`w-4 h-4 rounded-md ${getHeatColor(val)} cursor-help transition-all hover:scale-125`}
              title={`${val} sessions on day ${i+1}`}
            />
         ))}
      </div>

      <div className="grid grid-cols-2 gap-4 pt-2">
         <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-1">
               <Trophy className="w-3.5 h-3.5 text-amber-500" />
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Personal Best</span>
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-white">12 Days</div>
         </div>
         <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-1">
               <Target className="w-3.5 h-3.5 text-primary-500" />
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Goal Progress</span>
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-white">82%</div>
         </div>
      </div>

      <button className="w-full py-3 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl">
         View Detailed Analytics
      </button>
    </motion.div>
  );
};

export default StudyPulse;
