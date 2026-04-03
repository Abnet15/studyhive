import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import RatingStars from '../components/RatingStars';
import { useAuth } from '../context/AuthContext';
import { useMaterials } from '../context/MaterialContext';
import { useCourses } from '../context/CourseContext';
import { useToast } from '../components/Toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, DownloadCloud, Share2, Sparkles, BrainCircuit, 
  FileText, Calendar, HardDrive, UserCircle, Star, BadgeCheck, Bookmark, BookmarkCheck, PlayCircle
} from 'lucide-react';
import { apiClient } from '../services/apiClient';

const MaterialDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { materials, materialsLoading, recordDownload, rateMaterial } = useMaterials();
  const { courses } = useCourses();
  const toast = useToast();
  
  const [activeTab, setActiveTab] = useState('summary'); // 'summary', 'keyterms', 'quiz'
  const [ratingHover, setRatingHover] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  const material = materials.find((m) => String(m.id) === String(id));

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  if (materialsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-slate-50 dark:bg-[#030712]">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-500 mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400 font-bold animate-pulse">Loading Honey AI Data...</p>
        </div>
      </div>
    );
  }

  if (!material) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-slate-50 dark:bg-[#030712]">
        <div className="text-center space-y-6">
          <div className="text-8xl animate-bounce">📭</div>
          <h2 className="text-4xl font-extrabold text-slate-800 dark:text-slate-200">
            Material not found
          </h2>
          <button onClick={() => navigate(-1)} className="btn-primary mt-4">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const uploaderName = material.uploader_name || material.uploaderName || 'Anonymous';
  const course = courses.find((c) => String(c.id) === String(material.course_id || material.courseId)) || null;
  const courseLabel = course ? `${course.course_code} - ${course.course_name}` : (material.course_code || 'General Course');
  const hasAI = !!material.aiSummary;

  const handleDownload = async () => {
    if (!user) {
      navigate('/login'); return;
    }
    const fileUrl = material.file_url || material.fileUrl;
    if (!fileUrl) {
      toast.warn('File download link is missing.'); return;
    }
    try {
      await recordDownload(material.id);
      window.open(fileUrl, '_blank', 'noopener');
    } catch (error) {
      window.open(fileUrl, '_blank', 'noopener');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: material.title, url: window.location.href }).catch(() => {
        navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  React.useEffect(() => {
    let mounted = true;
    const checkBookmark = async () => {
      if (!user) return;
      try {
        const data = await apiClient.get(`/materials/${material.id}`);
        if (mounted && data.material) {
          setBookmarked(data.material.bookmarked);
        }
      } catch (err) {
        console.error('Failed to fetch material details', err);
      }
    };
    checkBookmark();
    return () => { mounted = false; };
  }, [material.id, user]);

  const handleBookmark = async () => {
    if (!user) {
      toast.error('You must be logged in to bookmark.');
      return;
    }
    setBookmarkLoading(true);
    try {
      // Optimistic UI update
      const previousState = bookmarked;
      setBookmarked(!previousState);
      
      const { token } = JSON.parse(localStorage.getItem('studyhive_token') || '{"token":null}') || { token: localStorage.getItem('studyhive_token') };
      const authToken = typeof token === 'string' ? token : localStorage.getItem('studyhive_token');
      
      const data = await apiClient.post(`/materials/${material.id}/bookmark`, { action: 'toggle' }, { token: authToken });
      setBookmarked(data.bookmarked);
      toast.success(data.bookmarked ? 'Bookmarked!' : 'Bookmark removed');
    } catch (error) {
      setBookmarked(!bookmarked); // Revert on failure
      toast.error(error.message || 'Failed to update bookmark');
    } finally {
      setBookmarkLoading(false);
    }
  };

  const handleRate = async (rateValue) => {
    if (!user) {
      toast.error('You must be logged in to rate.');
      return;
    }
    try {
      await rateMaterial(material.id, rateValue, '');
      toast.success('Rating submitted successfully!');
    } catch (err) {
      toast.error('Failed to submit rating.');
    }
  };

  return (
    <div className="min-h-screen px-4 py-12 bg-slate-50 dark:bg-[#030712] relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[120px] pointer-events-none -z-10 animate-blob"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent-500/10 rounded-full blur-[120px] pointer-events-none -z-10 animate-blob" style={{animationDelay: '3s'}}></div>

      <div className="max-w-5xl mx-auto space-y-8 relative z-10">
        <button
          onClick={() => navigate(-1)}
          className="group text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center space-x-2 font-bold"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Back</span>
        </button>

        {/* ───── Main Header Card ───── */}
        <motion.div initial="hidden" animate="visible" variants={fadeIn} className="glass-card p-8 md:p-12 relative overflow-hidden shadow-2xl shadow-primary-500/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary-500/20 to-transparent blur-3xl rounded-full"></div>
          
          <div className="flex flex-col lg:flex-row gap-8 justify-between items-start relative z-10">
             <div className="flex-1 space-y-6">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="px-4 py-1.5 bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 rounded-lg text-sm font-black tracking-widest uppercase shadow-sm">
                    {course?.course_code || 'GEN'}
                  </span>
                  <span className={`px-4 py-1.5 rounded-lg text-sm font-black tracking-widest uppercase shadow-sm ${material.material_type === 'exam' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
                    {material.material_type === 'exam' ? 'Exam' : 'Material'}
                  </span>
                  {hasAI && (
                     <span className="flex items-center gap-1 px-4 py-1.5 bg-accent-100 text-accent-700 dark:bg-accent-900/40 dark:text-accent-300 rounded-lg text-sm font-black tracking-widest uppercase shadow-sm border border-accent-200 dark:border-accent-800">
                        <Sparkles className="w-4 h-4"/> AI Enhanced
                     </span>
                  )}
                </div>
                
                <div>
                   <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white leading-[1.1] mb-2 tracking-tight">
                     {material.title}
                   </h1>
                   <p className="text-xl text-slate-500 dark:text-slate-400 font-medium">
                     {courseLabel}
                   </p>
                </div>

                <div className="flex flex-wrap items-center gap-8 pt-4 border-t border-slate-200 dark:border-slate-800">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-500 to-indigo-500 flex items-center justify-center text-white font-bold shadow-md">
                         {uploaderName.charAt(0)}
                      </div>
                      <div>
                         <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-widest">Uploader</div>
                         <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                            {uploaderName} <BadgeCheck className="w-4 h-4 text-primary-500"/>
                         </div>
                      </div>
                   </div>
                   <div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-widest mb-1">Rating</div>
                      <div className="flex items-center gap-1 group">
                         {[1, 2, 3, 4, 5].map((star) => (
                           <Star 
                             key={star}
                             className={`w-5 h-5 cursor-pointer transition-all ${
                               (ratingHover || material.rating) >= star 
                                 ? 'fill-amber-400 text-amber-400' 
                                 : 'text-slate-300 dark:text-slate-700'
                             }`}
                             onMouseEnter={() => setRatingHover(star)}
                             onMouseLeave={() => setRatingHover(0)}
                             onClick={() => handleRate(star)}
                           />
                         ))}
                         <span className="ml-2 font-bold text-slate-700 dark:text-slate-300">({material.rating || 0})</span>
                      </div>
                   </div>
                </div>
             </div>

             <div className="flex flex-col gap-4 w-full lg:w-64 shrink-0">
                <button onClick={handleDownload} className="btn-primary py-5 text-lg w-full flex items-center justify-center shadow-xl shadow-primary-500/20">
                  <DownloadCloud className="w-6 h-6 mr-2" /> Download File
                </button>
                <div className="flex gap-3">
                   <button onClick={handleShare} className="btn-secondary py-4 flex-1 flex items-center justify-center">
                     <Share2 className="w-5 h-5 mr-2" /> Share
                   </button>
                   <button 
                     onClick={handleBookmark}
                     disabled={bookmarkLoading}
                     className={`py-4 px-5 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center border ${
                       bookmarked 
                         ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-600' 
                         : 'bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-500 hover:text-amber-500 hover:border-amber-300'
                     }`}
                   >
                     {bookmarked ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                   </button>
                </div>
                {hasAI && (
                  <button onClick={() => navigate(`/masterclass/${encodeURIComponent(material.title)}`)} className="btn-secondary py-4 w-full flex items-center justify-center border-indigo-500/30 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:text-white hover:bg-indigo-500 hover:border-indigo-500 transition-all shadow-md mt-2 relative overflow-hidden group">
                     <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                     <PlayCircle className="w-5 h-5 mr-2" /> Start AI Masterclass
                  </button>
                )}
                <div className="text-center text-sm font-bold text-slate-500 dark:text-slate-400 mt-2">
                   {material.downloads} total downloads
                </div>
             </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           
           {/* ───── Left Column (AI Honey Hub) ───── */}
           <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.2 }} className="lg:col-span-2 space-y-8">
              
              {hasAI ? (
                 <div className="glass-card p-1 border-primary-500/30 overflow-hidden shadow-2xl shadow-primary-500/10">
                    <div className="flex bg-slate-100 dark:bg-slate-900 border-b border-primary-500/20 rounded-t-[1.8rem] p-1">
                       {['summary', 'keyterms', 'quiz'].map(tab => (
                         <button 
                           key={tab}
                           onClick={() => setActiveTab(tab)}
                           className={`flex-1 py-4 text-center font-bold tracking-wide capitalize rounded-[1.5rem] transition-all duration-300 ${activeTab === tab ? 'bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                         >
                            {tab === 'summary' && '📝 AI Summary'}
                            {tab === 'keyterms' && '🔑 Key Terms'}
                            {tab === 'quiz' && '🎯 Auto-Quiz'}
                         </button>
                       ))}
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-b-[1.8rem] min-h-[300px]">
                       <AnimatePresence mode="wait">
                          {activeTab === 'summary' && (
                             <motion.div key="summary" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
                                <h3 className="text-2xl font-bold flex items-center gap-2"><Sparkles className="text-primary-500"/> Document Abstract</h3>
                                <p className="text-lg leading-relaxed text-slate-700 dark:text-slate-300">
                                   {material.aiSummary}
                                </p>
                             </motion.div>
                          )}
                          {activeTab === 'keyterms' && (
                             <motion.div key="keyterms" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                                <h3 className="text-2xl font-bold flex items-center gap-2"><Sparkles className="text-accent-500"/> Critical Vocabulary</h3>
                                <div className="flex flex-wrap gap-3">
                                   {material.aiKeyTerms && material.aiKeyTerms.length > 0 ? (
                                      material.aiKeyTerms.map((term, i) => (
                                         <div key={i} className="px-5 py-3 rounded-xl bg-accent-50 dark:bg-accent-900/20 border border-accent-200 dark:border-accent-800 text-accent-800 dark:text-accent-300 font-bold hover:-translate-y-1 transition-transform cursor-pointer shadow-sm">
                                            {term}
                                         </div>
                                      ))
                                   ) : <p className="text-slate-500">No key terms extracted.</p>}
                                </div>
                             </motion.div>
                          )}
                          {activeTab === 'quiz' && (
                             <motion.div key="quiz" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8">
                                <h3 className="text-2xl font-bold flex items-center gap-2"><Target className="text-orange-500"/> Practice Quiz</h3>
                                {material.aiQuiz && material.aiQuiz.length > 0 ? (
                                   <div className="space-y-6">
                                      {material.aiQuiz.map((q, i) => (
                                         <div key={i} className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                                            <div className="font-bold text-lg mb-4 text-slate-800 dark:text-white">Q{i+1}: {q.question}</div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                                               {q.options.map((opt, j) => (
                                                  <div key={j} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:border-primary-500 cursor-pointer transition-colors">
                                                     {opt}
                                                  </div>
                                               ))}
                                            </div>
                                            <details className="cursor-pointer group">
                                               <summary className="text-sm font-bold text-primary-600 outline-none">Reveal Answer</summary>
                                               <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-xl text-green-800 dark:text-green-400 font-bold text-sm">
                                                  ✅ {q.answer}
                                               </div>
                                            </details>
                                         </div>
                                      ))}
                                   </div>
                                ) : <p className="text-slate-500">No quiz available.</p>}
                             </motion.div>
                          )}
                       </AnimatePresence>
                    </div>
                 </div>
              ) : (
                <div className="glass-card p-12 text-center flex flex-col items-center justify-center space-y-4 border-dashed border-2">
                   <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-2">
                      <BrainCircuit className="w-10 h-10 text-slate-400"/>
                   </div>
                   <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Legacy Material</h3>
                   <p className="text-slate-500 max-w-md mx-auto">This material was uploaded before the Honey AI integration. No smart summaries or quizzes were generated.</p>
                </div>
              )}

              {/* Uploader Description */}
              <div className="glass-card p-8 space-y-4">
                 <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                    <FileText className="w-5 h-5 text-primary-500" /> Uploader's Notes
                 </h2>
                 <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                   {material.desc || material.description || 'No additional notes provided by the uploader.'}
                 </p>
              </div>

           </motion.div>

           {/* ───── Right Column (Metadata) ───── */}
           <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.4 }} className="space-y-6">
              <div className="glass-card p-6 space-y-6">
                 <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-4">File Details</h3>
                 <div className="space-y-5">
                    <div className="flex items-start gap-4">
                       <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600"><Calendar className="w-5 h-5"/></div>
                       <div>
                          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Added On</div>
                          <div className="font-semibold text-slate-800 dark:text-slate-200">{new Date(material.upload_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                       </div>
                    </div>
                    <div className="flex items-start gap-4">
                       <div className="w-10 h-10 rounded-xl bg-accent-50 dark:bg-accent-900/20 flex items-center justify-center text-accent-600"><HardDrive className="w-5 h-5"/></div>
                       <div>
                          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Format</div>
                          <div className="font-semibold text-slate-800 dark:text-slate-200">{material.file_type || 'Unknown Format'}</div>
                       </div>
                    </div>
                 </div>
              </div>
           </motion.div>

        </div>
      </div>
    </div>
  );
};

export default MaterialDetail;
