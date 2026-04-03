import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMaterials } from '../context/MaterialContext';

const Landing = () => {
  const { user } = useAuth();
  const { materials } = useMaterials();

  const totalMaterials = materials.length;
  const totalExams = materials.filter((m) => m.material_type === 'exam').length;
  const uniqueCourses = new Set(materials.map((m) => m.course_id || m.courseId)).size;
  const totalDownloads = materials.reduce((sum, m) => sum + (m.downloads || 0), 0);
  const fmt = (v) => (typeof v === 'number' ? v.toLocaleString() : v);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* ───── Background Elements ───── */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-500/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* ───── Hero Section ───── */}
      <section className="relative pt-20 pb-20 md:pt-32 md:pb-40 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="text-center lg:text-left space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-xl animate-float">
               <span className="flex h-2 w-2 rounded-full bg-primary-500 animate-ping"></span>
               <span className="text-sm font-bold text-slate-600 dark:text-slate-300">BiT AI Hackathon 2026 Special Edition</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.1]">
              <span className="text-slate-900 dark:text-white">Elevate Your</span><br />
              <span className="gradient-text uppercase tracking-tighter">Studying</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
              The ultimate collaborative hub for university students. Now powered by <span className="text-primary-600 font-bold">AI Assistant</span> to help you learn faster and ace every exam.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              {!user ? (
                <>
                  <Link to="/register" className="btn-primary group">
                    Start Learning Free
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                  <Link to="/login" className="btn-secondary">
                    Sign In
                  </Link>
                </>
              ) : (
                <Link to="/dashboard" className="btn-primary">
                  Go to Dashboard
                </Link>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12">
               {[
                 { label: 'Resources', value: fmt(totalMaterials || 1500), sign: '+' },
                 { label: 'Exams', value: fmt(totalExams || 450), sign: '' },
                 { label: 'Courses', value: fmt(uniqueCourses || 80), sign: '' },
                 { label: 'Success', value: '98', sign: '%' },
               ].map((s, idx) => (
                 <div key={idx} className="text-center lg:text-left">
                    <div className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">{s.value}{s.sign}</div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">{s.label}</div>
                 </div>
               ))}
            </div>
          </div>

          {/* AI Visual Mockup */}
          <div className="relative hidden lg:block">
             <div className="absolute -inset-4 bg-gradient-to-tr from-primary-500/20 to-accent-500/20 rounded-[3rem] blur-2xl animate-pulse"></div>
             <div className="glass-card p-8 space-y-6 relative border-white/50 animate-float" style={{ animationDuration: '6s' }}>
                <div className="flex items-center gap-4 border-b border-primary-500/10 pb-6">
                   <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-500 to-indigo-500 flex items-center justify-center text-white text-2xl shadow-lg">🤖</div>
                   <div>
                      <div className="font-bold text-slate-900 dark:text-white">StudyHive AI Assistant</div>
                      <div className="text-xs text-primary-500 font-bold uppercase tracking-widest">Active Now</div>
                   </div>
                </div>
                <div className="space-y-4">
                   <div className="p-4 rounded-2xl bg-slate-100/50 dark:bg-slate-800/50 text-sm text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                      "I've analyzed your Computer Science materials. Ready to generate a Quiz for 'Data Structures'?"
                   </div>
                   <div className="flex justify-end">
                      <div className="p-4 rounded-2xl bg-primary-600 text-white text-sm font-bold shadow-xl">
                         Yes, please! ✨
                      </div>
                   </div>
                </div>
                <div className="pt-4 grid grid-cols-2 gap-4">
                   <div className="h-24 rounded-2xl bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 animate-pulse"></div>
                   <div className="h-24 rounded-2xl bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* ───── AI Features Highlight ───── */}
      <section className="py-24 relative">
         <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16 space-y-4">
               <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white">New AI-Powered Experience</h2>
               <p className="text-slate-500 max-w-2xl mx-auto font-medium font-heading">
                  We've upgraded StudyHive with cutting-edge AI to make your learning process more interactive and efficient.
               </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {[
                 { 
                   title: 'Smart Recommendations', 
                   desc: 'Personalized study paths tailored to your specific academic profile and goals.',
                   icon: '🚀',
                   color: 'from-blue-500 to-cyan-500' 
                 },
                 { 
                   title: 'Instant Explanations', 
                   desc: 'Stuck on a concept? Our AI breaks down complex materials into simple summaries.',
                   icon: '💡',
                   color: 'from-purple-500 to-pink-500' 
                 },
                 { 
                   title: 'Quest Generator', 
                   desc: 'Generate unlimited practice quizzes for any course topic in seconds.',
                   icon: '🎯',
                   color: 'from-orange-500 to-red-500' 
                 }
               ].map((item, idx) => (
                 <div key={idx} className="glass-card p-8 group hover:-translate-y-2 transition-all duration-500">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-tr ${item.color} flex items-center justify-center text-3xl mb-6 shadow-xl`}>
                       {item.icon}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* ───── Stats / Impact ───── */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
         <div className="absolute top-0 right-0 w-[50%] h-full bg-primary-600/10 skew-x-12 -z-10"></div>
         <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 items-center gap-16">
            <div>
               <h2 className="text-4xl md:text-5xl font-bold mb-8">Join thousands of successful students</h2>
               <p className="text-slate-400 text-lg mb-10 leading-relaxed">
                  StudyHive is more than just a resource hub. It's a growing ecosystem of knowledge built for the next generation of engineers and scholars.
               </p>
               <div className="flex gap-8">
                  <div className="space-y-2">
                     <div className="text-4xl font-bold">10k+</div>
                     <div className="text-xs font-bold uppercase tracking-widest text-primary-500">Downloads</div>
                  </div>
                  <div className="space-y-2">
                     <div className="text-4xl font-bold">5k+</div>
                     <div className="text-xs font-bold uppercase tracking-widest text-primary-500">Shared Files</div>
                  </div>
               </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="aspect-square bg-slate-800 rounded-[2.5rem] p-8 flex flex-col justify-end">
                  <div className="text-3xl mb-4">🏠</div>
                  <div className="font-bold">Resource Center</div>
               </div>
               <div className="aspect-square bg-primary-600 rounded-[2.5rem] p-8 flex flex-col justify-end translate-y-8 shadow-2xl">
                  <div className="text-3xl mb-4 text-white">🤝</div>
                  <div className="font-bold text-white">Collaboration</div>
               </div>
            </div>
         </div>
      </section>
      
      {/* ───── Footer CTA ───── */}
      <section className="py-32 px-4 text-center relative">
         <div className="max-w-4xl mx-auto space-y-12">
            <h2 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight">
               Built for the future of <span className="gradient-text italic">Informatics.</span>
            </h2>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
               <Link to="/register" className="btn-primary py-5 px-12 text-lg">
                  Join the Hive Now
               </Link>
               <Link to="/about" className="btn-secondary py-5 px-12 text-lg">
                  Learn About Us
               </Link>
            </div>
         </div>
      </section>
    </div>
  );
};

export default Landing;
