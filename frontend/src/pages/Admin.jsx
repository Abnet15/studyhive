import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMaterials } from '../context/MaterialContext';
import { useCourses } from '../context/CourseContext';

const StatCard = ({ label, value, icon, color }) => (
  <div className="glass-card p-6 group hover:-translate-y-1 transition-all duration-300 overflow-hidden relative">
    <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${color} opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity`}></div>
    <div className="relative z-10 flex items-center justify-between">
      <div>
        <div className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">{label}</div>
        <div className="text-3xl font-black text-slate-900 dark:text-white">{value}</div>
      </div>
      <div className="text-4xl group-hover:scale-110 transition-transform">{icon}</div>
    </div>
  </div>
);

const TabButton = ({ active, onClick, children, icon }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-4 font-bold transition-all duration-300 border-b-2 ${active
        ? 'border-primary-500 text-primary-600 bg-primary-500/5'
        : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
      }`}
  >
    <span>{icon}</span>
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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in" onClick={onClose}>
      <div
        className="glass-card w-full max-w-md overflow-hidden animate-float"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">User Settings</h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">✕</button>
        </div>

        <div className="p-8 space-y-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-primary-500 to-indigo-500 flex items-center justify-center text-white text-3xl font-black shadow-xl">
              {(targetUser.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{targetUser.name}</p>
              <p className="text-slate-500 font-medium">{targetUser.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
               <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">Access Role</label>
               <select
                 className="input-field py-4"
                 value={role}
                 onChange={(e) => setRole(e.target.value)}
                 disabled={isAdmin}
               >
                 <option value="student">Student</option>
                 <option value="moderator">Moderator</option>
                 <option value="admin">Administrator</option>
               </select>
            </div>

            <div className="space-y-2">
               <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">Account Status</label>
               <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                     <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.5)]' : 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]'}`}></div>
                     <span className="font-bold text-slate-700 dark:text-slate-300">{isActive ? 'User is Active' : 'User is Banned'}</span>
                  </div>
                  <button
                    disabled={isAdmin}
                    onClick={() => setIsActive(!isActive)}
                    className={`py-2 px-6 rounded-xl font-bold transition-all ${isActive ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-green-100 text-green-600 hover:bg-green-200'}`}
                  >
                    {isActive ? 'Ban User' : 'Restore'}
                  </button>
               </div>
            </div>
          </div>
        </div>

        <div className="p-8 bg-slate-50/50 dark:bg-slate-900/50 flex gap-4">
           <button onClick={onClose} className="btn-secondary flex-1 py-4">Discard</button>
           <button 
             onClick={handleSave} 
             disabled={saving || isAdmin} 
             className="btn-primary flex-1 py-4 shadow-xl"
           >
             {saving ? 'Syncing...' : 'Save Changes'}
           </button>
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

  const format = (n) => (typeof n === 'number' ? n.toLocaleString() : n);

  return (
    <div className="min-h-screen pb-20 pt-10 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-end gap-6">
           <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary-500/10 text-primary-600 text-xs font-black uppercase tracking-widest">
                 <span className="w-2 h-2 rounded-full bg-primary-500 animate-ping"></span>
                 System Administrator Hub
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white">
                 Control <span className="gradient-text italic">Panel.</span>
              </h1>
           </div>
           <div className="flex gap-4">
              <button onClick={() => window.print()} className="btn-secondary py-4 px-8">Export Report</button>
              <button onClick={() => refreshUsers()} className="btn-primary py-4 px-8">Sync Data</button>
           </div>
        </header>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <StatCard label="Live Users" value={format(stats.totalUsers)} icon="👥" color="from-blue-500 to-indigo-600" />
           <StatCard label="Repository" value={format(stats.totalMaterials)} icon="📁" color="from-purple-500 to-pink-600" />
           <StatCard label="Exam Banks" value={format(stats.totalExams)} icon="📝" color="from-orange-500 to-red-600" />
           <StatCard label="Impact" value={format(stats.totalDownloads)} icon="✨" color="from-emerald-500 to-teal-600" />
        </section>

        {/* Content Tabs */}
        <div className="glass-card shadow-2xl overflow-hidden min-h-[600px] flex flex-col">
           <div className="flex bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
              <TabButton active={activeTab === 'materials'} onClick={() => setActiveTab('materials')} icon="📚">Content Management</TabButton>
              <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon="👥">User Directory</TabButton>
           </div>

           <div className="p-8 flex-1 flex flex-col space-y-8">
              
              {/* Tab Header Actions */}
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                 <div className="relative w-full md:w-96 group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors">🔍</span>
                    <input 
                      type="text" 
                      placeholder={activeTab === 'materials' ? "Search by title or description..." : "Search by name or email..."}
                      className="input-field py-4 pl-12 bg-white dark:bg-slate-900"
                      value={activeTab === 'materials' ? search : userSearch}
                      onChange={(e) => activeTab === 'materials' ? setSearch(e.target.value) : setUserSearch(e.target.value)}
                    />
                 </div>
                 
                 {activeTab === 'materials' && (
                   <div className="flex gap-4 w-full md:w-auto">
                      <select className="input-field py-4 min-w-[150px]" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                         <option value="">All Types</option>
                         <option value="material">Materials</option>
                         <option value="exam">Exams</option>
                      </select>
                      <select className="input-field py-4 min-w-[150px]" value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}>
                         <option value="">All Courses</option>
                         {courses.map(c => <option key={c.id} value={c.id}>{c.course_code}</option>)}
                      </select>
                   </div>
                 )}
              </div>

              {/* Data Table */}
              <div className="flex-1 overflow-x-auto rounded-[2rem] border border-slate-100 dark:border-slate-800">
                 <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/50 dark:bg-slate-900/50">
                       <tr className="text-slate-500 font-black uppercase tracking-widest text-[10px]">
                          {activeTab === 'materials' ? (
                            <>
                              <th className="px-8 py-6">Title & Meta</th>
                              <th className="px-8 py-6">Course</th>
                              <th className="px-8 py-6">Reach</th>
                              <th className="px-8 py-6 text-right">Actions</th>
                            </>
                          ) : (
                            <>
                              <th className="px-8 py-6">User Profile</th>
                              <th className="px-8 py-6">Institution</th>
                              <th className="px-8 py-6">Status</th>
                              <th className="px-8 py-6 text-right">Actions</th>
                            </>
                          )}
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                       {activeTab === 'materials' ? (
                         filteredMaterials.map(m => (
                           <tr key={m.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                              <td className="px-8 py-6">
                                 <div className="font-bold text-slate-900 dark:text-white group-hover:text-primary-500 transition-colors">{m.title}</div>
                                 <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                                    {m.material_type} • {m.file_type || 'PDF'}
                                 </div>
                              </td>
                              <td className="px-8 py-6">
                                 <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                    {courses.find(c => c.id === m.course_id)?.course_code || 'N/A'}
                                 </div>
                              </td>
                              <td className="px-8 py-6">
                                 <div className="text-sm font-black text-slate-900 dark:text-white">{format(m.downloads || 0)}</div>
                                 <div className="text-[10px] uppercase font-bold text-slate-400">Downloads</div>
                              </td>
                              <td className="px-8 py-6 text-right">
                                 <div className="flex justify-end gap-2">
                                    <button onClick={() => navigate(`/materials/${m.id}`)} className="p-3 hover:bg-primary-500/10 text-primary-500 rounded-xl transition-colors">👁️</button>
                                    <button onClick={() => deleteMaterial(m.id)} className="p-3 hover:bg-red-500/10 text-red-500 rounded-xl transition-colors">🗑️</button>
                                 </div>
                              </td>
                           </tr>
                         ))
                       ) : (
                         filteredUsers.map(u => (
                           <tr key={u.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                              <td className="px-8 py-6 flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-primary-500">
                                    {u.name?.charAt(0)}
                                 </div>
                                 <div>
                                    <div className="font-bold text-slate-900 dark:text-white">{u.name}</div>
                                    <div className="text-xs text-slate-500">{u.email}</div>
                                 </div>
                              </td>
                              <td className="px-8 py-6">
                                 <div className="text-sm font-bold text-slate-700 dark:text-slate-300">{u.dept}</div>
                                 <div className="text-[10px] text-slate-500 uppercase font-bold">Year {u.year}</div>
                              </td>
                              <td className="px-8 py-6">
                                 <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter ${u.isActive !== false ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                    {u.isActive !== false ? 'Active' : 'Restricted'}
                                 </span>
                              </td>
                              <td className="px-8 py-6 text-right">
                                 <button onClick={() => setManagingUser(u)} className="py-2 px-6 bg-slate-100 dark:bg-slate-800 hover:bg-primary-500 hover:text-white font-bold rounded-xl transition-all">
                                    Manage
                                 </button>
                              </td>
                           </tr>
                         ))
                       )}
                    </tbody>
                 </table>
                 {(activeTab === 'materials' ? filteredMaterials : filteredUsers).length === 0 && (
                   <div className="p-20 text-center space-y-4">
                      <div className="text-6xl grayscale">🏜️</div>
                      <h4 className="text-xl font-bold text-slate-900 dark:text-white">No records found</h4>
                      <p className="text-slate-500">Try adjusting your search or filters to find what you're looking for.</p>
                   </div>
                 )}
              </div>

           </div>
        </div>

      </div>

      {managingUser && (
        <UserManageModal
          targetUser={managingUser}
          onClose={() => setManagingUser(null)}
          onUpdate={async (id, updates) => {
             await updateUser(id, updates);
             await refreshUsers();
          }}
        />
      )}
    </div>
  );
};

export default Admin;
