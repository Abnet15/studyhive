import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMaterials } from '../context/MaterialContext';
import { useCourses } from '../context/CourseContext';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../services/apiClient';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, FolderLock, FileText, DownloadCloud, Activity, LayoutDashboard, 
  Settings, Award, RefreshCcw, Download, ShieldCheck, Ban, Trash2, Eye, ShieldAlert
} from 'lucide-react';

const fetchDashboardStats = async ({ queryKey }) => {
  const [_key, token] = queryKey;
  return apiClient.get('/dashboard/summary', { token });
};

const StatCard = ({ label, value, icon, color, delay }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.4 }}
    className="glass-card p-6 group hover:-translate-y-2 transition-all duration-300 overflow-hidden relative shadow-2xl"
  >
    <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${color} opacity-10 rounded-full blur-3xl group-hover:opacity-30 transition-opacity animate-pulse-glow`}></div>
    <div className="relative z-10 flex items-center justify-between">
      <div>
        <div className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-2">{label}</div>
        <div className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{value}</div>
      </div>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white bg-gradient-to-br ${color} shadow-lg shadow-black/10 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
    </div>
  </motion.div>
);

const TabButton = ({ active, onClick, children, icon: Icon }) => (
  <button
    onClick={onClick}
    className={`flex flex-1 items-center justify-center gap-3 py-5 font-bold transition-all duration-300 border-b-2 ${
      active
        ? 'border-primary-500 text-primary-600 bg-primary-500/10'
        : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
    }`}
  >
    <Icon className={`w-5 h-5 ${active ? 'animate-bounce' : ''}`} />
    {children}
  </button>
);

/* ────────────────────── User Manage Modal ────────────────────── */
const UserManageModal = ({ targetUser, onClose, onUpdate }) => {
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="glass-card w-full max-w-md overflow-hidden border-white/20 shadow-2xl shadow-primary-500/20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-gradient-to-r from-primary-500/5 to-transparent">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Settings className="w-6 h-6 text-primary-500" /> User Settings
            </h3>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">✕</button>
        </div>

        <div className="p-8 space-y-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-tr from-primary-500 to-indigo-500 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-primary-500/30">
              {(targetUser.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{targetUser.name}</p>
              <p className="text-sm font-bold text-slate-500 font-medium">{targetUser.email}</p>
              {isAdmin && <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-400 text-[10px] font-black uppercase tracking-widest">Super Admin</span>}
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
               <label className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest px-1">
                 <ShieldCheck className="w-4 h-4" /> Access Role
               </label>
               <select
                 className="input-field py-4 appearance-none cursor-pointer select-caret font-bold text-slate-700 dark:text-slate-300"
                 value={role}
                 onChange={(e) => setRole(e.target.value)}
                 disabled={isAdmin}
               >
                 <option value="student">Student</option>
                 <option value="moderator">Moderator</option>
                 <option value="admin">Administrator</option>
               </select>
            </div>

            <div className="space-y-3">
               <label className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest px-1">
                 <ShieldAlert className="w-4 h-4" /> Account Status
               </label>
               <div className={`flex items-center justify-between p-5 rounded-2xl border transition-colors ${isActive ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800/30' : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/30'}`}>
                  <div className="flex items-center gap-3">
                     <div className={`w-3 h-3 rounded-full animate-pulse ${isActive ? 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.5)]' : 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]'}`}></div>
                     <span className={`font-bold text-sm uppercase tracking-widest ${isActive ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                       {isActive ? 'Account Active' : 'Account Banned'}
                     </span>
                  </div>
                  <button
                    disabled={isAdmin}
                    onClick={() => setIsActive(!isActive)}
                    className={`py-2 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-md ${isActive ? 'bg-red-500 text-white hover:bg-red-600 hover:shadow-red-500/20' : 'bg-green-500 text-white hover:bg-green-600 hover:shadow-green-500/20'}`}
                  >
                    {isActive ? <span className="flex items-center gap-1"><Ban className="w-3 h-3"/> Ban</span> : <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3"/> Restore</span>}
                  </button>
               </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex gap-4">
           <button onClick={onClose} className="btn-secondary flex-1 py-4">Discard</button>
           <button 
             onClick={handleSave} 
             disabled={saving || isAdmin} 
             className="btn-primary flex-1 py-4 shadow-xl shadow-primary-500/20"
           >
             {saving ? 'Syncing...' : 'Save Changes'}
           </button>
        </div>
      </motion.div>
    </div>
  );
};

/* ────────────────────── Admin Page ────────────────────── */
const Admin = () => {
  const navigate = useNavigate();
  const { user, token, users, updateUser, refreshUsers } = useAuth();
  const { materials, deleteMaterial } = useMaterials();
  const { courses } = useCourses();
  
  const [activeTab, setActiveTab] = useState('overview'); // overview, materials, users
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');
  const [managingUser, setManagingUser] = useState(null);

  // Automatically kick non-admins
  if (user && user.role !== 'admin') {
    navigate('/');
    return null;
  }

  // Fetch true backend stats with React Query
  const { data: dashboardData, isLoading: dashboardLoading, refetch: refetchStats } = useQuery({
    queryKey: ['adminDashboard', token],
    queryFn: fetchDashboardStats,
    enabled: !!token,
    staleTime: 5000,
  });

  const apiStats = dashboardData?.stats || { totalUsers: 0, totalMaterials: 0, totalDownloads: 0, totalExams: 0 };
  const topContributors = dashboardData?.topContributors || [];

  const filteredMaterials = useMemo(() => {
    let list = [...materials];
    if (typeFilter) list = list.filter((m) => m.material_type === typeFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((m) => (m.title||'').toLowerCase().includes(q));
    }
    return list;
  }, [materials, typeFilter, search]);

  const filteredUsers = useMemo(() => {
    if (!search) return users;
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        (u.name || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q)
    );
  }, [users, search]);

  const format = (n) => (typeof n === 'number' ? n.toLocaleString() : n);

  const handleSync = async () => {
    await refreshUsers();
    await refetchStats();
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

   const handleExport = () => {
    try {
      const headers = ['ID', 'Title', 'Type', 'Downloads', 'Course', 'Rating'];
      const rows = materials.map(m => [
        m.id,
        `"${m.title.replace(/"/g, '""')}"`,
        m.material_type,
        m.downloads || 0,
        m.course_name || 'N/A',
        m.rating || 0
      ]);
      
      const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `studyhive_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      alert('✅ Report exported successfully');
    } catch (err) {
      alert('❌ Export failed');
    }
  };

  return (
    <div className="min-h-screen pb-20 pt-10 px-4 md:px-8 relative overflow-hidden bg-slate-50 dark:bg-[#030712]">
      {/* Background Ambience */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-primary-500/10 rounded-full blur-[150px] pointer-events-none -z-10 animate-blob"></div>
      <div className="absolute bottom-[20%] right-[-5%] w-[30%] h-[30%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none -z-10 animate-blob" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-accent-500/10 rounded-full blur-[150px] pointer-events-none -z-10 animate-blob" style={{ animationDelay: '4s' }}></div>

      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-end gap-6"
        >
           <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-primary-500/10 to-indigo-500/10 border border-primary-500/20 text-primary-600 dark:text-primary-400 text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-primary-500/5">
                 <ShieldCheck className="w-4 h-4 animate-pulse" /> System Administrator
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 dark:text-white">
                 Control <span className="gradient-text italic">Panel.</span>
              </h1>
           </div>
           <div className="flex gap-4">
              <button 
                onClick={handleExport}
                className="btn-secondary py-4 px-6 text-sm font-black uppercase tracking-widest shadow-xl hidden md:flex items-center gap-2"
              >
                <Download className="w-4 h-4"/> Export Report
              </button>
              <button onClick={handleSync} className="btn-primary py-4 px-8 text-sm font-black uppercase tracking-widest shadow-xl flex items-center gap-2">
                <RefreshCcw className="w-4 h-4"/> Sync Data
              </button>
           </div>
        </motion.header>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <StatCard delay={0.1} label="Live Users" value={dashboardLoading ? '...' : format(apiStats.totalUsers)} icon={<Users className="w-7 h-7"/>} color="from-primary-500 to-indigo-500" />
           <StatCard delay={0.2} label="Repository" value={dashboardLoading ? '...' : format(apiStats.totalMaterials)} icon={<FolderLock className="w-7 h-7"/>} color="from-fuchsia-500 to-pink-500" />
           <StatCard delay={0.3} label="Exam Banks" value={dashboardLoading ? '...' : format(apiStats.totalExams)} icon={<FileText className="w-7 h-7"/>} color="from-orange-500 to-amber-500" />
           <StatCard delay={0.4} label="Impact Traffic" value={dashboardLoading ? '...' : format(apiStats.totalDownloads)} icon={<DownloadCloud className="w-7 h-7"/>} color="from-emerald-500 to-teal-500" />
        </section>

        {/* Content Tabs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card shadow-2xl overflow-hidden min-h-[600px] flex flex-col border-white/20">
           <div className="flex bg-slate-100/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
              <TabButton active={activeTab === 'overview'} onClick={() => {setActiveTab('overview'); setSearch('');}} icon={LayoutDashboard}>Analytics Hub</TabButton>
              <TabButton active={activeTab === 'materials'} onClick={() => {setActiveTab('materials'); setSearch('');}} icon={FolderLock}>Content Repo</TabButton>
              <TabButton active={activeTab === 'users'} onClick={() => {setActiveTab('users'); setSearch('');}} icon={Users}>User Directory</TabButton>
           </div>

           <div className="p-6 md:p-10 flex-1 flex flex-col space-y-8 bg-white/30 dark:bg-[#060B19]/30">
              
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
                  
                  {/* Left Col: Server Activity Chart */}
                  <div className="lg:col-span-2 space-y-6 flex flex-col">
                     <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                       <Activity className="w-5 h-5 text-primary-500" /> Global Activity Monitor
                     </h3>
                     <div className="glass-card flex-1 p-8 border-dashed flex items-end justify-between gap-2 overflow-hidden relative group">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]"></div>
                        {[40, 70, 45, 90, 65, 85, 30, 55, 80, 100, 60, 40, 75, 50].map((h, i) => (
                          <motion.div 
                            key={i}
                            initial={{ height: 0 }}
                            animate={{ height: `${h}%` }}
                            transition={{ delay: i * 0.05, duration: 1, type: "spring" }}
                            className="w-full bg-gradient-to-t from-primary-600 to-indigo-400 rounded-t-lg opacity-80 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-2 relative overflow-hidden"
                          >
                             <div className="absolute top-0 left-0 w-full h-full bg-white/20"></div>
                          </motion.div>
                        ))}
                     </div>
                  </div>

                  {/* Right Col: Top Contributors */}
                  <div className="space-y-6 flex flex-col">
                     <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                       <Award className="w-5 h-5 text-accent-500" /> Top Scholars
                     </h3>
                     <div className="glass-card flex-1 p-6 space-y-4 shadow-xl shadow-accent-500/5">
                        {dashboardLoading ? (
                           [1,2,3,4,5].map(i => <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse"></div>)
                        ) : topContributors.length > 0 ? (
                           <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-3">
                              {topContributors.map((c, i) => (
                                <motion.div key={i} variants={itemVariants} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black shadow-md ${i===0?'bg-amber-100 text-amber-600 dark:bg-amber-900/30' : i===1?'bg-slate-200 text-slate-600 dark:bg-slate-700' : 'bg-orange-100 text-orange-600 dark:bg-orange-900/30'}`}>
                                    #{i+1}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{c.name || 'Anonymous'}</p>
                                    <p className="text-xs text-slate-500 truncate">{c.email || 'Hidden Email'}</p>
                                  </div>
                                  <div className="text-primary-500 font-black text-sm">{c.uploads} Files</div>
                                </motion.div>
                              ))}
                           </motion.div>
                        ) : (
                           <div className="h-full flex flex-col items-center justify-center text-slate-400">
                             <Award className="w-10 h-10 mb-2 opacity-50" />
                             <p className="text-xs font-bold uppercase tracking-widest">No data available</p>
                           </div>
                        )}
                     </div>
                  </div>
                </div>
              )}

              {/* Data Table Sections */}
              {(activeTab === 'materials' || activeTab === 'users') && (
                <>
                  <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                     <div className="relative w-full md:w-96 group">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors bg-white dark:bg-slate-900 z-10 px-1">🔍</span>
                        <input 
                          type="text" 
                          placeholder={activeTab === 'materials' ? "Search repository..." : "Lookup user identity..."}
                          className="w-full pl-14 pr-5 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:border-primary-500 focus:ring-4 ring-primary-500/10 transition-all font-medium text-slate-800 dark:text-slate-200"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                        />
                     </div>
                     
                     {activeTab === 'materials' && (
                       <select className="input-field py-4 min-w-[200px]" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                          <option value="">All Architectures</option>
                          <option value="material">Study Materials</option>
                          <option value="exam">Exam Banks</option>
                          <option value="note">Lecture Notes</option>
                       </select>
                     )}
                  </div>

                  <div className="flex-1 overflow-x-auto rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-inner">
                     <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead className="bg-slate-50 dark:bg-slate-900/80 sticky top-0 z-10 shadow-sm">
                           <tr className="text-slate-500 font-black uppercase tracking-[0.15em] text-[10px]">
                              {activeTab === 'materials' ? (
                                <>
                                  <th className="px-8 py-5">Title & Taxonomy</th>
                                  <th className="px-8 py-5">Course Allocation</th>
                                  <th className="px-8 py-5">Traffic Impact</th>
                                  <th className="px-8 py-5 text-right">Actions</th>
                                </>
                              ) : (
                                <>
                                  <th className="px-8 py-5">User Persona</th>
                                  <th className="px-8 py-5">Academic Record</th>
                                  <th className="px-8 py-5">Security Status</th>
                                  <th className="px-8 py-5 text-right">Actions</th>
                                </>
                              )}
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                           {activeTab === 'materials' ? (
                             <AnimatePresence>
                             {filteredMaterials.map(m => (
                               <motion.tr 
                                 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                 key={m.id} className="group hover:bg-slate-50/80 dark:hover:bg-slate-900/30 transition-colors"
                               >
                                  <td className="px-8 py-5">
                                     <div className="font-bold text-slate-900 dark:text-white truncate max-w-[250px]">{m.title}</div>
                                     <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-1">
                                        <div className={`px-2 py-0.5 rounded-md text-[9px] uppercase font-black ${m.material_type==='exam'?'bg-red-100 text-red-600':m.material_type==='note'?'bg-amber-100 text-amber-600':'bg-primary-100 text-primary-600'}`}>
                                          {m.material_type}
                                        </div>
                                        {m.file_type || 'PDF'}
                                     </div>
                                  </td>
                                  <td className="px-8 py-5">
                                     <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                        {courses.find(c => c.id === m.course_id)?.course_code || 'N/A'}
                                     </div>
                                  </td>
                                  <td className="px-8 py-5">
                                     <div className="flex items-center gap-2">
                                       <Activity className="w-4 h-4 text-emerald-500" />
                                       <span className="text-sm font-black text-slate-900 dark:text-white">{format(m.downloads || 0)}</span>
                                     </div>
                                  </td>
                                  <td className="px-8 py-5 text-right flex justify-end gap-2">
                                     <button onClick={() => navigate(`/materials/${m.id}`)} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-xl transition-all shadow-sm">
                                       <Eye className="w-4 h-4" />
                                     </button>
                                     <button onClick={() => deleteMaterial(m.id)} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all shadow-sm">
                                       <Trash2 className="w-4 h-4" />
                                     </button>
                                  </td>
                               </motion.tr>
                             ))}
                             </AnimatePresence>
                           ) : (
                             <AnimatePresence>
                             {filteredUsers.map(u => (
                               <motion.tr 
                                 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                 key={u.id} className="group hover:bg-slate-50/80 dark:hover:bg-slate-900/30 transition-colors"
                               >
                                  <td className="px-8 py-5 flex items-center gap-4">
                                     <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center font-black text-slate-500 shadow-sm border border-slate-300 dark:border-slate-600">
                                        {u.name?.charAt(0).toUpperCase()}
                                     </div>
                                     <div>
                                        <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                          {u.name}
                                          {u.role === 'admin' && <ShieldCheck className="w-3 h-3 text-primary-500"/>}
                                        </div>
                                        <div className="text-xs text-slate-500">{u.email}</div>
                                     </div>
                                  </td>
                                  <td className="px-8 py-5">
                                     <div className="text-sm font-bold text-slate-700 dark:text-slate-300">{u.dept || 'Engineering'}</div>
                                     <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-0.5">Year {u.year || 1}</div>
                                  </td>
                                  <td className="px-8 py-5">
                                     <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-[0.1em] shadow-sm ${u.isActive !== false ? 'bg-green-100/50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:border-green-800/50 dark:text-green-400' : 'bg-red-100/50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:border-red-800/50 dark:text-red-400'}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${u.isActive !== false ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                        {u.isActive !== false ? 'Active Status' : 'System Ban'}
                                     </span>
                                  </td>
                                  <td className="px-8 py-5 text-right">
                                     <button onClick={() => setManagingUser(u)} className="py-2.5 px-6 bg-slate-100 dark:bg-slate-800 hover:bg-primary-500 hover:text-white hover:shadow-lg hover:shadow-primary-500/20 text-xs font-black uppercase tracking-widest rounded-xl transition-all border border-slate-200 dark:border-slate-700 hover:border-transparent">
                                        Override
                                     </button>
                                  </td>
                               </motion.tr>
                             ))}
                             </AnimatePresence>
                           )}
                        </tbody>
                     </table>
                     
                     {(activeTab === 'materials' ? filteredMaterials : filteredUsers).length === 0 && (
                       <div className="p-24 text-center space-y-5">
                          <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800/50 mx-auto flex items-center justify-center border-4 border-white dark:border-slate-900 shadow-inner">
                            <Activity className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                          </div>
                          <div>
                            <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-widest">Null Query</h4>
                            <p className="text-sm font-medium text-slate-500 max-w-sm mx-auto mt-2">Adjust your parameters or filters. The database returned zero matches for this specific request.</p>
                          </div>
                          <button onClick={() => {setSearch(''); setTypeFilter('');}} className="btn-secondary py-3 px-6 text-xs uppercase font-black">Reset Parameters</button>
                       </div>
                     )}
                  </div>
                </>
              )}
           </div>
        </motion.div>
      </div>

      <AnimatePresence>
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
      </AnimatePresence>
    </div>
  );
};

export default Admin;
