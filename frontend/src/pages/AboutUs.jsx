import React from 'react';
import { Link } from 'react-router-dom';

const teamMembers = [
  {
    id: 1,
    name: 'Bekalu Temesgen',
    role: 'Lead Developer',
    bio: 'Full-stack developer crafting scalable platforms that empower students and educators alike.',
    avatar: '/images/bekalu.jpg',
    linkedin: 'https://www.linkedin.com/in/bekalu-temesgen2306',
  },
];

const LinkedInIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M20.447 20.452H17.21v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.446-2.136 2.939v5.667H9.014V9h3.104v1.561h.044c.433-.82 1.494-1.686 3.075-1.686 3.289 0 3.895 2.165 3.895 4.978v6.599zM5.337 7.433a1.805 1.805 0 110-3.61 1.805 1.805 0 010 3.61zM6.9 20.452H3.771V9H6.9v11.452zM22.225 0H1.771C.792 0 0 .773 0 1.728v20.543C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.728C24 .773 23.2 0 22.225 0z" />
  </svg>
);

const AboutUs = () => {
  return (
    <div className="min-h-screen">
      {/* ───── Hero ───── */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-16 sm:py-24 px-4">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -right-24 w-64 sm:w-80 h-64 sm:h-80 rounded-full bg-primary-300/20 dark:bg-primary-600/10 blur-3xl" />
          <div className="absolute -bottom-32 -left-24 w-64 sm:w-80 h-64 sm:h-80 rounded-full bg-accent-300/20 dark:bg-accent-600/10 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 text-xs sm:text-sm font-semibold mb-5 sm:mb-6">
            Meet the Hive 🐝
          </span>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-gray-100 mb-4 sm:mb-5 leading-tight">
            Building the future of
            <br className="hidden sm:block" />
            <span className="gradient-text"> academic collaboration</span>
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            StudyHive is a platform where university students discover curated materials, share past exams, and celebrate learning milestones together.
          </p>
        </div>
      </section>

      {/* ───── Mission ───── */}
      <section className="py-12 sm:py-16 md:py-20 px-4 bg-white dark:bg-gray-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
            <div className="lg:col-span-3 card bg-gradient-to-br from-white via-primary-50/40 to-white dark:from-gray-800 dark:via-primary-900/10 dark:to-gray-800">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 sm:mb-6">Our Mission</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <div className="text-2xl sm:text-3xl mb-2">🎯</div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Educational Excellence</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    We champion equitable access to quality study materials, empowering students to learn smarter and thrive.
                  </p>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl mb-2">🤝</div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Collaborative Learning</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    StudyHive connects peers, alumni, and mentors to crowd-source insights and supportive feedback.
                  </p>
                </div>
              </div>
            </div>
            <div className="lg:col-span-2 card bg-gray-900 dark:bg-gray-950 text-white">
              <h3 className="text-base sm:text-lg font-semibold mb-4">Core Numbers</h3>
              <ul className="space-y-3 text-white/80 text-sm sm:text-base">
                <li className="flex items-center gap-2">✅ 50+ partnered departments</li>
                <li className="flex items-center gap-2">📚 1,200+ curated resources</li>
                <li className="flex items-center gap-2">🌍 Students across 4 universities</li>
                <li className="flex items-center gap-2">⚡ 99.5% uptime infrastructure</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ───── What We Offer ───── */}
      <section className="py-12 sm:py-16 md:py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3">What We Offer</h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
              Whether you're cramming for finals or polishing lab submissions, every resource is one click away.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {[
              { icon: '📝', title: 'Past Exams & Worksheets', desc: 'Download officially graded midterms, finals, and solution banks tailored to your department.' },
              { icon: '📚', title: 'Shared Study Materials', desc: 'Crowd-sourced notes, lab manuals, and cheat sheets backed by real student experience.' },
              { icon: '🏆', title: 'Recognition & Badges', desc: 'Contribute often, earn badges, and showcase your academic impact across the community.' },
            ].map((f) => (
              <div key={f.title} className="card text-center group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                <div className="text-3xl sm:text-4xl mb-3 group-hover:scale-110 transition-transform">{f.icon}</div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Team ───── */}
      <section className="py-12 sm:py-16 md:py-20 px-4 bg-white dark:bg-gray-800/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3">The Builders</h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-xl mx-auto mb-8 sm:mb-10">
            Strategy, design, and engineering — working together to deliver lovable academic software.
          </p>
          <div className="flex justify-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-3xl">
              {teamMembers.map((member) => (
                <div key={member.id} className="card group hover:shadow-2xl transition-all duration-300 text-center">
                  <div className="flex justify-center mb-4">
                    {member.avatar ? (
                      <img src={member.avatar} alt={member.name} className="h-20 w-20 sm:h-24 sm:w-24 rounded-full object-cover shadow-md" style={{ aspectRatio: '1 / 1' }} />
                    ) : (
                      <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-2xl sm:text-3xl text-white shadow-md">
                        {member.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 mb-0.5">{member.name}</h3>
                  <p className="text-primary-600 dark:text-primary-400 font-semibold text-sm mb-2">{member.role}</p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">{member.bio}</p>
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 hover:bg-primary-200 dark:hover:bg-primary-800/40 transition-colors text-xs font-semibold"
                  >
                    <LinkedInIcon /> LinkedIn
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───── Values ───── */}
      <section className="py-12 sm:py-16 md:py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-8 sm:mb-10">Our Values</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[
              { icon: '🔒', title: 'Security', desc: 'Rigorous reviews and access controls keep every resource protected.' },
              { icon: '⚡', title: 'Performance', desc: 'Optimised builds ensure downloads are quick, even during finals week.' },
              { icon: '💡', title: 'Innovation', desc: 'We pilot features with real students before scaling to new campuses.' },
              { icon: '❤️', title: 'Community', desc: 'Recognition systems celebrate contributors who elevate the hive.' },
            ].map((v) => (
              <div key={v.title} className="text-center p-3 sm:p-4">
                <div className="text-2xl sm:text-3xl mb-2">{v.icon}</div>
                <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-gray-100 mb-1">{v.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Contact CTA ───── */}
      <section className="py-12 sm:py-16 md:py-20 px-4 bg-gradient-to-r from-primary-600 via-primary-700 to-accent-600">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3 sm:mb-4">Let's build together</h2>
          <p className="text-sm sm:text-base text-white/80 mb-6 sm:mb-8">
            Got a feature idea, want to integrate StudyHive on campus, or just say hello?
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center px-4">
            <a href="mailto:contact@studyhive.com" className="bg-white text-primary-700 font-bold px-6 py-3 rounded-xl shadow-2xl hover:scale-105 transition-all text-sm sm:text-base">
              📧 contact@studyhive.com
            </a>
            <Link to="/register" className="border-2 border-white/40 text-white font-bold px-6 py-3 rounded-xl hover:bg-white/10 transition-all text-sm sm:text-base">
              Join StudyHive
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
