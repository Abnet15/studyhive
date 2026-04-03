import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MaterialCard from '../components/MaterialCard';
import Badge from '../components/Badge';
import { useBadges, isBadgeEarned } from '../hooks/useBadges';
import { useMaterials } from '../context/MaterialContext';
import { useCourses } from '../context/CourseContext';

const Dashboard = () => {
  const { user } = useAuth();
  const { materials, materialsLoading } = useMaterials();
  const { courses } = useCourses();
  const { badges, badgesLoading } = useBadges();

  const sortedMaterials = [...materials].sort(
    (a, b) => new Date(b.upload_date).getTime() - new Date(a.upload_date).getTime()
  );
  const recentMaterials = sortedMaterials.slice(0, 4);
  const recommendedCourses = courses.slice(0, 3);
  const userMaterials = user ? materials.filter((m) => m.uploader_id === user.id) : [];
  const totalDownloads = userMaterials.reduce((sum, m) => sum + (m.downloads || 0), 0);
  const avgRating = userMaterials.length > 0
    ? (userMaterials.reduce((sum, m) => sum + (m.rating || 0), 0) / userMaterials.length).toFixed(1)
    : '0.0';
  const totalUploads = userMaterials.length;

  return (
    <div className="min-h-screen pb-20 pt-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* ───── Header & Greeting ───── */}
        <header className="flex flex-col md:flex-row justify-between items-end gap-6">
           <div className="space-y-2">
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
                 Welcome, <span className="gradient-text">{user?.name?.split(' ')[0]}!</span>
              </h1>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-sm flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                 {user?.dept || 'Computing Faculty'} • Year {user?.year || '3'}
              </p>
           </div>
           <Link to="/ai-assistant" className="btn-primary py-4 px-10 shadow-2xl animate-float">
              Try AI Assistant ✨
           </Link>
        </header>

        {/* ───── Stat Grid ───── */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {[
             { label: 'Total Uploads', value: totalUploads, icon: '📚', color: 'from-blue-500 to-indigo-600' },
             { label: 'Avg Rating', value: avgRating, icon: '⭐', color: 'from-fuchsia-500 to-purple-600' },
             { label: 'Downloads', value: totalDownloads.toLocaleString(), icon: '📥', color: 'from-emerald-500 to-teal-600' },
           ].map((stat, idx) => (
             <div key={idx} className={`glass-card p-8 bg-gradient-to-br transition-all duration-300 group`}>
                <div className="flex justify-between items-start">
                   <div className="space-y-1">
                      <div className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs">{stat.label}</div>
                      <div className="text-4xl font-black text-slate-900 dark:text-white">{stat.value}</div>
                   </div>
                   <div className="text-4xl group-hover:scale-125 transition-transform duration-500">{stat.icon}</div>
                </div>
                <div className="mt-6 h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                   <div className={`h-full bg-gradient-to-r ${stat.color} w-3/4 opacity-60`}></div>
                </div>
             </div>
           ))}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* ───── Left Column: Content ───── */}
          <div className="lg:col-span-2 space-y-8">
             <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                   🏢 Recent Resources
                </h2>
                <Link to="/courses" className="nav-link">See Everything</Link>
             </div>

             {materialsLoading ? (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map(i => <div key={i} className="h-40 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse"></div>)}
               </div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {recentMaterials.map(material => (
                    <MaterialCard key={material.id} material={material} />
                  ))}
               </div>
             )}
          </div>

          {/* ───── Right Column: Side Widgets ───── */}
          <div className="space-y-10">
             
             {/* AI Quick Suggestion */}
             <div className="glass-card p-8 bg-gradient-to-br from-primary-600 to-indigo-700 text-white border-none shadow-[0_20px_50px_-10px_rgba(14,165,233,0.3)]">
                <div className="text-3xl mb-4">🤖</div>
                <h3 className="text-xl font-bold mb-2">AI Insights</h3>
                <p className="text-primary-100 text-sm leading-relaxed mb-6">
                   Based on your recently shared materials, you should check out the new <b>Advanced Data Structures</b> notes!
                </p>
                <Link to="/ai-assistant" className="block text-center py-3 bg-white text-primary-700 font-bold rounded-2xl shadow-xl hover:scale-105 transition-all">
                   Open AI Hub
                </Link>
             </div>

             {/* Badges Hub */}
             <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Your Achievements</h2>
                {badgesLoading ? (
                  <div className="h-32 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse"></div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {badges.slice(0, 4).map(badge => (
                      <Badge
                        key={badge.id}
                        name={badge.name}
                        icon={badge.icon}
                        description={badge.description}
                        earned={isBadgeEarned(badge, totalUploads, Number(avgRating), totalDownloads)}
                      />
                    ))}
                  </div>
                )}
             </div>

             {/* Recommended Courses List */}
             <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Quick Access</h2>
                <div className="space-y-3">
                   {recommendedCourses.map(course => (
                     <Link key={course.id} to={`/courses?course=${course.id}`} className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary-500 transition-all group">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-primary-600">
                           {course.course_code.substring(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                           <div className="text-sm font-bold truncate text-slate-900 dark:text-white">{course.course_name}</div>
                           <div className="text-xs text-slate-500">{course.course_code}</div>
                        </div>
                        <span className="text-slate-300 group-hover:text-primary-500 transition-colors">→</span>
                     </Link>
                   ))}
                </div>
             </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default Dashboard;
