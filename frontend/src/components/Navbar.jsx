import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const navLinks = user?.role === 'admin' 
    ? [
        { name: 'Admin Hub', path: '/admin', icon: '📊' },
        { name: 'Settings', path: '/settings', icon: '⚙️' },
      ]
    : [
        { name: 'Home', path: '/', icon: '🏠' },
        { name: 'Courses', path: '/courses', icon: '📚' },
        { name: 'AI Assistant', path: '/ai-assistant', icon: '🤖', highlight: true },
        { name: 'Upload', path: '/upload', icon: '📤' },
      ];

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 px-4 md:px-8 py-4 ${scrolled ? 'pt-4' : 'pt-6'}`}>
      <div className={`max-w-7xl mx-auto rounded-[2rem] transition-all duration-500 border ${scrolled 
        ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl shadow-2xl border-white/40 dark:border-white/10' 
        : 'bg-transparent border-transparent'}`}>
        
        <div className="flex justify-between items-center h-16 px-6 md:px-10">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-600 flex items-center justify-center text-white text-xl shadow-lg group-hover:rotate-12 transition-transform duration-300">
               🐝
            </div>
            <span className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">
               Study<span className="gradient-text">Hive</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                to={link.path} 
                className={`nav-link flex items-center gap-2 ${location.pathname === link.path ? 'text-primary-600 after:w-full' : ''} ${link.highlight ? 'text-primary-500 font-bold' : ''}`}
              >
                <span className={link.highlight ? 'animate-bounce' : ''}>{link.icon}</span>
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
             <button 
               onClick={toggleTheme}
               className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-lg"
             >
               {isDark ? '☀️' : '🌙'}
             </button>

             {user ? (
               <div className="flex items-center gap-4 pl-4 border-l border-slate-200 dark:border-slate-800">
                  <div className="text-right hidden sm:block">
                     <div className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">{user.name?.split(' ')[0]}</div>
                     <div className="text-[10px] text-primary-500 font-bold uppercase">{user.role}</div>
                  </div>
                  <button onClick={handleLogout} className="p-3 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors">
                     🚪
                  </button>
               </div>
             ) : (
               <Link to="/login" className="btn-primary py-2.5 px-6 text-sm">
                  Login
               </Link>
             )}

             {/* Mobile Menu Toggle */}
             <button 
               onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
               className="md:hidden p-3 rounded-2xl bg-slate-100 dark:bg-slate-800"
             >
               {mobileMenuOpen ? '✕' : '☰'}
             </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-4 right-4 mt-2 glass-card p-6 space-y-4 animate-float">
           {navLinks.map((link) => (
             <Link 
               key={link.path} 
               to={link.path} 
               onClick={() => setMobileMenuOpen(false)}
               className={`flex items-center gap-4 p-4 rounded-2xl hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all ${location.pathname === link.path ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600' : 'text-slate-600 dark:text-slate-400'}`}
             >
                <span className="text-2xl">{link.icon}</span>
                <span className="font-bold">{link.name}</span>
             </Link>
           ))}
           {user && (
             <button 
               onClick={handleLogout}
               className="w-full flex items-center gap-4 p-4 rounded-2xl text-red-600 bg-red-50 dark:bg-red-900/20 font-bold"
             >
                <span className="text-2xl">🚪</span>
                <span>Sign Out</span>
             </button>
           )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
