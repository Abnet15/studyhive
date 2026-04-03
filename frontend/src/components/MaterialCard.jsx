import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import RatingStars from './RatingStars';
import { useAuth } from '../context/AuthContext';
import { useMaterials } from '../context/MaterialContext';
import { useToast } from './Toast';
import { DownloadCloud, ExternalLink, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MaterialCard = ({ material }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { recordDownload } = useMaterials();
  const toast = useToast();
  const [isHovered, setIsHovered] = React.useState(false);
  
  const uploaderName = material.uploader_name || material.uploaderName || 'Anonymous';
  const courseCode = material.course_code || material.courseCode || 'N/A';
  const hasAI = !!material.aiSummary;

  const handleDownload = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    const fileUrl = material.file_url || material.fileUrl;
    if (!fileUrl) {
      toast.warn('File download link is not available yet.');
      return;
    }

    try {
      await recordDownload(material.id);
      window.open(fileUrl, '_blank', 'noopener');
    } catch (error) {
      window.open(fileUrl, '_blank', 'noopener');
    }
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      transition={{ type: "spring", stiffness: 300 }}
      className="glass-card group p-6 hover:shadow-[0_20px_50px_-10px_rgba(14,165,233,0.2)] hover:border-primary-500/30 transition-all duration-300 relative overflow-hidden flex flex-col h-full bg-white dark:bg-slate-900"
    >
      <AnimatePresence>
        {isHovered && hasAI && (
          <motion.div 
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            className="absolute inset-0 z-20 bg-slate-900/80 p-8 flex flex-col justify-center items-center text-center space-y-4"
          >
             <Sparkles className="w-8 h-8 text-primary-400 animate-pulse" />
             <div className="text-[10px] font-black text-primary-500 uppercase tracking-[0.3em]">AI Deep Summary</div>
             <p className="text-xs text-slate-200 font-medium leading-relaxed italic line-clamp-6">
                "{material.aiSummary}"
             </p>
             <Link to={`/materials/${material.id}`} className="mt-4 px-6 py-2 bg-primary-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-110 active:scale-95 transition-all shadow-xl shadow-primary-500/40">
                Read Full Analysis
             </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative gradient blob */}
      <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary-500/5 rounded-full blur-2xl group-hover:bg-primary-500/15 transition-colors duration-500"></div>
      
      <div className="flex-1 space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
                <div className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase tracking-[0.2em] text-primary-500 rounded-md">
                   {courseCode}
                </div>
                {hasAI && (
                   <span className="flex items-center gap-1 text-[10px] font-bold text-accent-500 tracking-wider uppercase bg-accent-50 dark:bg-accent-950/40 px-2 py-1 rounded-md border border-accent-500/20">
                     <Sparkles className="w-3 h-3"/> AI Enhanced
                   </span>
                )}
            </div>
            <Link to={`/materials/${material.id}`} className="block mt-2">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white group-hover:text-primary-500 transition-all duration-300 line-clamp-1">
                {material.title}
              </h3>
            </Link>
          </div>
          <span className="text-xl p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 shadow-sm">
             {material.material_type === 'exam' ? '📝' : '📚'}
          </span>
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed h-10 font-medium">
          {material.desc || material.description || 'No description provided.'}
        </p>

        <div className="flex items-center gap-2 pt-2">
           <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-primary-500 to-indigo-500 flex items-center justify-center text-[10px] font-bold text-white shadow-md">
              {uploaderName.charAt(0)}
           </div>
           <span className="text-xs font-bold text-slate-400 dark:text-slate-500">by {uploaderName}</span>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between">
         <div className="flex flex-col gap-1.5">
            <RatingStars rating={material.rating || 0} size="xs" />
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{material.downloads || 0} Downloads</span>
         </div>
         <div className="flex gap-2">
            <Link to={`/materials/${material.id}`} className="p-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-colors border border-transparent hover:border-slate-300 dark:hover:border-slate-700">
               <ExternalLink className="w-5 h-5"/>
            </Link>
            <button
              onClick={handleDownload}
              className="p-3 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 hover:bg-primary-500 hover:text-white rounded-xl transition-all duration-300 shadow-sm border border-transparent hover:border-primary-400/50"
            >
              <DownloadCloud className="w-5 h-5"/>
            </button>
         </div>
      </div>
    </motion.div>
  );
};

export default MaterialCard;
