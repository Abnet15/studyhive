import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMaterials } from '../context/MaterialContext';
import { useBadges, isBadgeEarned } from '../hooks/useBadges';
import MaterialCard from '../components/MaterialCard';
import Badge from '../components/Badge';
import { motion } from 'framer-motion';
import { Settings, BookOpen, ShieldCheck, Mail, Star, Download, TrendingUp } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const { materials, loading: matLoading } = useMaterials();
  const { badges, loading: badgeLoading } = useBadges();

  const userMaterials = useMemo(
    () => materials.filter((m) => m.uploader_id === user?.id),
    [materials, user]
  );

  const stats = useMemo(() => {
    const totalUploads = userMaterials.length;
    const avgRating = totalUploads
      ? (userMaterials.reduce((s, m) => s + (m.rating || 0), 0) / totalUploads).toFixed(1)
      : '0.0';
    const totalDownloads = userMaterials.reduce((s, m) => s + (m.downloads || 0), 0);
    return { totalUploads, avgRating, totalDownloads };
  }, [userMaterials]);

  const badgeList = useMemo(
    () =>
      badges.map((b) => ({
        ...b,
        earned: isBadgeEarned(b, stats.totalUploads, Number(stats.avgRating), stats.totalDownloads),
      })),
    [badges, stats]
  );

  if (!user) return null;

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/5 rounded-full blur-[120px] -z-10"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[120px] -z-10"></div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-12"
      >
        {/* Profile Header (Player Card Style) */}
        <motion.div variants={itemVariants} className="glass-card overflow-hidden border-none shadow-[0_30px_60px_-15px_rgba(15,23,42,0.15)] relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-600 via-indigo-600 to-accent-600"></div>
          <div className="p-8 md:p-12 relative z-10 flex flex-col md:flex-row items-center gap-10">
             
             {/* Avatar Box */}
             <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-tr from-primary-500 to-indigo-500 rounded-[2.5rem] blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-700 shadow-2xl flex items-center justify-center text-5xl font-black text-primary-500 relative z-10 overflow-hidden">
                   {user.name?.charAt(0).toUpperCase()}
                   <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-primary-500/10 to-transparent"></div>
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-green-500 border-4 border-white dark:border-slate-900 shadow-lg flex items-center justify-center text-white z-20">
                   <ShieldCheck className="w-5 h-5"/>
                </div>
             </div>

             <div className="flex-1 text-center md:text-left space-y-4">
                <div>
                   <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">{user.name}</h1>
                   <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 mt-2">
                      <div className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-slate-800 rounded-full border border-slate-100 dark:border-slate-700 shadow-sm text-xs font-black text-slate-500 uppercase tracking-widest">
                         <BookOpen className="w-3 h-3 text-primary-500" /> {user.dept}
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-slate-800 rounded-full border border-slate-100 dark:border-slate-700 shadow-sm text-xs font-black text-slate-500 uppercase tracking-widest">
                         <Mail className="w-3 h-3 text-indigo-500" /> {user.email}
                      </div>
                   </div>
                </div>
                
                {/* Visual Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                   {[
                     { val: stats.totalUploads, label: 'Contributions', icon: <TrendingUp className="w-4 h-4 text-green-500"/> },
                     { val: stats.avgRating, label: 'Reputation', icon: <Star className="w-4 h-4 text-amber-500"/> },
                     { val: stats.totalDownloads, label: 'Community Impact', icon: <Download className="w-4 h-4 text-primary-500"/> }
                   ].map((stat, i) => (
                      <div key={i} className="p-4 rounded-3xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 text-center md:text-left">
                         <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                            {stat.icon}
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</span>
                         </div>
                         <div className="text-2xl font-black text-slate-900 dark:text-white">{stat.val}</div>
                      </div>
                   ))}
                </div>
             </div>

             <div className="flex flex-col gap-3 w-full md:w-auto">
                <Link to="/settings" className="btn-secondary py-3 px-8 flex items-center justify-center gap-3 shadow-xl">
                   <Settings className="w-5 h-5" /> Settings
                </Link>
                <div className="p-4 rounded-3xl bg-primary-500/10 border border-primary-500/20 text-center">
                   <div className="text-[10px] font-black text-primary-600 uppercase tracking-widest">Growth Tier</div>
                   <div className="text-xl font-black text-primary-700 dark:text-primary-400">Elite Scholar</div>
                </div>
             </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
           
           {/* LEFT: Uploads (8 cols) */}
           <div className="lg:col-span-8 space-y-8">
              <div className="flex justify-between items-center px-2">
                 <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Your Digital Library</h2>
                 <Link to="/upload" className="text-xs font-black text-primary-500 uppercase tracking-[0.2em] hover:translate-x-2 transition-transform">+ Upload More</Link>
              </div>

              {matLoading ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1,2,3,4].map(i => <div key={i} className="h-64 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-[2.5rem]"></div>)}
                 </div>
              ) : userMaterials.length === 0 ? (
                 <div className="glass-card py-20 text-center space-y-6">
                    <div className="text-6xl text-slate-200">📚</div>
                    <p className="text-slate-500 font-bold max-w-sm mx-auto">You haven't shared any knowledge yet. Your materials could help hundreds of students!</p>
                    <Link to="/upload" className="btn-primary py-4 px-12 inline-block shadow-2xl">Start Contributing</Link>
                 </div>
              ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {userMaterials.map((m) => (
                      <motion.div key={m.id} variants={itemVariants}>
                        <MaterialCard material={m} />
                      </motion.div>
                    ))}
                 </div>
              )}
           </div>

           {/* RIGHT: Badges (4 cols) */}
           <div className="lg:col-span-4 space-y-8">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white px-2">Unlockables.</h2>
              
              <div className="grid grid-cols-1 gap-4">
                 {badgeLoading ? (
                    <div className="space-y-4">
                       {[1,2,3].map(i => <div key={i} className="h-24 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-3xl"></div>)}
                    </div>
                 ) : (
                    badgeList.map((b) => (
                      <motion.div key={b.id} variants={itemVariants}>
                        <Badge {...b} />
                      </motion.div>
                    ))
                 )}
              </div>

              <div className="p-8 rounded-[2.5rem] bg-gradient-to-tr from-slate-900 to-indigo-950 text-white relative overflow-hidden group">
                 <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent-500/20 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-[3s]"></div>
                 <h4 className="text-xl font-bold mb-2 relative z-10">Next Goal 🎯</h4>
                 <p className="text-slate-400 text-xs font-medium mb-6 relative z-10">Get 10 more downloads to unlock the "Community Hero" legendary badge.</p>
                 <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden mb-2 relative z-10">
                    <motion.div initial={{ width: 0 }} animate={{ width: '65%' }} className="h-full bg-accent-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]"></motion.div>
                 </div>
                 <div className="text-[10px] font-black uppercase tracking-widest text-accent-400 text-right">65% Progress</div>
              </div>
           </div>

        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
