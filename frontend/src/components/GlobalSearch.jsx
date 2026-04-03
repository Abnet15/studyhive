import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, BookOpen, FileText, ChevronRight, Hash, Sparkles } from 'lucide-react';
import { useMaterials } from '../context/MaterialContext';
import { useCourses } from '../context/CourseContext';

const GlobalSearch = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { materials = [] } = useMaterials();
  const { courses = [] } = useCourses();
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    const handleKeyDown = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onClose(); // Toggle logic handled by parent
      }
      if (e.key === 'Escape') onClose();
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const navigationResults = [
    { name: 'Honey AI Hub', path: '/ai-assistant', type: 'Tool', icon: <Sparkles className="w-5 h-5"/>, desc: 'Chat with Honey, Summarize, Lab' },
    { name: 'Practice Arena', path: '/ai-assistant', type: 'Game', icon: <Hash className="w-5 h-5"/>, desc: 'Interactive AI Quiz sessions' },
    { name: 'Course Catalog', path: '/courses', type: 'Page', icon: <BookOpen className="w-5 h-5"/>, desc: 'Explore all departments' },
    { name: 'User Profile', path: '/profile', type: 'Page', icon: <Hash className="w-5 h-5"/>, desc: 'Your achievements and files' },
    { name: 'Masterclass Hub', path: '/masterclass', type: 'Video', icon: <FileText className="w-5 h-5"/>, desc: 'Watch expert study guides' },
  ].filter(n => n.name.toLowerCase().includes(query.toLowerCase()));

  const filteredMaterials = query.trim() === '' ? [] : materials.filter(m => 
    m.title.toLowerCase().includes(query.toLowerCase()) || 
    m.course_name?.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 4);

  const filteredCourses = query.trim() === '' ? [] : courses.filter(c => 
    c.course_name.toLowerCase().includes(query.toLowerCase()) || 
    c.course_code.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 3);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-slate-800 overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4">
             <Search className="w-6 h-6 text-primary-500" />
             <input 
               ref={inputRef}
               type="text" 
               placeholder="Search materials, courses, or AI summaries..."
               className="flex-1 bg-transparent border-none focus:ring-0 text-xl font-bold text-slate-900 dark:text-white placeholder:text-slate-400"
               value={query}
               onChange={(e) => setQuery(e.target.value)}
             />
             <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-black text-slate-400 border border-slate-200 dark:border-slate-700">ESC</span>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                   <X className="w-5 h-5 text-slate-400" />
                </button>
             </div>
          </div>

          {/* Results Area */}
          <div className="max-h-[60vh] overflow-y-auto p-4 custom-scrollbar">
             {query.trim() === '' ? (
                <div className="space-y-6">
                   <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Suggested Actions</div>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2">
                       {navigationResults.slice(0, 4).map((n, i) => (
                          <button 
                             key={i}
                             onClick={() => { navigate(n.path); onClose(); }}
                             className="flex items-center gap-4 p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/40 hover:bg-primary-50 dark:hover:bg-primary-900/20 text-left transition-all border border-transparent hover:border-primary-100"
                          >
                             <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-primary-500 shadow-sm">
                                {n.icon}
                             </div>
                             <div className="flex-1 min-w-0">
                                <div className="font-bold text-sm text-slate-900 dark:text-white">{n.name}</div>
                                <div className="text-[10px] text-slate-400 font-bold uppercase">{n.type}</div>
                             </div>
                          </button>
                       ))}
                   </div>
                   <div className="py-10 text-center space-y-4">
                      <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto text-xl opacity-50">🔍</div>
                      <div className="text-slate-400 font-bold text-sm">Search for anything in the Hive...</div>
                   </div>
                </div>
             ) : (
                <div className="space-y-8 p-2">
                   {/* Navigation Section */}
                   {navigationResults.length > 0 && (
                      <div className="space-y-3">
                         <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Instant Navigation</div>
                         <div className="grid grid-cols-1 gap-2">
                            {navigationResults.map((n, i) => (
                               <button 
                                 key={i}
                                 onClick={() => { navigate(n.path); onClose(); }}
                                 className="flex items-center gap-4 p-4 rounded-3xl hover:bg-slate-100 dark:hover:bg-slate-800/60 text-left transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700 group h-auto"
                               >
                                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover:bg-primary-500 group-hover:text-white transition-all shadow-sm">
                                     {n.icon}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                     <div className="font-bold text-slate-900 dark:text-white truncate">{n.name}</div>
                                     <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{n.type} • {n.desc}</div>
                                  </div>
                                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                               </button>
                            ))}
                         </div>
                      </div>
                   )}

                   {/* Courses Section */}
                   {filteredCourses.length > 0 && (
                      <div className="space-y-3">
                         <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Study Subjects</div>
                         <div className="grid grid-cols-1 gap-2">
                            {filteredCourses.map(course => (
                               <button 
                                 key={course.id}
                                 onClick={() => { navigate(`/courses?course=${course.id}`); onClose(); }}
                                 className="flex items-center gap-4 p-4 rounded-3xl hover:bg-primary-50 dark:hover:bg-primary-900/20 text-left transition-all border border-transparent hover:border-primary-100 group"
                               >
                                  <div className="w-12 h-12 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600">
                                     <Hash className="w-6 h-6" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                     <div className="font-bold text-slate-900 dark:text-white truncate">{course.course_name}</div>
                                     <div className="text-xs text-slate-500 font-medium">{course.course_code}</div>
                                  </div>
                                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                               </button>
                            ))}
                         </div>
                      </div>
                   )}

                   {/* Materials Section */}
                   {filteredMaterials.length > 0 && (
                      <div className="space-y-3">
                         <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Research Materials</div>
                         <div className="grid grid-cols-1 gap-2">
                            {filteredMaterials.map(material => (
                               <button 
                                 key={material.id}
                                 onClick={() => { navigate(`/courses?course=${material.course_id}`); onClose(); }}
                                 className="flex items-center gap-4 p-4 rounded-3xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-left transition-all border border-transparent hover:border-indigo-100 group"
                               >
                                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                                     <FileText className="w-6 h-6" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                     <div className="font-bold text-slate-900 dark:text-white truncate">{material.title}</div>
                                     <div className="text-xs text-slate-500 font-medium">{material.course_name}</div>
                                  </div>
                                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                               </button>
                            ))}
                         </div>
                      </div>
                   )}

                   {navigationResults.length === 0 && filteredCourses.length === 0 && filteredMaterials.length === 0 && (
                      <div className="py-12 text-center text-slate-400 font-bold">No results for "{query}"</div>
                   )}
                </div>
             )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center px-8">
             <div className="flex gap-4">
                <div className="flex items-center gap-1.5 opacity-40">
                   <ChevronRight className="w-3 h-3 rotate-90" />
                   <span className="text-[10px] font-black uppercase tracking-widest">Navigate</span>
                </div>
                <div className="flex items-center gap-1.5 opacity-40">
                   <ChevronRight className="w-3 h-3" />
                   <span className="text-[10px] font-black uppercase tracking-widest">Select</span>
                </div>
             </div>
             <div className="text-[10px] font-black text-primary-500/50 uppercase tracking-widest">Smart Hive Search v1.2</div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default GlobalSearch;
