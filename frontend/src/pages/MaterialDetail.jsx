import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import RatingStars from '../components/RatingStars';
import { useAuth } from '../context/AuthContext';
import { useMaterials } from '../context/MaterialContext';
import { useCourses } from '../context/CourseContext';
import { useToast } from '../components/Toast';
import aiService from '../services/aiService';
import { useState } from 'react';

const MaterialDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { materials, materialsLoading, recordDownload } = useMaterials();
  const { courses } = useCourses();
  const toast = useToast();
  const material = materials.find((m) => m.id === parseInt(id, 10));
  
  const [explanation, setExplanation] = useState('');
  const [explaining, setExplaining] = useState(false);
  const { token } = useAuth();

  if (materialsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading material...</p>
        </div>
      </div>
    );
  }

  if (!material) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            Material not found
          </h2>
          <button onClick={() => navigate('/courses')} className="btn-primary mt-4">
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  const uploaderName =
    material.uploader_name ||
    material.uploaderName ||
    'Unknown';
  const course =
    courses.find((c) => c.id === material.course_id || c.id === material.courseId) || null;
  const courseLabel =
    (course && `${course.course_code} ${course.course_name ? `- ${course.course_name}` : ''}`) ||
    material.course_code ||
    'Course';

  const handleDownload = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fileUrl = material.file_url || material.fileUrl;
    const hasValidUrl = fileUrl && fileUrl !== '#' && fileUrl !== '' &&
      !fileUrl.includes('undefined') && !fileUrl.includes('null');

    if (!hasValidUrl) {
      toast.warn('File download link is not available yet. The file may still be processing.');
      return;
    }

    // Record the download (non-blocking)
    recordDownload(material.id);

    // Trigger the actual file download
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
      console.error('Download error:', error);
      window.open(fileUrl, '_blank', 'noopener');
    }
  };

  const handleShare = () => {
    const sharePayload = {
      title: material.title,
      text: material.desc || material.description,
      url: window.location.href,
    };

    if (navigator.share) {
      navigator.share(sharePayload).catch(() => {
        navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      });
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleAIExplain = async () => {
    setExplaining(true);
    try {
      const resp = await aiService.explain({ materialId: material.id }, token);
      setExplanation(resp.explanation);
    } catch (err) {
      toast.error('Failed to get AI explanation');
    } finally {
      setExplaining(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-primary-600 dark:text-primary-400 hover:underline flex items-center space-x-2"
        >
          <span>←</span>
          <span>Back</span>
        </button>

        <div className="card mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full text-sm font-semibold">
                  {course?.course_code}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${material.material_type === 'exam'
                    ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                    : 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                    }`}
                >
                  {material.material_type === 'exam' ? 'Exam' : 'Study Material'}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                {material.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {courseLabel}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-6 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <span className="text-gray-600 dark:text-gray-400">Uploaded by:</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                {uploaderName}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-600 dark:text-gray-400">Rating:</span>
              <RatingStars rating={material.rating || 0} showNumber={true} />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-600 dark:text-gray-400">📥</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                {material.downloads} downloads
              </span>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
              Description
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {material.desc || material.description}
            </p>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
              Details
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Upload Date:</span>
                <p className="font-semibold text-gray-800 dark:text-gray-200">
                  {new Date(material.upload_date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">File Type:</span>
                <p className="font-semibold text-gray-800 dark:text-gray-200">
                  {material.file_type || material.fileType || 'FILE'}
                </p>
              </div>
              {material.original_file_name && (
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Original File:</span>
                  <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">
                    {material.original_file_name}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={handleDownload} className="btn-primary flex-1">
              📥 Download Material
            </button>
            <button onClick={handleShare} className="btn-secondary flex-1">
              🔗 Share
            </button>
          </div>
          
          {/* AI Explanation Section */}
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
             <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                   🤖 AI Smart Guide
                </h2>
                {!explanation && (
                  <button 
                    onClick={handleAIExplain} 
                    disabled={explaining}
                    className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline disabled:opacity-50"
                  >
                    {explaining ? '🪄 Analyzing...' : '✨ Generate Explanation'}
                  </button>
                )}
             </div>

             {explanation ? (
               <div className="bg-primary-50 dark:bg-primary-900/10 p-6 rounded-2xl border border-primary-100 dark:border-primary-800/50">
                  <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
                     <p className="whitespace-pre-line">{explanation}</p>
                  </div>
                  <button 
                    onClick={() => setExplanation('')}
                    className="mt-4 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    Clear explanation
                  </button>
               </div>
             ) : (
               <div className="p-8 text-center bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">
                    Confused by this material? Let our AI break it down for you.
                  </p>
                  <button 
                    onClick={handleAIExplain}
                    disabled={explaining}
                    className="btn-secondary py-2 px-6 text-sm"
                  >
                    {explaining ? '🪄 Working magic...' : 'Explain with AI'}
                  </button>
               </div>
             )}
          </div>
        </div>

        {/* Related Materials */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            Related Materials
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {materials
              .filter(m => m.course_id === material.course_id && m.id !== material.id)
              .slice(0, 2)
              .map(related => (
                <div
                  key={related.id}
                  onClick={() => navigate(`/materials/${related.id}`)}
                  className="card cursor-pointer hover:border-primary-500 dark:hover:border-primary-400 transition-colors"
                >
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
                    {related.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {related.desc}
                  </p>
                  <RatingStars rating={related.rating} showNumber={true} size="sm" />
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialDetail;
