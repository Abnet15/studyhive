import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, BookOpen, BrainCircuit, UploadCloud, Hexagon, 
  Settings, LogOut, Sun, Moon, Menu, X, ShieldAlert, User, Search
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

  const navLinks = user?.role === 'admin' 
    ? [
        { name: 'Admin Hub', path: '/admin', icon: <ShieldAlert className="w-5 h-5"/> },
        { name: 'Settings', path: '/settings', icon: <Settings className="w-5 h-5"/> },
      ]
    : [
        { name: 'Home', path: user ? '/dashboard' : '/', icon: <Home className="w-5 h-5"/> },
        { name: 'Courses', path: '/courses', icon: <BookOpen className="w-5 h-5"/> },
        { name: 'Honey AI', path: '/ai-assistant', icon: <BrainCircuit className="w-5 h-5"/>, highlight: true },
        { name: 'Upload', path: '/upload', icon: <UploadCloud className="w-5 h-5"/> },
      ];

  return (
    <>
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 px-4 md:px-8 py-4 ${scrolled ? 'pt-4' : 'pt-6'}`}>
      <div className={`max-w-7xl mx-auto rounded-[2rem] transition-all duration-500 border ${scrolled 
        ? 'bg-white/70 dark:bg-slate-900/70 backdrop-blur-3xl shadow-2xl shadow-primary-500/10 border-white/50 dark:border-white/10' 
        : 'bg-transparent border-transparent'}`}>
        
        <div className="flex justify-between items-center h-16 px-6 md:px-10">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-[1.1rem] bg-gradient-to-tr from-primary-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/30 group-hover:rotate-12 transition-transform duration-300">
               <Hexagon className="w-6 h-6 fill-white/20" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">
               Study<span className="gradient-text italic pr-1">Hive</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path || (link.path === '/' && location.pathname === '/dashboard');
              return (
                <Link 
                  key={link.path} 
                  to={link.path} 
                  className={`relative px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-sm transition-all duration-300 ${
                    isActive 
                      ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-primary-600 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  } ${link.highlight ? 'text-accent-600 dark:text-accent-400' : ''}`}
                >
                  {link.highlight && <span className="absolute top-1 right-1 w-2 h-2 bg-accent-500 rounded-full animate-ping"></span>}
                  {link.icon}
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
             {/* Search Button (Hidden on tiny mobile) */}
             <button 
               onClick={() => setSearchOpen(true)}
               className="hidden sm:flex items-center gap-3 px-4 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-transparent hover:border-primary-500/30"
             >
                <Search className="w-5 h-5"/>
                <span className="text-xs font-black uppercase tracking-widest hidden lg:block opacity-60">Find...</span>
                <span className="px-1.5 py-0.5 rounded-md bg-white dark:bg-slate-900 text-[10px] font-black border border-slate-200 dark:border-slate-800 hidden xl:block opacity-60 self-center">⌘K</span>
             </button>

             <button 
               onClick={toggleTheme}
               className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-sm"
             >
                {isDark ? <Sun className="w-5 h-5"/> : <Moon className="w-5 h-5"/>}
             </button>

             {user ? (
               <div className="hidden sm:flex items-center gap-4 pl-4 border-l border-slate-200 dark:border-slate-700 h-10">
                  <Link to="/profile" className="flex items-center gap-3 group px-2 py-1 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                     <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary-500 to-indigo-500 flex items-center justify-center text-white text-sm font-bold shadow-md group-hover:scale-105 transition-transform">
                        {user.name?.charAt(0)}
                     </div>
                     <div className="text-left hidden xl:block">
                        <div className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{user.name?.split(' ')[0]}</div>
                        <div className="text-[10px] text-primary-500 font-extrabold uppercase tracking-widest leading-tight">{user.role}</div>
                     </div>
                  </Link>
                  <button onClick={handleLogout} className="p-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors shadow-sm">
                     <LogOut className="w-5 h-5"/>
                  </button>
               </div>
             ) : (
               <Link to="/login" className="btn-primary py-2.5 px-6 text-sm hidden sm:flex">
                  Sign In
               </Link>
             )}

             {/* Mobile Menu Toggle */}
             <button 
               onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
               className="md:hidden p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
             >
               {mobileMenuOpen ? <X className="w-6 h-6"/> : <Menu className="w-6 h-6"/>}
             </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-full left-4 right-4 mt-2 glass-card p-6 space-y-4 shadow-2xl border-white/50 dark:border-slate-700/50"
          >
             {user && (
                <div className="flex items-center gap-4 p-4 border-b border-slate-200 dark:border-slate-800 mb-4">
                   <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary-500 to-indigo-500 flex items-center justify-center text-white text-lg font-bold shadow-md">
                      {user.name?.charAt(0)}
                   </div>
                   <div>
                      <div className="font-bold text-slate-900 dark:text-white">{user.name}</div>
                      <div className="text-xs text-primary-500 font-bold uppercase">{user.role}</div>
                   </div>
                </div>
             )}
             
             {navLinks.map((link) => (
               <Link 
                 key={link.path} 
                 to={link.path} 
                 onClick={() => setMobileMenuOpen(false)}
                 className={`flex items-center gap-4 p-4 rounded-2xl hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all font-bold ${location.pathname === link.path ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : 'text-slate-600 dark:text-slate-400'}`}
               >
                  <span className="text-slate-500 dark:text-slate-400">{link.icon}</span>
                  {link.name}
               </Link>
             ))}

             {!user ? (
               <Link 
                 to="/login"
                 onClick={() => setMobileMenuOpen(false)}
                 className="flex items-center justify-center gap-4 p-4 rounded-2xl bg-primary-600 text-white font-bold w-full mt-4"
               >
                  <User className="w-5 h-5"/> Sign In Options
               </Link>
             ) : (
               <button 
                 onClick={handleLogout}
                 className="w-full flex items-center gap-4 p-4 rounded-2xl text-red-600 bg-red-50 dark:bg-red-900/20 font-bold mt-4"
               >
                  <LogOut className="w-5 h-5"/> Sign Out
               </button>
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
