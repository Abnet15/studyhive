import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, BookOpen, BrainCircuit, UploadCloud, Hexagon, 
  Settings, LogOut, Sun, Moon, Menu, X, ShieldAlert, User, Search, Sparkles, ChevronDown, Mic, GraduationCap 
} from 'lucide-react';
import GlobalSearch from './GlobalSearch';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [aiMenuOpen, setAiMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    const handleKeyDown = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const mainLinks = [
    { name: 'Home', path: user ? '/dashboard' : '/', icon: <Home className="w-4 h-4"/> },
    { name: 'Courses', path: '/courses', icon: <BookOpen className="w-4 h-4"/> },
    { name: 'Upload', path: '/upload', icon: <UploadCloud className="w-4 h-4"/> },
  ];

  const aiLinks = [
    { name: 'Honey Hub', path: '/ai-assistant', desc: 'Tools & Quizzes', icon: <BrainCircuit className="w-5 h-5 text-primary-500"/> },
    { name: 'Honey Interviewer', path: '/honey-interviewer', desc: 'Mock Interviews', icon: <Mic className="w-5 h-5 text-emerald-500"/> },
    { name: 'Honey Teacher', path: '/honey-teacher', desc: 'Virtual Tutor', icon: <Sparkles className="w-5 h-5 text-amber-500"/>, highlight: true },
    { name: 'Honey Exit Indicator', path: '/exit-exam', desc: 'Diagnostic Tests', icon: <GraduationCap className="w-5 h-5 text-rose-500"/> },
  ];

  const isAdmin = user?.role === 'admin';

  return (
    <>
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 px-4 md:px-8 py-4 ${scrolled ? 'pt-2' : 'pt-6'}`}>
      <div className={`max-w-7xl mx-auto rounded-[2.5rem] transition-all duration-700 border ${scrolled 
        ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-white/50 dark:border-white/5' 
        : 'bg-white/10 dark:bg-slate-900/10 backdrop-blur-md border-white/20 dark:border-white/10'}`}>
        
        <div className="flex justify-between items-center h-16 px-6 md:px-10">
          
          {/* ────── Logo ────── */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-600 flex items-center justify-center text-white shadow-lg group-hover:rotate-12 transition-all duration-500">
               <Hexagon className="w-6 h-6 fill-white/20" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white hidden sm:block">
               Study<span className="gradient-text italic pr-1">Hive</span>
            </span>
          </Link>

          {/* ────── Desktop Navigation (Simplified) ────── */}
          <div className="hidden md:flex items-center bg-slate-100/50 dark:bg-white/5 rounded-2xl px-1.5 py-1.5 border border-white/10">
            {mainLinks.map((link) => {
              const isActive = location.pathname === link.path || (link.path === '/' && location.pathname === '/dashboard');
              return (
                <Link 
                  key={link.path} 
                  to={link.path} 
                  className={`px-5 py-2 rounded-xl flex items-center gap-2.5 font-bold text-[13px] transition-all duration-300 ${
                    isActive 
                      ? 'text-primary-600 dark:text-primary-400 bg-white dark:bg-slate-800 shadow-sm' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {link.icon}
                  {link.name}
                </Link>
              );
            })}

            {/* Honey AI Dropdown */}
            <div className="relative" onMouseEnter={() => setAiMenuOpen(true)} onMouseLeave={() => setAiMenuOpen(false)}>
               <button 
                 className={`px-5 py-2 rounded-xl flex items-center gap-2.5 font-bold text-[13px] transition-all duration-300 ${
                    location.pathname.includes('ai') || location.pathname.includes('teacher') 
                      ? 'text-amber-600 dark:text-amber-400' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                 }`}
               >
                  <BrainCircuit className="w-4 h-4" />
                  Honey Studio
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${aiMenuOpen ? 'rotate-180' : ''}`} />
               </button>

               <AnimatePresence>
                 {aiMenuOpen && (
                   <motion.div 
                     initial={{ opacity: 0, y: 10, scale: 0.95 }}
                     animate={{ opacity: 1, y: 0, scale: 1 }}
                     exit={{ opacity: 0, y: 10, scale: 0.95 }}
                     className="absolute top-full right-0 mt-3 w-64 glass-card p-3 shadow-2xl border-white/40 dark:border-white/5"
                   >
                     {aiLinks.map((link) => (
                       <Link 
                         key={link.path} 
                         to={link.path}
                         onClick={() => setAiMenuOpen(false)}
                         className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all group"
                       >
                         <div className="shrink-0 p-2 rounded-lg bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-white/5 group-hover:scale-110 transition-transform">
                            {link.icon}
                         </div>
                         <div>
                            <div className="text-xs font-black text-slate-900 dark:text-white">{link.name}</div>
                            <div className="text-[10px] text-slate-500 font-medium">{link.desc}</div>
                         </div>
                       </Link>
                     ))}
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>

            {isAdmin && (
               <Link to="/admin" className="px-5 py-2 rounded-xl flex items-center gap-2.5 font-bold text-[13px] text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                  <ShieldAlert className="w-4 h-4" />
                  Hub
               </Link>
            )}
          </div>

          {/* ────── Right Tools ────── */}
          <div className="flex items-center gap-3">
             <button 
               onClick={() => setSearchOpen(true)}
               className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 hover:bg-primary-500 hover:text-white transition-all shadow-sm border border-white/10"
             >
                <Search className="w-5 h-5"/>
             </button>

             <button 
               onClick={toggleTheme}
               className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 hover:bg-indigo-500 hover:text-white transition-all shadow-sm border border-white/10"
             >
                {isDark ? <Sun className="w-5 h-5"/> : <Moon className="w-5 h-5"/>}
             </button>

             {user ? (
               <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-white/10 ml-1">
                  <Link to="/profile" className="flex items-center gap-3 group px-2 py-2 rounded-full hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                     <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary-500 to-indigo-500 flex items-center justify-center text-white text-xs font-black shadow-md border-2 border-white dark:border-slate-800">
                        {user.name?.charAt(0)}
                     </div>
                  </Link>
                  <button onClick={handleLogout} className="p-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white transition-all shadow-sm">
                     <LogOut className="w-5 h-5"/>
                  </button>
               </div>
             ) : (
               <Link to="/login" className="btn-primary py-2.5 px-6 text-sm font-black hidden sm:flex">
                  Join Now
               </Link>
             )}

             <button 
               onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
               className="md:hidden p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300"
             >
               {mobileMenuOpen ? <X className="w-6 h-6"/> : <Menu className="w-6 h-6"/>}
             </button>
          </div>
        </div>
      </div>

      {/* ────── Mobile Menu ────── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="md:hidden absolute top-full left-4 right-4 mt-3 glass-card p-6 shadow-2xl border-white/30 dark:border-white/5 space-y-4"
          >
             {user && (
                <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl mb-4">
                   <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary-500 to-indigo-500 flex items-center justify-center text-white text-lg font-black">{user.name?.charAt(0)}</div>
                   <div>
                      <div className="font-black text-slate-900 dark:text-white">{user.name}</div>
                      <div className="text-[10px] text-primary-500 font-black uppercase tracking-widest leading-tight">{user.role}</div>
                   </div>
                </div>
             )}
             
             <div className="grid grid-cols-2 gap-3">
                {mainLinks.map((link) => (
                  <Link key={link.path} to={link.path} onClick={() => setMobileMenuOpen(false)} className="flex flex-col items-center gap-2 p-5 rounded-2xl bg-slate-50 dark:bg-white/5 font-black text-[11px] uppercase tracking-widest text-slate-600 dark:text-slate-400">
                    {link.icon} {link.name}
                  </Link>
                ))}
                <Link to="/ai-assistant" onClick={() => setMobileMenuOpen(false)} className="flex flex-col items-center gap-2 p-5 rounded-2xl bg-primary-500/10 border border-primary-500/20 font-black text-[11px] uppercase tracking-widest text-primary-600">
                   <BrainCircuit className="w-4 h-4" /> Honey AI
                </Link>
                <Link to="/honey-teacher" onClick={() => setMobileMenuOpen(false)} className="flex flex-col items-center gap-2 p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 font-black text-[11px] uppercase tracking-widest text-amber-600">
                   <Sparkles className="w-4 h-4" /> Teacher
                </Link>
             </div>

             {!user ? (
               <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center gap-3 p-5 rounded-2xl bg-primary-600 text-white font-black w-full shadow-lg">Sign In</Link>
             ) : (
               <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 p-5 rounded-2xl text-red-600 bg-red-50 dark:bg-red-900/10 font-bold border border-red-500/20">Sign Out</button>
             )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
    <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

export default Navbar;
