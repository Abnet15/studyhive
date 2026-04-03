import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { UserPlus, Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    dept: '',
    year: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      dept: formData.dept,
      year: formData.year,
    });
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message || 'Registration failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-primary-500/15 rounded-full blur-[120px] -z-10 animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-accent-500/15 rounded-full blur-[120px] -z-10 animate-blob" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-[40%] left-[60%] w-[25%] h-[25%] bg-indigo-500/10 rounded-full blur-[100px] -z-10 animate-blob" style={{ animationDelay: '4s' }}></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8"
      >
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-600 text-white text-3xl mb-4 shadow-xl shadow-primary-500/30 animate-float">
            <UserPlus className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Join <span className="gradient-text italic">StudyHive</span>
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400 font-medium">
            Create your account and start sharing knowledge
          </p>
        </div>

        <div className="glass-card p-8 border-white/40 dark:border-white/10 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest px-1">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input-field py-4"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest px-1">
                University Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field py-4"
                placeholder="name@university.edu"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest px-1">
                Password
              </label>
              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field py-4 pr-12"
                  placeholder="Minimum 6 characters"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary-500 transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="dept" className="block text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest px-1">
                  Department
                </label>
                <input
                  type="text"
                  id="dept"
                  name="dept"
                  value={formData.dept}
                  onChange={handleChange}
                  className="input-field py-4"
                  placeholder="e.g., CS"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="year" className="block text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest px-1">
                  Year
                </label>
                <select
                  id="year"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="input-field py-4 appearance-none cursor-pointer select-caret"
                  required
                >
                  <option value="">Select</option>
                  {[1, 2, 3, 4, 5].map(y => (
                    <option key={y} value={y}>Year {y}</option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-100/50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-red-600 dark:text-red-400 text-sm font-bold animate-shake"
              >
                ⚠️ {error}
              </motion.div>
            )}

            <button 
              type="submit" 
              className="btn-primary w-full py-4 text-lg shadow-xl shadow-primary-500/20 disabled:opacity-60" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 dark:text-primary-400 hover:underline font-extrabold decoration-2 underline-offset-4">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
