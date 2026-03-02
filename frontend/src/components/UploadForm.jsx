import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfettiAnimation from './ConfettiAnimation';
import { useAuth } from '../context/AuthContext';
import { useMaterials } from '../context/MaterialContext';
import { useCourses } from '../context/CourseContext';

const UploadForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addMaterial } = useMaterials();
  const { courses } = useCourses();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course_id: '',
    material_type: 'material', // 'exam' or 'material'
    file: null,
  });
  const [showConfetti, setShowConfetti] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'file') {
      setFormData({ ...formData, file: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.file) {
      setErrorMessage('Please select a file to upload');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = new FormData();
      payload.append('title', formData.title);
      payload.append('description', formData.description);
      payload.append('courseId', formData.course_id);
      payload.append('materialType', formData.material_type);
      payload.append('file', formData.file);
      const response = await addMaterial(payload);
      setShowConfetti(true);
      // Wait a bit for the material to be fully processed
      await new Promise(resolve => setTimeout(resolve, 1000));
      setFormData({
        title: '',
        description: '',
        course_id: '',
        material_type: 'material',
        file: null,
      });
      setShowConfetti(false);
      navigate('/dashboard');
    } catch (error) {
      console.error('Upload error:', error);
      setErrorMessage(error.message || 'Upload failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <ConfettiAnimation trigger={showConfetti} />
      
      {showConfetti && (
        <div className="mb-6 p-4 bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-600 rounded-lg text-green-700 dark:text-green-300 text-center">
          <p className="font-semibold text-lg">🎉 Upload Successful!</p>
          <p className="text-sm">Your material has been shared with the community!</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-6">
        {errorMessage && (
          <div className="p-3 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 rounded-lg text-red-700 dark:text-red-300 text-sm">
            {errorMessage}
          </div>
        )}

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Material Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="input-field"
            placeholder="e.g., CS301 Midterm Exam 2023"
          />
        </div>

        <div>
          <label htmlFor="material_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Type *
          </label>
          <select
            id="material_type"
            name="material_type"
            value={formData.material_type}
            onChange={handleChange}
            required
            className="input-field"
          >
            <option value="material">Study Material</option>
            <option value="exam">Exam (Photo/PDF)</option>
          </select>
        </div>

        <div>
          <label htmlFor="course_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Course *
          </label>
          <select
            id="course_id"
            name="course_id"
            value={formData.course_id}
            onChange={handleChange}
            required
            className="input-field"
          >
            <option value="">Select a course</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>
                {course.course_code} - {course.course_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="4"
            className="input-field"
            placeholder="Describe the material, what it contains, and any relevant information..."
          />
        </div>

        <div>
          <label htmlFor="file" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            File *
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg hover:border-primary-500 dark:hover:border-primary-400 transition-colors">
            <div className="space-y-1 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex text-sm text-gray-600 dark:text-gray-400">
                <label
                  htmlFor="file"
                  className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                >
                  <span>Upload a file</span>
                  <input
                    id="file"
                    name="file"
                    type="file"
                    className="sr-only"
                    onChange={handleChange}
                    required
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {formData.material_type === 'exam' 
                  ? 'PDF, JPG, PNG up to 10MB (for exams)' 
                  : 'PDF, DOCX, ZIP up to 10MB'}
              </p>
              {formData.file && (
                <p className="text-sm text-primary-600 dark:text-primary-400 mt-2">
                  Selected: {formData.file.name}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Uploading...' : `Upload ${formData.material_type === 'exam' ? 'Exam' : 'Material'}`}
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadForm;

