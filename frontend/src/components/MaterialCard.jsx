import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import RatingStars from './RatingStars';
import { useAuth } from '../context/AuthContext';
import { useMaterials } from '../context/MaterialContext';
import { useToast } from './Toast';

const MaterialCard = ({ material }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { recordDownload } = useMaterials();
  const toast = useToast();
  const uploaderName =
    material.uploader_name ||
    material.uploaderName ||
    'Unknown';
  const courseCode = material.course_code || material.courseCode || 'N/A';
  const courseName = material.course_name || material.courseName || '';

  const handleDownload = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    const fileUrl = material.file_url || material.fileUrl;
    const hasValidUrl = fileUrl && fileUrl !== '#' && fileUrl !== '' &&
      !fileUrl.includes('undefined') && !fileUrl.includes('null');

    if (!hasValidUrl) {
      toast.warn('File download link is not available yet.');
      return;
    }

    recordDownload(material.id);

    try {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      if (material.original_file_name) {
        link.download = material.original_file_name;
      }
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      window.open(fileUrl, '_blank', 'noopener');
    }
  };

  return (
    <div className="glass-card group p-6 hover:border-primary-500/50 transition-all duration-500 relative overflow-hidden flex flex-col h-full">
      {/* Decorative gradient blob */}
      <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary-500/10 rounded-full blur-2xl group-hover:bg-primary-500/20 transition-colors"></div>
      
      <div className="flex-1 space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
             <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-500">{courseCode}</div>
             <Link to={`/materials/${material.id}`}>
               <h3 className="text-xl font-bold text-slate-800 dark:text-white group-hover:gradient-text transition-all duration-300 line-clamp-1">
                 {material.title}
               </h3>
             </Link>
          </div>
          <span className={`text-xl p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700`}>
             {material.material_type === 'exam' ? '📝' : '📚'}
          </span>
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed h-10">
          {material.desc || material.description || 'No description provided.'}
        </p>

        <div className="flex items-center gap-2 pt-2">
           <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold">
              {uploaderName.charAt(0)}
           </div>
           <span className="text-xs font-semibold text-slate-400">by {uploaderName}</span>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
         <div className="flex flex-col gap-1">
            <RatingStars rating={material.rating || 4.5} size="xs" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{material.downloads || 0} Downloads</span>
         </div>
         <button
           onClick={handleDownload}
           className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-primary-600 hover:text-white rounded-xl transition-all duration-300"
         >
           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
         </button>
      </div>
    </div>
  );
};

export default MaterialCard;
