import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import UploadForm from '../components/UploadForm';

const Upload = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            Upload Material 📤
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Share your study materials with the community
          </p>
        </div>

        <UploadForm />
      </div>
    </div>
  );
};

export default Upload;

