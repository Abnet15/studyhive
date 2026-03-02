import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const GearIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
  </svg>
);

const UserDropdown = ({ user, onLogout, onClose }) => {
  const dropRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div ref={dropRef} className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{user.name}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
      </div>
      <div className="py-1">
        <Link to="/dashboard" onClick={onClose} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          📊 Dashboard
        </Link>
        <Link to="/profile" onClick={onClose} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          👤 Profile
        </Link>
        <Link to="/settings" onClick={onClose} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <GearIcon /> Settings
        </Link>
      </div>
      <div className="border-t border-gray-200 dark:border-gray-700 py-1">
        <button onClick={onLogout} className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
          🚪 Sign Out
        </button>
      </div>
    </div>
  );
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const navLinkClass = 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium text-sm';

  return (
    <nav className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md shadow-lg fixed top-0 left-0 right-0 w-full z-50 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          {user?.role === 'admin' ? (
            <div className="flex items-center space-x-2 sm:space-x-3">
              <img src="/images/logo.jpg" alt="StudyHive" className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg object-cover shadow-sm" style={{ aspectRatio: '1 / 1' }} />
              <span className="text-lg sm:text-2xl font-bold gradient-text">StudyHive Admin</span>
            </div>
          ) : (
            <Link to="/" className="flex items-center space-x-2 sm:space-x-3 group" onClick={closeMobileMenu}>
              <img src="/images/logo.jpg" alt="StudyHive" className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg object-cover shadow-sm group-hover:shadow-md transition-shadow" style={{ aspectRatio: '1 / 1' }} />
              <span className="text-lg sm:text-2xl font-bold gradient-text group-hover:scale-105 transition-transform">StudyHive</span>
            </Link>
          )}

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
            {user?.role === 'admin' ? (
              <>
                <Link to="/admin" className={navLinkClass}>Dashboard</Link>
                <Link to="/settings" className={navLinkClass}><GearIcon /></Link>
                <button onClick={handleLogout} className="btn-secondary text-sm py-2 px-4">Logout</button>
              </>
            ) : (
              <>
                <Link to="/" className={navLinkClass}>Home</Link>
                <Link to="/about" className={navLinkClass}>About</Link>
                {user ? (
                  <>
                    <Link to="/courses" className={navLinkClass}>Courses</Link>
                    <Link to="/upload" className={navLinkClass}>Upload</Link>
                    {/* User avatar + dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xs font-bold">
                          {(user.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden lg:inline max-w-[100px] truncate">
                          {user.name?.split(' ')[0]}
                        </span>
                        <svg className={`w-3.5 h-3.5 text-gray-500 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </button>
                      {userDropdownOpen && (
                        <UserDropdown user={user} onLogout={handleLogout} onClose={() => setUserDropdownOpen(false)} />
                      )}
                    </div>
                  </>
                ) : (
                  <Link to="/login" className="btn-primary text-sm py-2 px-5">Login</Link>
                )}
              </>
            )}
          </div>

          {/* Right icons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
              aria-label="Toggle theme"
            >
              {isDark ? '☀️' : '🌙'}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden w-[80%] ml-auto bg-white dark:bg-gray-800 rounded-b-2xl shadow-2xl ring-1 ring-gray-200 dark:ring-gray-700 border-t border-gray-200 dark:border-gray-700">
          <div className="px-4 py-3 space-y-1">
            {user?.role === 'admin' ? (
              <>
                <Link to="/admin" onClick={closeMobileMenu} className="block py-2.5 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium">📊 Dashboard</Link>
                <Link to="/settings" onClick={closeMobileMenu} className="block py-2.5 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium">⚙️ Settings</Link>
                <button onClick={handleLogout} className="block w-full text-left py-2.5 text-red-600 dark:text-red-400 font-medium">🚪 Sign Out</button>
              </>
            ) : (
              <>
                <Link to="/" onClick={closeMobileMenu} className="block py-2.5 text-gray-700 dark:text-gray-300 hover:text-primary-600 font-medium">🏠 Home</Link>
                <Link to="/about" onClick={closeMobileMenu} className="block py-2.5 text-gray-700 dark:text-gray-300 hover:text-primary-600 font-medium">ℹ️ About</Link>
                {user ? (
                  <>
                    <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
                    <Link to="/dashboard" onClick={closeMobileMenu} className="block py-2.5 text-gray-700 dark:text-gray-300 hover:text-primary-600 font-medium">📊 Dashboard</Link>
                    <Link to="/courses" onClick={closeMobileMenu} className="block py-2.5 text-gray-700 dark:text-gray-300 hover:text-primary-600 font-medium">📚 Courses</Link>
                    <Link to="/upload" onClick={closeMobileMenu} className="block py-2.5 text-gray-700 dark:text-gray-300 hover:text-primary-600 font-medium">📤 Upload</Link>
                    <Link to="/profile" onClick={closeMobileMenu} className="block py-2.5 text-gray-700 dark:text-gray-300 hover:text-primary-600 font-medium">👤 Profile</Link>
                    <Link to="/settings" onClick={closeMobileMenu} className="block py-2.5 text-gray-700 dark:text-gray-300 hover:text-primary-600 font-medium">⚙️ Settings</Link>
                    <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
                    <button onClick={handleLogout} className="block w-full text-left py-2.5 text-red-600 dark:text-red-400 font-medium">🚪 Sign Out</button>
                  </>
                ) : (
                  <>
                    <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
                    <Link to="/login" onClick={closeMobileMenu} className="block py-2.5 text-primary-600 dark:text-primary-400 font-semibold">Login</Link>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
