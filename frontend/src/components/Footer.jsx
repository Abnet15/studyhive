import React from 'react';
import { Link } from 'react-router-dom';
import { Hexagon, Heart } from 'lucide-react';

const GithubIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
);

const TwitterIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
);

const LinkedinIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
);

const Footer = () => {
  return (
    <footer className="relative bg-white dark:bg-[#030712] border-t border-slate-200 dark:border-slate-800 pt-20 pb-10 overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[100px] bg-primary-500/20 blur-[100px] rounded-[100%] pointer-events-none -z-10"></div>
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          
          {/* Brand Col */}
          <div className="space-y-6 lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 group w-fit">
              <div className="w-10 h-10 rounded-[1.1rem] bg-gradient-to-tr from-primary-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/30 group-hover:rotate-12 transition-transform duration-300">
                 <Hexagon className="w-6 h-6 fill-white/20" />
              </div>
              <span className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">
                 Study<span className="gradient-text italic pr-1">Hive</span>
              </span>
            </Link>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm font-medium">
              The ultimate collaborative hub for university students, powered by advanced Generative AI to accelerate your learning and guarantee academic success.
            </p>
            <div className="flex gap-4">
               <a href="#" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-500 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-all"><GithubIcon className="w-5 h-5"/></a>
               <a href="#" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-500 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-all"><TwitterIcon className="w-5 h-5"/></a>
               <a href="#" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-500 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-all"><LinkedinIcon className="w-5 h-5"/></a>
            </div>
          </div>

          {/* Links Col 1 */}
          <div className="space-y-6">
            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Platform</h4>
            <ul className="space-y-4">
              <li><Link to="/courses" className="text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors">Course Catalog</Link></li>
              <li><Link to="/upload" className="text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors">Upload Material</Link></li>
              <li><Link to="/ai-assistant" className="text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors flex items-center gap-2">Askuala AI <span className="px-2 py-0.5 rounded-full bg-accent-100 text-accent-700 text-[10px] font-bold">NEW</span></Link></li>
            </ul>
          </div>

          {/* Links Col 2 */}
          <div className="space-y-6">
            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Company</h4>
            <ul className="space-y-4">
              <li><Link to="/about" className="text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors">About Us</Link></li>
              <li><Link to="/privacy" className="text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 pt-8 mt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm font-medium">
            &copy; {new Date().getFullYear()} StudyHive Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
            Built with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> by 
            <span className="font-bold text-slate-900 dark:text-white">Bekalu Temesgen</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
