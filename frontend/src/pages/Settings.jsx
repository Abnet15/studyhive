import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/apiClient';
import { useToast } from '../components/Toast';

const Settings = () => {
    const { user, token, logout } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();

    // Password form
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [pwLoading, setPwLoading] = useState(false);

    // Profile form
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

    return (
        <div className="min-h-screen px-4 py-6 sm:py-8 bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3 mb-2">
                    <button onClick={() => navigate(-1)} className="text-primary-600 dark:text-primary-400 hover:underline text-sm">← Back</button>
                </div>
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">⚙️ Settings</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Manage your account and security preferences.</p>
                </div>

                {/* Account Info */}
                <div className="card">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Account Information</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Name</span>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">{user.name}</p>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Email</span>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">{user.email}</p>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Role</span>
                            <p className="font-semibold text-gray-900 dark:text-gray-100 capitalize">{user.role}</p>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Department</span>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">{user.dept || 'N/A'}</p>
                        </div>
                    </div>
                </div>

                {/* Profile Update */}
                <div className="card">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Edit Profile</h2>
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                            <input
                                id="fullName"
                                type="text"
                                className="input-field"
                                value={profileForm.fullName}
                                onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                                required
                                minLength={2}
                            />
                        </div>
                        <div>
                            <label htmlFor="academicYear" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Academic Year</label>
                            <select
                                id="academicYear"
                                className="input-field"
                                value={profileForm.academicYear}
                                onChange={(e) => setProfileForm({ ...profileForm, academicYear: e.target.value })}
                            >
                                <option value="">Select year</option>
                                {[1, 2, 3, 4, 5].map((y) => (
                                    <option key={y} value={y}>Year {y}</option>
                                ))}
                            </select>
                        </div>
                        <button type="submit" className="btn-primary disabled:opacity-50" disabled={profLoading}>
                            {profLoading ? 'Saving...' : 'Save Profile'}
                        </button>
                    </form>
                </div>

                {/* Password Change */}
                <div className="card">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">🔒 Change Password</h2>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div>
                            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Current Password
                            </label>
                            <input
                                id="currentPassword"
                                type="password"
                                className="input-field"
                                value={passwordForm.currentPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                required
                                placeholder="Enter your current password"
                            />
                        </div>
                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                New Password
                            </label>
                            <input
                                id="newPassword"
                                type="password"
                                className="input-field"
                                value={passwordForm.newPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                required
                                minLength={6}
                                placeholder="Minimum 6 characters"
                            />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Confirm New Password
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                className="input-field"
                                value={passwordForm.confirmPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                required
                                minLength={6}
                                placeholder="Re-enter new password"
                            />
                        </div>
                        <button type="submit" className="btn-primary disabled:opacity-50" disabled={pwLoading}>
                            {pwLoading ? 'Changing...' : 'Change Password'}
                        </button>
                    </form>
                </div>

                {/* Danger Zone */}
                <div className="card border-red-200 dark:border-red-800">
                    <h2 className="text-lg font-bold text-red-600 dark:text-red-400 mb-3">Danger Zone</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Signing out will clear your session. You'll need to log in again to access your account.
                    </p>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-5 rounded-xl transition-colors text-sm"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
