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
    <div className="min-h-screen">
      {/* ───── Hero ───── */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-16 sm:py-24 md:py-32 px-4">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -right-32 w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-primary-300/20 dark:bg-primary-600/10 blur-3xl animate-pulse" />
          <div className="absolute -bottom-32 -left-32 w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-accent-300/20 dark:bg-accent-600/10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 text-xs sm:text-sm font-semibold mb-6 sm:mb-8">
            🐝 Collaborative Study Platform
          </span>

          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-4 sm:mb-6r">
            <span className="gradient-text">Study Smarter,</span>
            <br className="hidden sm:block" />
            <span className="text-gray-900 dark:text-white"> Together</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed px-2">
            Access past exams, lecture notes, and study guides shared by your peers. Upload your own and help the hive thrive.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-12 sm:mb-16 px-4">
            {!user ? (
              <>
                <Link to="/register" className="btn-primary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 shadow-2xl hover:scale-105 transition-all">
                  Get Started — it's free
                </Link>
                <Link to="/login" className="btn-secondary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 hover:scale-105 transition-all">
                  Sign In
                </Link>
              </>
            ) : (
              <Link to="/dashboard" className="btn-primary text-base sm:text-lg px-8 py-4 shadow-2xl hover:scale-105 transition-all">
                Go to Dashboard →
              </Link>
            )}
          </div>

          {/* Live Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-3xl mx-auto">
            {[
              { label: 'Resources', value: fmt(totalMaterials), color: 'text-primary-600 dark:text-primary-400' },
              { label: 'Exams', value: fmt(totalExams), color: 'text-accent-600 dark:text-accent-400' },
              { label: 'Courses', value: fmt(uniqueCourses), color: 'text-green-600 dark:text-green-400' },
              { label: 'Downloads', value: fmt(totalDownloads), color: 'text-orange-600 dark:text-orange-400' },
            ].map((s) => (
              <div key={s.label} className="bg-white/60 dark:bg-gray-800/60 backdrop-blur rounded-xl p-3 sm:p-4 border border-gray-200/60 dark:border-gray-700/60">
                <div className={`text-xl sm:text-2xl md:text-3xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Features ───── */}
      <section className="py-16 sm:py-20 md:py-24 px-4 bg-white dark:bg-gray-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">
              Everything you need to excel
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
              Built by students, for students — one platform for all your academic resources.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {[
              {
                icon: '📝', title: 'Past Exams',
                desc: 'Midterms, finals, and solution banks — organised by course and department.',
                gradient: 'from-red-50 to-orange-50 dark:from-red-900/10 dark:to-orange-900/10',
              },
              {
                icon: '📚', title: 'Study Materials',
                desc: 'Crowd-sourced notes, lab manuals, and cheat-sheets backed by fellow students.',
                gradient: 'from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10',
              },
              {
                icon: '🤝', title: 'Share & Collaborate',
                desc: 'Upload your notes, earn badges, and showcase your impact across the hive.',
                gradient: 'from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10',
              },
            ].map((f) => (
              <div key={f.title} className={`card bg-gradient-to-br ${f.gradient} text-center group hover:scale-[1.03] hover:shadow-2xl transition-all duration-300`}>
                <div className="text-4xl sm:text-5xl mb-4 sm:mb-5 group-hover:scale-110 transition-transform">{f.icon}</div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3">{f.title}</h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── How It Works ───── */}
      <section className="py-16 sm:py-20 md:py-24 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-gray-100 mb-10 sm:mb-14">
            Three steps to smarter studying
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              { step: '01', title: 'Create an account', desc: 'Sign up free with your university email.', icon: '🎓' },
              { step: '02', title: 'Browse or upload', desc: 'Find resources by course, or share your own.', icon: '🔍' },
              { step: '03', title: 'Excel in your studies', desc: 'Download materials and ace your exams.', icon: '🚀' },
            ].map((s) => (
              <div key={s.step} className="relative text-center sm:text-left group">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">
                    {s.icon}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider">Step {s.step}</span>
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 mt-1 mb-1">{s.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{s.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── CTA ───── */}
      {!user && (
        <section className="py-16 sm:py-20 md:py-24 px-4 bg-gradient-to-r from-primary-600 via-primary-700 to-accent-600">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">Ready to join the hive?</h2>
            <p className="text-sm sm:text-base md:text-lg text-white/80 mb-6 sm:mb-8 leading-relaxed max-w-xl mx-auto">
              Thousands of students are already sharing resources and acing their courses. Start your journey today.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <Link to="/register" className="bg-white text-primary-700 font-bold px-6 sm:px-8 py-3 sm:py-4 rounded-xl shadow-2xl hover:scale-105 transition-all text-base sm:text-lg">
                Create Free Account
              </Link>
              <Link to="/about" className="border-2 border-white/40 text-white font-bold px-6 sm:px-8 py-3 sm:py-4 rounded-xl hover:bg-white/10 transition-all text-base sm:text-lg">
                Learn More
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Landing;
