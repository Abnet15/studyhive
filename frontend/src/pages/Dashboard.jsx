import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import MaterialCard from '../components/MaterialCard';
import Badge from '../components/Badge';
import { useBadges, isBadgeEarned } from '../hooks/useBadges';
import { useMaterials } from '../context/MaterialContext';
import { useCourses } from '../context/CourseContext';
import { BookOpen, Star, Download, Sparkles, ChevronRight, Bot } from 'lucide-react';
import StudyPulse from '../components/StudyPulse';

const Dashboard = () => {
  const { user } = useAuth();
  const { materials, materialsLoading } = useMaterials();
  const { courses } = useCourses();
  const { badges, badgesLoading } = useBadges();

  const sortedMaterials = [...(materials || [])].sort(
    (a, b) => new Date(b.upload_date).getTime() - new Date(a.upload_date).getTime()
  );
  const recentMaterials = sortedMaterials.slice(0, 4);
  const recommendedCourses = (courses || []).slice(0, 3);
  const userMaterials = user ? (materials || []).filter((m) => m.uploader_id === user.id) : [];
  const totalDownloads = userMaterials.reduce((sum, m) => sum + (m.downloads || 0), 0);
  const avgRating = userMaterials.length > 0
    ? (userMaterials.reduce((sum, m) => sum + (m.rating || 0), 0) / userMaterials.length).toFixed(1)
    : '0.0';
  const totalUploads = userMaterials.length;

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

        {/* ───── Stat Grid ───── */}
        <motion.section variants={containerVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {[
             { label: 'Total Uploads', value: totalUploads, icon: <BookOpen className="w-8 h-8"/>, color: 'from-blue-500 to-indigo-500', shadow: 'shadow-blue-500/20' },
             { label: 'Avg Rating', value: avgRating, icon: <Star className="w-8 h-8"/>, color: 'from-fuchsia-500 to-purple-500', shadow: 'shadow-fuchsia-500/20' },
             { label: 'Downloads', value: totalDownloads.toLocaleString(), icon: <Download className="w-8 h-8"/>, color: 'from-emerald-400 to-teal-500', shadow: 'shadow-emerald-500/20' },
           ].map((stat, idx) => (
             <motion.div variants={itemVariants} key={idx} className={`glass-card p-6 bg-white dark:bg-slate-900 transition-all duration-300 group hover:-translate-y-1 hover:shadow-2xl ${stat.shadow}`}>
                <div className="flex justify-between items-start mb-6">
                   <div className="space-y-2">
                      <div className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px]">{stat.label}</div>
                      <div className="text-4xl font-black text-slate-900 dark:text-white">{stat.value}</div>
                   </div>
                   <div className={`p-4 rounded-2xl bg-gradient-to-tr ${stat.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      {stat.icon}
                   </div>
                </div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                   <div className={`h-full bg-gradient-to-r ${stat.color} w-3/4 opacity-80 rounded-full`}></div>
                </div>
             </motion.div>
           ))}
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
             
             {/* AI Quick Suggestion */}
             <motion.div variants={itemVariants} className="glass-card p-8 bg-gradient-to-br from-slate-900 to-indigo-950 text-white border-none shadow-[0_20px_50px_-10px_rgba(14,165,233,0.4)] relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-500/30 rounded-full blur-3xl opacity-30"></div>
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md border border-white/20">
                   <Sparkles className="w-7 h-7 text-primary-300" />
                </div>
                <h3 className="text-2xl font-bold mb-3 tracking-tight">AI Insights</h3>
                <p className="text-slate-300 text-sm leading-relaxed mb-8">
                   Based on your profile, we suggests checking out the AI Summaries for <b className="text-white">{user?.dept || 'Computing'}</b> courses!
                </p>
                <Link to="/ai-assistant" className="flex items-center justify-center w-full py-4 bg-white text-slate-900 font-bold rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
                   Generate Summary
                </Link>
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
                  <div className="grid grid-cols-2 gap-3">
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
