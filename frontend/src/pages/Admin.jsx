import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMaterials } from '../context/MaterialContext';
import { useCourses } from '../context/CourseContext';

const StatCard = ({ label, value, icon, gradient }) => (
  <div className={`card bg-gradient-to-br ${gradient} text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1`}>
    <div className="flex items-center justify-between">
      <div>
        <div className="text-2xl sm:text-3xl font-bold mb-1">{value}</div>
        <div className="text-white/90 text-xs sm:text-sm font-medium">{label}</div>
      </div>
      <div className="text-3xl sm:text-4xl opacity-80">{icon}</div>
    </div>
  </div>
);

const TabButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-3 sm:px-6 py-2.5 sm:py-3 font-semibold rounded-t-lg transition-all duration-200 text-xs sm:text-sm whitespace-nowrap ${active
        ? 'bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 border-t-2 border-primary-600 dark:border-primary-400 shadow-md'
        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
      }`}
  >
    {children}
  </button>
);

/* ────────────────────── User Manage Modal ────────────────────── */
const UserManageModal = ({ targetUser, onClose, onUpdate, onDelete }) => {
  const [role, setRole] = useState(targetUser.role);
  const [isActive, setIsActive] = useState(targetUser.isActive !== false);
  const [saving, setSaving] = useState(false);
  const isAdmin = targetUser.role === 'admin';

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = {};
      if (role !== targetUser.role) updates.role = role;
      if (isActive !== (targetUser.isActive !== false)) updates.isActive = isActive;
      if (Object.keys(updates).length) {
        await onUpdate(targetUser.id, updates);
      }
      onClose();
    } catch (err) {
      alert('❌ ' + (err.message || 'Failed to update user'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Permanently delete "${targetUser.name}"? This cannot be undone.`)) return;
    try {
      await onDelete(targetUser.id);
      onClose();
    } catch (err) {
      alert('❌ ' + (err.message || 'Failed to delete user'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Manage User</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xl leading-none">&times;</button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* User info */}
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
              {(targetUser.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">{targetUser.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{targetUser.email}</p>
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Role</label>
            <select
              className="input-field"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={isAdmin}
            >
              <option value="student">Student</option>
              <option value="moderator">Moderator</option>
              <option value="admin">Admin</option>
            </select>
            {isAdmin && <p className="text-xs text-gray-500 mt-1">Admin role cannot be changed.</p>}
          </div>

          {/* Active / Ban */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Account Status</label>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                disabled={isAdmin}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${isActive ? 'bg-green-500' : 'bg-red-400'
                  } ${isAdmin ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${isActive ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
              <span className={`text-sm font-medium ${isActive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {isActive ? 'Active' : 'Banned'}
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Department</span>
              <p className="font-medium text-gray-900 dark:text-gray-100">{targetUser.dept || 'N/A'}</p>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Year</span>
              <p className="font-medium text-gray-900 dark:text-gray-100">{targetUser.year || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 flex flex-col sm:flex-row gap-2 justify-between">
          {!isAdmin && (
            <button onClick={handleDelete} className="text-red-600 dark:text-red-400 hover:text-red-800 text-sm font-semibold order-2 sm:order-1">
              🗑 Delete User
            </button>
          )}
          <div className="flex gap-2 order-1 sm:order-2 sm:ml-auto">
            <button onClick={onClose} className="btn-secondary text-sm py-2 px-4">Cancel</button>
            <button onClick={handleSave} disabled={saving || isAdmin} className="btn-primary text-sm py-2 px-4 disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ────────────────────── Admin Page ────────────────────── */
const Admin = () => {
  const navigate = useNavigate();
  const { user, users, deleteUser, updateUser, refreshUsers } = useAuth();
  const { materials, deleteMaterial, refreshMaterials } = useMaterials();
  const { courses } = useCourses();
  const [activeTab, setActiveTab] = useState('materials');
  const [typeFilter, setTypeFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [search, setSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [managingUser, setManagingUser] = useState(null);

  const isAdmin = user?.role === 'admin';
  if (!isAdmin) {
    navigate('/');
    return null;
  }

  const stats = useMemo(() => {
    const totalUsers = users.length;
    const totalMaterials = materials.length;
    const totalExams = materials.filter((m) => m.material_type === 'exam').length;
    const totalDownloads = materials.reduce((s, m) => s + (m.downloads || 0), 0);
    return { totalUsers, totalMaterials, totalExams, totalDownloads };
  }, [users, materials]);

  const filteredMaterials = useMemo(() => {
    let list = [...materials];
    if (typeFilter) list = list.filter((m) => m.material_type === typeFilter);
    if (courseFilter) list = list.filter((m) => String(m.course_id) === courseFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (m) => m.title.toLowerCase().includes(q) || (m.desc || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [materials, typeFilter, courseFilter, search]);

  const filteredUsers = useMemo(() => {
    if (!userSearch) return users;
    const q = userSearch.toLowerCase();
    return users.filter(
      (u) =>
        (u.name || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.dept || '').toLowerCase().includes(q)
    );
  }, [users, userSearch]);

  const handleDeleteMaterial = async (id, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}"?`)) return;
    await deleteMaterial(id);
    await refreshMaterials();
  };

  const handleDeleteUser = async (userId) => {
    await deleteUser(userId);
    await refreshUsers();
  };

  const handleUpdateUser = async (userId, updates) => {
    await updateUser(userId, updates);
  };

  const format = (n) => (typeof n === 'number' ? n.toLocaleString() : n);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-3 sm:px-4 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-3">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Manage materials, users, and platform analytics
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          <StatCard label="Total Users" value={format(stats.totalUsers)} icon="👥" gradient="from-blue-500 to-blue-600" />
          <StatCard label="Resources" value={format(stats.totalMaterials)} icon="📚" gradient="from-purple-500 to-purple-600" />
          <StatCard label="Exams" value={format(stats.totalExams)} icon="📝" gradient="from-green-500 to-green-600" />
          <StatCard label="Downloads" value={format(stats.totalDownloads)} icon="📥" gradient="from-pink-500 to-pink-600" />
        </div>

        {/* Tabs */}
        <div className="card p-0 overflow-hidden shadow-xl">
          <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 overflow-x-auto">
            <TabButton active={activeTab === 'materials'} onClick={() => setActiveTab('materials')}>
              📚 Materials
            </TabButton>
            <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')}>
              👥 Users
            </TabButton>
          </div>

          <div className="p-3 sm:p-6">
            {/* Materials Tab */}
            {activeTab === 'materials' && (
              <div className="space-y-4 sm:space-y-6">
                {/* Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div className="sm:col-span-2">
                    <input type="text" placeholder="🔍 Search..." className="input-field w-full text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
                  </div>
                  <select className="input-field text-sm" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                    <option value="">All Types</option>
                    <option value="material">📚 Materials</option>
                    <option value="exam">📝 Exams</option>
                  </select>
                  <select className="input-field text-sm" value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}>
                    <option value="">All Courses</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>{c.course_code} - {c.course_name}</option>
                    ))}
                  </select>
                </div>

                {/* Materials — Cards on mobile, Table on desktop */}
                <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        {['Title', 'Type', 'Course', 'Downloads', 'Uploaded', 'Actions'].map((h) => (
                          <th key={h} className={`px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider ${h === 'Actions' ? 'text-right' : 'text-left'}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredMaterials.length === 0 ? (
                        <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-500">📭 No materials found</td></tr>
                      ) : filteredMaterials.map((m) => {
                        const course = courses.find((c) => c.id === m.course_id);
                        return (
                          <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <td className="px-4 py-3"><div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{m.title}</div><div className="text-xs text-gray-500 truncate max-w-[200px]">{m.desc}</div></td>
                            <td className="px-4 py-3"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${m.material_type === 'exam' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'}`}>{m.material_type === 'exam' ? '📝 Exam' : '📚 Material'}</span></td>
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{course?.course_code || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{format(m.downloads || 0)}</td>
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{m.upload_date ? new Date(m.upload_date).toLocaleDateString() : '-'}</td>
                            <td className="px-4 py-3 text-right text-sm space-x-2">
                              <button onClick={() => navigate(`/materials/${m.id}`)} className="text-primary-600 dark:text-primary-400 hover:text-primary-800 font-semibold">View</button>
                              <button onClick={() => handleDeleteMaterial(m.id, m.title)} className="text-red-600 dark:text-red-400 hover:text-red-800 font-semibold">Delete</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Materials — Card view on mobile */}
                <div className="md:hidden space-y-3">
                  {filteredMaterials.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">📭 No materials found</div>
                  ) : filteredMaterials.map((m) => {
                    const course = courses.find((c) => c.id === m.course_id);
                    return (
                      <div key={m.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-gray-800">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm flex-1 mr-2">{m.title}</h4>
                          <span className={`px-2 py-0.5 text-xs font-semibold rounded-full flex-shrink-0 ${m.material_type === 'exam' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'}`}>{m.material_type === 'exam' ? 'Exam' : 'Material'}</span>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">{course?.course_code || 'N/A'} · {format(m.downloads || 0)} downloads</p>
                        <div className="flex gap-2">
                          <button onClick={() => navigate(`/materials/${m.id}`)} className="text-xs text-primary-600 dark:text-primary-400 font-semibold">View</button>
                          <button onClick={() => handleDeleteMaterial(m.id, m.title)} className="text-xs text-red-600 dark:text-red-400 font-semibold">Delete</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="space-y-4 sm:space-y-6">
                <input type="text" placeholder="🔍 Search by name, email, or department..." className="input-field w-full text-sm" value={userSearch} onChange={(e) => setUserSearch(e.target.value)} />

                {/* Users — Table on desktop */}
                <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        {['Name', 'Email', 'Department', 'Role', 'Status', 'Actions'].map((h) => (
                          <th key={h} className={`px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider ${h === 'Actions' ? 'text-right' : 'text-left'}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredUsers.length === 0 ? (
                        <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-500">👤 No users found</td></tr>
                      ) : filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <td className="px-4 py-3"><div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{u.name}</div></td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{u.email}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{u.dept}</td>
                          <td className="px-4 py-3"><span className={`px-2 py-1 text-xs font-semibold rounded-full uppercase ${u.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' : u.role === 'moderator' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>{u.role || 'student'}</span></td>
                          <td className="px-4 py-3"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${u.isActive !== false ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>{u.isActive !== false ? '● Active' : '● Banned'}</span></td>
                          <td className="px-4 py-3 text-right text-sm">
                            <button onClick={() => setManagingUser(u)} className="text-primary-600 dark:text-primary-400 hover:text-primary-800 font-semibold">Manage</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Users — Card view on mobile */}
                <div className="md:hidden space-y-3">
                  {filteredUsers.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">👤 No users found</div>
                  ) : filteredUsers.map((u) => (
                    <div key={u.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-gray-800">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                            {(u.name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">{u.name}</p>
                            <p className="text-xs text-gray-500 truncate">{u.email}</p>
                          </div>
                        </div>
                        <button onClick={() => setManagingUser(u)} className="text-xs text-primary-600 dark:text-primary-400 font-semibold flex-shrink-0">Manage</button>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full uppercase ${u.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>{u.role || 'student'}</span>
                        <span className={`text-xs font-medium ${u.isActive !== false ? 'text-green-600' : 'text-red-600'}`}>{u.isActive !== false ? '● Active' : '● Banned'}</span>
                        <span className="text-xs text-gray-500">{u.dept}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Manage Modal */}
      {managingUser && (
        <UserManageModal
          targetUser={managingUser}
          onClose={() => setManagingUser(null)}
          onUpdate={handleUpdateUser}
          onDelete={handleDeleteUser}
        />
      )}
    </div>
  );
};

export default Admin;
