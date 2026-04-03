import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfettiAnimation from './ConfettiAnimation';
import { useAuth } from '../context/AuthContext';
import { useMaterials } from '../context/MaterialContext';
import { useCourses } from '../context/CourseContext';
import { useToast } from './Toast';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileText, X, BrainCircuit, BookOpen, Layers, AlignLeft, Sparkles } from 'lucide-react';

const UploadForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addMaterial } = useMaterials();
  const { courses } = useCourses();
  const toast = useToast();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course_id: '',
    material_type: 'material',
    file: null,
  });
  const [showConfetti, setShowConfetti] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadPhase, setUploadPhase] = useState(''); // '', 'uploading', 'ai-processing'

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'file') {
      setFormData({ ...formData, file: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setFormData({ ...formData, file });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const removeFile = () => {
    setFormData({ ...formData, file: null });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.file) {
      setErrorMessage('Please select a file to upload');
      return;
    }

    setIsSubmitting(true);
    setUploadPhase('uploading');

    try {
      const payload = new FormData();
      payload.append('title', formData.title);
      payload.append('description', formData.description);
      payload.append('courseId', formData.course_id);
      payload.append('materialType', formData.material_type);
      payload.append('file', formData.file);

      // Simulate phase transition
      setTimeout(() => setUploadPhase('ai-processing'), 2000);

      await addMaterial(payload);
      setShowConfetti(true);
      toast.success('🎉 Material uploaded successfully! Honey AI has analyzed it.');
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      setFormData({ title: '', description: '', course_id: '', material_type: 'material', file: null });
      setShowConfetti(false);
      setUploadPhase('');
      navigate('/dashboard');
    } catch (error) {
      console.error('Upload error:', error);
      setErrorMessage(error.message || 'Upload failed. Please try again.');
      setIsSubmitting(false);
      setUploadPhase('');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <ConfettiAnimation trigger={showConfetti} />

      {/* Upload Progress Overlay */}
      <AnimatePresence>
        {isSubmitting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xl flex items-center justify-center"
          >
            <motion.div 
              initial={{ scale: 0.9 }} 
              animate={{ scale: 1 }}
              className="text-center space-y-6 p-12"
            >
              <div className="relative mx-auto w-24 h-24">
                <div className="absolute inset-0 rounded-full border-4 border-primary-500/20"></div>
                <div className="absolute inset-0 rounded-full border-4 border-primary-500 border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  {uploadPhase === 'ai-processing' ? (
                    <BrainCircuit className="w-10 h-10 text-primary-400 animate-pulse" />
                  ) : (
                    <UploadCloud className="w-10 h-10 text-primary-400" />
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {uploadPhase === 'ai-processing' ? 'Honey AI is Analyzing...' : 'Uploading to Cloud...'}
                </h3>
                <p className="text-slate-400 font-medium text-sm">
                  {uploadPhase === 'ai-processing' 
                    ? 'Generating smart summary, key terms, and practice quiz' 
                    : 'Securely uploading your file to Cloudinary'}
                </p>
              </div>
              <div className="flex items-center justify-center gap-2">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    className="w-2.5 h-2.5 rounded-full bg-primary-500"
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="glass-card p-8 md:p-10 space-y-6 shadow-2xl shadow-primary-500/5">
        
        {errorMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-100/50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-red-600 dark:text-red-400 text-sm font-bold animate-shake"
          >
            ⚠️ {errorMessage}
          </motion.div>
        )}

        {/* Title */}
        <div>
          <label htmlFor="title" className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
            <FileText className="w-4 h-4 text-slate-400" /> Material Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none placeholder:text-slate-400"
            placeholder="e.g., CS301 Midterm Exam 2023"
          />
        </div>

        {/* Type & Course Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="material_type" className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              <Layers className="w-4 h-4 text-slate-400" /> Type
            </label>
            <select
              id="material_type"
              name="material_type"
              value={formData.material_type}
              onChange={handleChange}
              required
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none appearance-none cursor-pointer select-caret"
            >
              <option value="material">📚 Study Material</option>
              <option value="exam">📝 Past Exam</option>
              <option value="note">📒 Lecture Note</option>
              <option value="project">💼 Project</option>
            </select>
          </div>
          <div>
            <label htmlFor="course_id" className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              <BookOpen className="w-4 h-4 text-slate-400" /> Course
            </label>
            <select
              id="course_id"
              name="course_id"
              value={formData.course_id}
              onChange={handleChange}
              required
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none appearance-none cursor-pointer select-caret"
            >
              <option value="">Select a course</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.course_code} - {course.course_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
            <AlignLeft className="w-4 h-4 text-slate-400" /> Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="3"
            className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none placeholder:text-slate-400 resize-none"
            placeholder="Describe the material, what it contains..."
          />
        </div>

        {/* Drag & Drop File Zone */}
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
            <UploadCloud className="w-4 h-4 text-slate-400" /> File Upload
          </label>
          
          <AnimatePresence mode="wait">
            {!formData.file ? (
              <motion.div
                key="dropzone"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-10 transition-all duration-300 text-center group ${
                  isDragging 
                    ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-900/20 scale-[1.02]' 
                    : 'border-slate-300 dark:border-slate-700 hover:border-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800/30'
                }`}
              >
                <input
                  ref={fileInputRef}
                  id="file"
                  name="file"
                  type="file"
                  className="hidden"
                  onChange={handleChange}
                />
                <div className="space-y-4">
                  <div className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${
                    isDragging 
                      ? 'bg-primary-500 text-white shadow-xl shadow-primary-500/30 scale-110' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 group-hover:text-primary-500'
                  }`}>
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      {isDragging ? 'Drop your file here!' : 'Click to browse or drag & drop'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      PDF, DOCX, ZIP, JPG, PNG — up to 10MB
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="filepreview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-4 p-5 rounded-2xl bg-primary-50/50 dark:bg-primary-900/10 border border-primary-200 dark:border-primary-800"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shrink-0">
                  <FileText className="w-7 h-7" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{formData.file.name}</p>
                  <p className="text-xs text-slate-500 font-medium">{formatFileSize(formData.file.size)}</p>
                </div>
                <button 
                  type="button" 
                  onClick={removeFile}
                  className="p-2 rounded-xl bg-red-100 dark:bg-red-900/20 text-red-500 hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Honey AI Info Banner */}
        <div className="flex items-start gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white border border-white/10">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-primary-300" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary-300 mb-1">Honey AI Powered</p>
            <p className="text-xs text-slate-300 leading-relaxed">
              After upload, our AI automatically generates a smart summary, extracts key terms, and creates a practice quiz from your document.
            </p>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary flex-1 py-4 text-lg shadow-xl shadow-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <UploadCloud className="w-5 h-5" />
            {isSubmitting ? 'Processing...' : `Upload ${formData.material_type === 'exam' ? 'Exam' : 'Material'}`}
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="btn-secondary py-4 px-8"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadForm;
