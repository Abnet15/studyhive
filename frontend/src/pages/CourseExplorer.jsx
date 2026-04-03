import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import MaterialCard from '../components/MaterialCard';
import { useMaterials } from '../context/MaterialContext';
import { useCourses } from '../context/CourseContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, BookOpen, Layers, XCircle, FileSearch } from 'lucide-react';

const CourseExplorer = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCourse, setSelectedCourse] = useState(searchParams.get('course') || '');
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || '');
  
  const { materials, materialsLoading } = useMaterials();
  const { courses } = useCourses();

  const filteredMaterials = useMemo(() => {
    let filtered = [...(materials || [])];

    if (selectedCourse) {
      const targetId = parseInt(selectedCourse, 10);
      filtered = filtered.filter(
        (m) => String(m.course_id) === String(targetId) || String(m.courseId) === String(targetId)
      );
    }

    if (selectedType) {
      filtered = filtered.filter(m => m.material_type === selectedType);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((m) => {
        const courseId = m.course_id || m.courseId;
        const course = (courses || []).find((c) => String(c.id) === String(courseId));
        return (
          m.title.toLowerCase().includes(query) ||
          (m.desc || m.description || '').toLowerCase().includes(query) ||
          course?.course_code?.toLowerCase().includes(query) ||
          course?.course_name?.toLowerCase().includes(query)
        );
      });
    }

    return filtered;
  }, [materials, searchQuery, selectedCourse, selectedType, courses]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setSearchParams({ search: value, course: selectedCourse, type: selectedType });
  };

  const handleCourseChange = (e) => {
    const value = e.target.value;
    setSelectedCourse(value);
    setSearchParams({ search: searchQuery, course: value, type: selectedType });
  };

  const handleTypeChange = (e) => {
    const value = e.target.value;
    setSelectedType(value);
    setSearchParams({ search: searchQuery, course: selectedCourse, type: value });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCourse('');
    setSelectedType('');
    setSearchParams({});
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen px-4 py-12 bg-slate-50 dark:bg-[#030712] relative">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-[150px] pointer-events-none -z-10 animate-blob"></div>

      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-2xl mx-auto space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
             Knowledge <span className="gradient-text italic">Explorer</span> 🔍
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
             Search through thousands of crowd-sourced study materials, exams, and AI-generated summaries.
          </p>
        </motion.div>

        {/* Filters Box */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="glass-card p-6 md:p-8 backdrop-blur-2xl border-white/50 dark:border-slate-800/50 shadow-2xl shadow-primary-500/5">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
             
             {/* Search Bar */}
             <div className="md:col-span-6 relative">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-3">
                   <Search className="w-4 h-4"/> Global Search
                </label>
                <div className="relative">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"/>
                   <input
                     type="text"
                     value={searchQuery}
                     onChange={handleSearchChange}
                     placeholder="Search by title, description, or keyword..."
                     className="w-full pl-12 pr-4 py-4 bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/50 rounded-2xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all dark:text-white placeholder-slate-400 font-medium"
                   />
                </div>
             </div>

             {/* Course Dropdown */}
             <div className="md:col-span-3">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-3">
                   <BookOpen className="w-4 h-4"/> Course
                </label>
                <select
                  value={selectedCourse}
                  onChange={handleCourseChange}
                  className="w-full px-4 py-4 bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/50 rounded-2xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all dark:text-white font-medium appearance-none select-caret"
                >
                  <option value="">All Courses</option>
                  {(courses || []).map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.course_code} - {course.course_name}
                    </option>
                  ))}
                </select>
             </div>

             {/* Type Dropdown */}
             <div className="md:col-span-3">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-3">
                   <Layers className="w-4 h-4"/> Material Type
                </label>
                <select
                  value={selectedType}
                  onChange={handleTypeChange}
                  className="w-full px-4 py-4 bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/50 rounded-2xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all dark:text-white font-medium appearance-none select-caret"
                >
                  <option value="">Everything</option>
                  <option value="exam">Past Exams</option>
                  <option value="material">Study Materials</option>
                </select>
             </div>
          </div>

          {/* Active Filters Summary */}
          <AnimatePresence>
            {(searchQuery || selectedCourse || selectedType) && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800/50 flex flex-wrap items-center justify-between gap-4">
                 <div className="flex items-center gap-2 text-sm font-bold bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 px-4 py-2 rounded-lg">
                    <Filter className="w-4 h-4"/>
                    {filteredMaterials.length} Results Found
                 </div>
                 <button
                   onClick={clearFilters}
                   className="flex items-center gap-2 text-sm font-bold text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 px-4 py-2 rounded-lg transition-colors"
                 >
                   <XCircle className="w-4 h-4"/> Clear All Filters
                 </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Results Grid */}
        {materialsLoading ? (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-64 rounded-[2rem] bg-slate-200 dark:bg-slate-800 animate-pulse"></div>)}
           </div>
        ) : filteredMaterials.length > 0 ? (
          <motion.div 
            variants={containerVariants} initial="hidden" animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredMaterials.map(material => (
              <motion.div variants={itemVariants} key={material.id}>
                 <MaterialCard material={material} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card text-center py-24 flex flex-col items-center justify-center border-dashed border-2 border-slate-300 dark:border-slate-700">
            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-inner">
               <FileSearch className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
              No materials match your criteria
            </h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md">
              We couldn't find anything matching your search. Try broadening your terms or clear the filters.
            </p>
            <button onClick={clearFilters} className="mt-8 btn-secondary">
               Reset Explorer
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CourseExplorer;
