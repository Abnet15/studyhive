import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/apiClient';
import { useToast } from '../components/Toast';
import { motion } from 'framer-motion';
import { ArrowLeft, Settings as SettingsIcon, User, Mail, Shield, Building2, Pencil, Lock, LogOut, Save, GraduationCap, AlertTriangle } from 'lucide-react';

const Settings = () => {
    const { user, token, logout } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [pwLoading, setPwLoading] = useState(false);

    const [profileForm, setProfileForm] = useState({
        fullName: user?.name || '',
        academicYear: user?.year || '',
    });
    const [profLoading, setProfLoading] = useState(false);

    if (!user) {
        navigate('/login');
        return null;
    }

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error("New passwords don't match.");
            return;
        }
        if (passwordForm.newPassword.length < 6) {
            toast.error('New password must be at least 6 characters.');
            return;
        }
        if (passwordForm.currentPassword === passwordForm.newPassword) {
            toast.warn('New password must be different from current password.');
            return;
        }
        setPwLoading(true);
        try {
            await apiClient.patch('/auth/password', {
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword,
            }, { token });
            toast.success('Password changed successfully!');
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            toast.error(err.message || 'Failed to change password.');
        } finally {
            setPwLoading(false);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setProfLoading(true);
        try {
            await apiClient.patch('/auth/profile', {
                fullName: profileForm.fullName,
                academicYear: profileForm.academicYear ? Number(profileForm.academicYear) : null,
            }, { token });
            toast.success('Profile updated! Changes will appear on next login.');
        } catch (err) {
            toast.error(err.message || 'Failed to update profile.');
        } finally {
            setProfLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    const stagger = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    return (
        <div className="min-h-screen px-4 py-12 bg-slate-50 dark:bg-[#030712] relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[120px] pointer-events-none -z-10 animate-blob"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent-500/10 rounded-full blur-[120px] pointer-events-none -z-10 animate-blob" style={{ animationDelay: '3s' }}></div>

            <motion.div 
                initial="hidden" animate="visible" variants={stagger}
                className="max-w-3xl mx-auto space-y-8 relative z-10"
            >
                {/* Back Navigation */}
                <motion.div variants={fadeIn}>
                    <button 
                        onClick={() => navigate(-1)} 
                        className="group text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center space-x-2 font-bold"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span>Back</span>
                    </button>
                </motion.div>

                {/* Page Header */}
                <motion.div variants={fadeIn} className="space-y-2">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/30">
                            <SettingsIcon className="w-7 h-7" />
                        </div>
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Settings</h1>
                            <p className="text-slate-500 dark:text-slate-400 font-medium">Manage your account and security preferences.</p>
                        </div>
                    </div>
                </motion.div>

                {/* Account Information Card */}
                <motion.div variants={fadeIn} className="glass-card p-8 relative overflow-hidden shadow-xl">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-primary-500/10 to-transparent blur-3xl rounded-full"></div>
                    
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                        <span className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-xl text-primary-600">
                            <User className="w-5 h-5" />
                        </span>
                        Account Information
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
                        <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 shrink-0">
                                <User className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Name</span>
                                <p className="font-bold text-slate-900 dark:text-white">{user.name}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 shrink-0">
                                <Mail className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Email</span>
                                <p className="font-bold text-slate-900 dark:text-white">{user.email}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
                            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 shrink-0">
                                <Shield className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Role</span>
                                <p className="font-bold text-slate-900 dark:text-white capitalize">{user.role}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
                            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 shrink-0">
                                <Building2 className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Department</span>
                                <p className="font-bold text-slate-900 dark:text-white">{user.dept || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Profile Update Card */}
                <motion.div variants={fadeIn} className="glass-card p-8 shadow-xl">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                        <span className="p-2 bg-accent-100 dark:bg-accent-900/30 rounded-xl text-accent-600">
                            <Pencil className="w-5 h-5" />
                        </span>
                        Edit Profile
                    </h2>
                    <form onSubmit={handleProfileUpdate} className="space-y-5">
                        <div>
                            <label htmlFor="fullName" className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                <User className="w-4 h-4 text-slate-400" />
                                Full Name
                            </label>
                            <input
                                id="fullName"
                                type="text"
                                className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none placeholder:text-slate-400"
                                value={profileForm.fullName}
                                onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                                required
                                minLength={2}
                                placeholder="Enter your full name"
                            />
                        </div>
                        <div>
                            <label htmlFor="academicYear" className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                <GraduationCap className="w-4 h-4 text-slate-400" />
                                Academic Year
                            </label>
                            <select
                                id="academicYear"
                                className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none appearance-none cursor-pointer"
                                value={profileForm.academicYear}
                                onChange={(e) => setProfileForm({ ...profileForm, academicYear: e.target.value })}
                            >
                                <option value="">Select year</option>
                                {[1, 2, 3, 4, 5].map((y) => (
                                    <option key={y} value={y}>Year {y}</option>
                                ))}
                            </select>
                        </div>
                        <button 
                            type="submit" 
                            className="btn-primary py-4 px-8 flex items-center gap-2 shadow-xl shadow-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed" 
                            disabled={profLoading}
                        >
                            <Save className="w-5 h-5" />
                            {profLoading ? 'Saving...' : 'Save Profile'}
                        </button>
                    </form>
                </motion.div>

                {/* Password Change Card */}
                <motion.div variants={fadeIn} className="glass-card p-8 shadow-xl">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                        <span className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-xl text-orange-600">
                            <Lock className="w-5 h-5" />
                        </span>
                        Change Password
                    </h2>
                    <form onSubmit={handlePasswordChange} className="space-y-5">
                        <div>
                            <label htmlFor="currentPassword" className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                <Lock className="w-4 h-4 text-slate-400" />
                                Current Password
                            </label>
                            <input
                                id="currentPassword"
                                type="password"
                                className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none placeholder:text-slate-400"
                                value={passwordForm.currentPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                required
                                placeholder="Enter your current password"
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label htmlFor="newPassword" className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    New Password
                                </label>
                                <input
                                    id="newPassword"
                                    type="password"
                                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none placeholder:text-slate-400"
                                    value={passwordForm.newPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                    required
                                    minLength={6}
                                    placeholder="Minimum 6 characters"
                                />
                            </div>
                            <div>
                                <label htmlFor="confirmPassword" className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    Confirm Password
                                </label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none placeholder:text-slate-400"
                                    value={passwordForm.confirmPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                    required
                                    minLength={6}
                                    placeholder="Re-enter new password"
                                />
                            </div>
                        </div>
                        <button 
                            type="submit" 
                            className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold py-4 px-8 rounded-2xl shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30 hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" 
                            disabled={pwLoading}
                        >
                            <Lock className="w-5 h-5" />
                            {pwLoading ? 'Changing...' : 'Update Password'}
                        </button>
                    </form>
                </motion.div>

                {/* Danger Zone */}
                <motion.div variants={fadeIn} className="glass-card p-8 shadow-xl border-red-200/50 dark:border-red-800/30 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-32 bg-gradient-to-bl from-red-500/5 to-transparent blur-3xl rounded-full pointer-events-none"></div>
                    
                    <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-3 flex items-center gap-3">
                        <span className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl text-red-600">
                            <AlertTriangle className="w-5 h-5" />
                        </span>
                        Danger Zone
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed max-w-lg">
                        Signing out will clear your session. You'll need to log in again to access your account.
                    </p>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/30 hover:-translate-y-0.5 flex items-center gap-2"
                    >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </button>
                </motion.div>

            </motion.div>
        </div>
    );
};

export default Settings;
