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
      toast.warn('File download link is not available yet. The file may still be processing.');
      return;
    }

    // Record the download (non-blocking — don't let tracking failures prevent download)
    recordDownload(material.id);

    // Trigger the actual file download
    try {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      // Use the original file name if available for the download attribute
      if (material.original_file_name) {
        link.download = material.original_file_name;
      }
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download error:', error);
      // Fallback: open in new tab
      window.open(fileUrl, '_blank', 'noopener');
    }
  };

  return (
    <div className="card group hover:border-primary-500 dark:hover:border-primary-400 hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <Link to={`/materials/${material.id}`}>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors mb-2">
              {material.title}
            </h3>
          </Link>
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            {courseCode} {courseName ? `- ${courseName}` : ''}
          </p>
        </div>
        <div className="flex flex-col gap-2 items-end">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-md ${material.material_type === 'exam'
            ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700'
            : 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-700'
            }`}>
            {material.material_type === 'exam' ? '📝 Exam' : '📚 Material'}
          </span>
          <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-semibold border border-gray-200 dark:border-gray-600">
            {material.file_type || material.fileType || 'FILE'}
          </span>
        </div>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 leading-relaxed">
        {material.desc || material.description}
      </p>

      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            by {uploaderName}
          </span>
        </div>
        <RatingStars rating={material.rating} showNumber={true} size="sm" />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
          📥 {material.downloads?.toLocaleString() || 0} downloads
        </span>
        <button
          onClick={handleDownload}
          className="btn-primary text-sm py-2 px-4"
        >
          Download
        </button>
      </div>
    </div>
  );
};

export default MaterialCard;
