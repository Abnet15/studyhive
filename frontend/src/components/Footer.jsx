import React from 'react';
import { Link } from 'react-router-dom';
import { Hexagon, Heart, Github, Twitter, Linkedin } from 'lucide-react';

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
               <a href="#" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-500 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-all"><Github className="w-5 h-5"/></a>
               <a href="#" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-500 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-all"><Twitter className="w-5 h-5"/></a>
               <a href="#" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-500 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-all"><Linkedin className="w-5 h-5"/></a>
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
