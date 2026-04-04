import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import MaterialCard from '../components/MaterialCard';
import Badge from '../components/Badge';
import { useBadges, isBadgeEarned } from '../hooks/useBadges';
import { useMaterials } from '../context/MaterialContext';
import { useCourses } from '../context/CourseContext';
import { BookOpen, Star, Download, Sparkles, ChevronRight, Bot, Target, Flame } from 'lucide-react';
import StudyPulse from '../components/StudyPulse';

const Dashboard = () => {
  const { user, token } = useAuth();
  const { materials, materialsLoading } = useMaterials();
  const { courses } = useCourses();
  const { badges, badgesLoading } = useBadges();

  const [dashboardData, setDashboardData] = useState({
    totalUploads: 0,
    totalDownloads: 0,
    exitReadiness: 0
  });

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const url = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${url}/dashboard/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setDashboardData(data);
        }
      } catch (e) {
        console.error("Failed to fetch dashboard summary", e);
      }
    };
    if (token) fetchSummary();
  }, [token]);

  const { totalUploads, totalDownloads, exitReadiness } = dashboardData;

  const sortedMaterials = [...(materials || [])].sort(
    (a, b) => new Date(b.upload_date).getTime() - new Date(a.upload_date).getTime()
  );
  const recentMaterials = sortedMaterials.slice(0, 4);
  const recommendedCourses = (courses || []).slice(0, 3);

  // ── GAMIFICATION: Honey Drops & Dynamic Rank ──
  const honeyDrops = (totalUploads * 150) + (totalDownloads * 25) + 450;
  const getRank = (xp) => {
    if (xp < 500) return 'Novice Bee';
    if (xp < 1500) return 'Worker Bee';
    if (xp < 3000) return 'Hive Mind';
    return 'Master Scholar';
  };
  const currentRank = getRank(honeyDrops);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div className="min-h-screen pb-20 pt-10 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-[#030712] relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-[100px] pointer-events-none -z-10 animate-pulse-glow"></div>
      
      <motion.div 
        initial="hidden" animate="visible" variants={containerVariants}
        className="max-w-7xl mx-auto space-y-12"
      >
        
        {/* ───── Header & Greeting ───── */}
        <motion.header variants={itemVariants} className="flex flex-col md:flex-row justify-between items-end gap-6 bg-white/40 dark:bg-slate-900/40 p-8 rounded-[2rem] border border-white/60 dark:border-white/10 backdrop-blur-xl shadow-xl">
           <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                 Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
              </h1>
              <p className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wide text-xs">
                 <span className="w-2 h-2 rounded-full bg-primary-500 animate-ping"></span>
                 {user?.dept || 'Computing Faculty'} • Year {user?.year || '3'}
              </p>
           </div>
           <Link to="/ai-assistant" className="btn-primary py-4 px-8 shadow-primary-500/30 font-bold tracking-wide">
              <Sparkles className="w-5 h-5"/> Honey AI Console
           </Link>
        </motion.header>

        {/* ───── Gamified Bento Stat Grid ───── */}
        <motion.section variants={containerVariants} className="grid grid-cols-1 md:grid-cols-4 gap-6">
           
           {/* Bento 1: Honey Drops (Spans 1) */}
           <motion.div variants={itemVariants} className="glass-card p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-none group hover:-translate-y-1 transition-all relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 dark:bg-amber-500/5 blur-3xl rounded-full pointer-events-none"></div>
              <div className="flex justify-between items-start mb-6 relative z-10 w-full">
                 <div className="space-y-1">
                    <div className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px]">Honey Drops (XP)</div>
                    <div className="text-4xl font-black text-slate-900 dark:text-white drop-shadow-sm">{honeyDrops.toLocaleString()}</div>
                 </div>
                 <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-900/20 backdrop-blur-md group-hover:scale-110 group-hover:rotate-6 transition-transform shadow-sm"><Flame className="w-6 h-6 text-amber-500 dark:text-amber-400"/></div>
              </div>
              <div className="inline-flex items-center self-start gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-slate-800 rounded-full text-xs font-black shadow-sm border border-amber-100 dark:border-slate-700 relative z-10">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" /> <span className="text-slate-700 dark:text-slate-300">Rank: {currentRank}</span>
              </div>
           </motion.div>

           {/* Bento 2: Exit Exam Readiness (Spans 1) */}
           <motion.div variants={itemVariants} className="glass-card p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-none group hover:-translate-y-1 transition-all">
              <div className="flex justify-between items-start mb-6">
                 <div className="space-y-1">
                    <div className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px]">Exit Readiness</div>
                    <div className="text-4xl font-black text-slate-900 dark:text-white">{exitReadiness}<span className="text-xl text-slate-400 font-extrabold">%</span></div>
                 </div>
                 <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 group-hover:scale-110 transition-transform"><Target className="w-6 h-6"/></div>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                 <div className={`h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]`} style={{ width: `${exitReadiness}%` }}></div>
              </div>
           </motion.div>

           {/* Bento 3: Agentic Context Memory (Spans 2) */}
           <motion.div variants={itemVariants} className="md:col-span-2 glass-card p-6 md:p-8 bg-slate-900 text-white relative overflow-hidden group hover:-translate-y-1 shadow-2xl shadow-indigo-500/20 transition-all border border-slate-800 flex items-center">
              <div className="absolute -right-20 top-1/2 -translate-y-1/2 w-64 h-64 bg-primary-500/20 blur-[60px] rounded-full pointer-events-none"></div>
              <div className="relative z-10 flex flex-col sm:flex-row gap-6 items-center w-full">
                <div className="w-16 h-16 shrink-0 rounded-[1.5rem] bg-gradient-to-tr from-primary-500 to-fuchsia-500 flex items-center justify-center p-[2px] shadow-lg shadow-primary-500/30 group-hover:scale-105 transition-transform duration-500">
                   <div className="w-full h-full bg-slate-900 rounded-[1.4rem] flex items-center justify-center relative overflow-hidden">
                      <Bot className="w-8 h-8 text-primary-400 animate-pulse" />
                   </div>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-lg font-black flex items-center justify-center sm:justify-start gap-2 tracking-tight text-white mb-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400"/> Honey Agentic Insights
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed mb-4 max-w-sm mx-auto sm:mx-0">
                    I noticed you struggled with <span className="text-white font-bold underline decoration-primary-500 decoration-2 underline-offset-2">Data Structures</span> during your last Exit Exam Diagnostic. Ready to patch those knowledge gaps?
                  </p>
                  <Link to="/honey-teacher" className="inline-flex items-center gap-2 text-xs font-black px-5 py-2.5 bg-white/10 hover:bg-primary-500 border border-white/10 hover:border-primary-400 rounded-full transition-all active:scale-95 shadow-sm">
                    Start Masterclass on Binary Heaps <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
           </motion.div>
        </motion.section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* ───── Left Column: Content ───── */}
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-8">
             <div className="flex justify-between items-center bg-white/50 dark:bg-slate-900/50 p-4 rounded-2xl backdrop-blur-sm border border-slate-200 dark:border-slate-800">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                   <span className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg text-primary-600"><BookOpen className="w-5 h-5"/></span>
                   Recent Resources
                </h2>
                <Link to="/courses" className="text-sm font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1 group">
                   See Everything <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
             </div>

             {materialsLoading ? (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map(i => <div key={i} className="h-48 rounded-[2rem] bg-slate-200 dark:bg-slate-800 animate-pulse"></div>)}
               </div>
             ) : (
               <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {recentMaterials.map(material => (
                    <motion.div variants={itemVariants} key={material.id}>
                       <MaterialCard material={material} />
                    </motion.div>
                  ))}
                  {recentMaterials.length === 0 && (
                     <div className="col-span-full py-12 text-center text-slate-500 font-medium bg-white/50 dark:bg-slate-900/50 rounded-[2rem] border border-dashed border-slate-300 dark:border-slate-700">
                        No materials found. Be the first to upload!
                     </div>
                  )}
               </motion.div>
             )}
          </motion.div>

          {/* ───── Right Column: Side Widgets ───── */}
          <div className="space-y-8">
             
             {/* Quick Stats Summary (Replaced Old AI Quick Suggestion) */}
             <motion.div variants={itemVariants} className="glass-card p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                   <BookOpen className="w-5 h-5 text-indigo-500" /> Platform Impact
                </h2>
                <div className="space-y-5">
                   <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center"><Download className="w-5 h-5"/></div>
                         <div className="text-sm font-bold text-slate-700 dark:text-slate-300">Total Downloads</div>
                      </div>
                      <div className="text-lg font-black text-slate-900 dark:text-white">{totalDownloads.toLocaleString()}</div>
                   </div>
                   <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-500 flex items-center justify-center"><Star className="w-5 h-5"/></div>
                         <div className="text-sm font-bold text-slate-700 dark:text-slate-300">Avg Rating</div>
                      </div>
                      <div className="text-lg font-black text-slate-900 dark:text-white">{avgRating}</div>
                   </div>
                   <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 flex items-center justify-center"><BookOpen className="w-5 h-5"/></div>
                         <div className="text-sm font-bold text-slate-700 dark:text-slate-300">Materials Uploaded</div>
                      </div>
                      <div className="text-lg font-black text-slate-900 dark:text-white">{totalUploads}</div>
                   </div>
                </div>
             </motion.div>

             {/* Study Pulse Heatmap */}
             <motion.div variants={itemVariants}>
                <StudyPulse user={user} />
             </motion.div>

             {/* Badges Hub */}
             <motion.div variants={itemVariants} className="glass-card p-6 border-slate-200 dark:border-slate-800 space-y-6">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                   🏆 Top Achievements
                </h2>
                {badgesLoading ? (
                  <div className="h-32 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse"></div>
                ) : (
                  <div className="space-y-4">
                    {badges.slice(0, 4).map(badge => (
                      <Badge
                        key={badge.id}
                        name={badge.name}
                        icon={badge.icon}
                        description={badge.description}
                        earned={isBadgeEarned(badge, { totalUploads, avgRating: Number(avgRating), totalDownloads })}
                      />
                    ))}
                  </div>
                )}
             </motion.div>

             {/* Recommended Courses List */}
             <motion.div variants={itemVariants} className="glass-card p-6 border-slate-200 dark:border-slate-800 space-y-6">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                   🧭 Course Navigator
                </h2>
                <div className="space-y-3">
                   {recommendedCourses.map((course, idx) => (
                     <Link key={course.id} to={`/courses?course=${course.id}`} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm ${idx===0 ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/30' : idx===1 ? 'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/30' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30'}`}>
                           {course.course_code.substring(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                           <div className="text-sm font-bold truncate text-slate-900 dark:text-white group-hover:text-primary-500 transition-colors">{course.course_name}</div>
                           <div className="text-xs text-slate-500 font-medium">{course.course_code}</div>
                        </div>
                     </Link>
                   ))}
                </div>
             </motion.div>

          </div>

        </div>

      </motion.div>
    </div>
  );
};

export default Dashboard;
