import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { apiClient, API_HOST } from '../services/apiClient';
import { useAuth } from './AuthContext';

const MaterialContext = createContext(null);

const buildFileUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${API_HOST}${path}`;
};

const normalizeMaterial = (record = {}) => {
  const filePath = record.fileUrl || record.file_url || record.file_path || '';
  const uploadDate = record.upload_date || record.uploaded_at || record.uploadedAt;
  return {
    id: record.id,
    title: record.title,
    desc: record.description || record.desc || '',
    description: record.description || record.desc || '',
    course_id: record.course_id || record.courseId || null,
    courseId: record.course_id || record.courseId || null,
    course_code: record.course_code || record.courseCode || null,
    course_name: record.course_name || record.courseName || null,
    uploader_id: record.uploader_id || record.uploaderId || null,
    uploaderId: record.uploader_id || record.uploaderId || null,
    uploader_name: record.uploader_name || record.uploaderName || '',
    uploaderName: record.uploader_name || record.uploaderName || '',
    file_url: buildFileUrl(filePath),
    fileUrl: buildFileUrl(filePath),
    original_file_name: record.original_file_name || record.originalFileName || '',
    file_type: (record.file_type || record.fileType || '').toUpperCase(),
    material_type: record.material_type || record.materialType || 'material',
    downloads: record.downloads || 0,
    rating: Number(record.rating ?? record.rating_avg ?? 0),
    rating_avg: Number(record.rating ?? record.rating_avg ?? 0),
    rating_count: record.rating_count || record.ratingCount || 0,
    upload_date: uploadDate || new Date().toISOString(),
    uploaded_at: uploadDate || new Date().toISOString(),
    is_public: record.is_public ?? true,
    is_approved: record.is_approved ?? true,
  };
};

export const useMaterials = () => {
  const ctx = useContext(MaterialContext);
  if (!ctx) {
    throw new Error('useMaterials must be used within a MaterialProvider');
  }
  return ctx;
};

export const MaterialProvider = ({ children }) => {
  const { token } = useAuth();
  // Start with empty array — real data only
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Pass token so user can see their own unapproved materials
      const data = await apiClient.get('/materials?limit=100', { token });
      const normalized = (data.materials || []).map(normalizeMaterial);
      setMaterials(normalized);
    } catch (err) {
      setError(err.message);
      console.warn('Failed to fetch materials from API:', err.message);
      // No mock fallback — keep whatever we already have (or empty)
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  const addMaterial = async (formData) => {
    if (!token) {
      throw new Error('You need to be logged in to upload materials.');
    }
    try {
      const response = await apiClient.post('/materials', formData, { token, isFormData: true });
      // If the response includes the material, add it immediately
      if (response.material) {
        const normalized = normalizeMaterial(response.material);
        setMaterials((prev) => {
          const exists = prev.some(m => m.id === normalized.id);
          return exists ? prev : [normalized, ...prev];
        });
      }
      // Also refresh to get the latest list
      setTimeout(() => {
        fetchMaterials().catch(err => console.warn('Failed to refresh materials:', err));
      }, 500);
      return response;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const deleteMaterial = async (materialId) => {
    if (!token) return;
    await apiClient.del(`/materials/${materialId}`, { token });
    setMaterials((prev) => prev.filter((item) => item.id !== materialId));
  };

  const updateMaterial = (materialId, updates) => {
    setMaterials((prev) =>
      prev.map((item) =>
        item.id === materialId ? normalizeMaterial({ ...item, ...updates }) : item
      )
    );
  };

  const recordDownload = async (materialId) => {
    // Record download - token is optional on the backend now
    try {
      await apiClient.post(`/materials/${materialId}/download`, {}, { token });
    } catch (err) {
      console.warn('Download tracking failed:', err.message);
    }
    // Optimistically update count in local state
    setMaterials((prev) =>
      prev.map((item) =>
        item.id === materialId ? { ...item, downloads: (item.downloads || 0) + 1 } : item
      )
    );
  };

  const rateMaterial = async (materialId, rating, comment) => {
    if (!token) {
      throw new Error('Login required to rate materials.');
    }
    await apiClient.post(
      `/materials/${materialId}/rate`,
      { rating, comment },
      { token }
    );
    await fetchMaterials();
  };

  const value = useMemo(
    () => ({
      materials,
      materialsLoading: loading,
      materialsError: error,
      addMaterial,
      updateMaterial,
      deleteMaterial,
      recordDownload,
      rateMaterial,
      refreshMaterials: fetchMaterials,
    }),
    [materials, loading, error, fetchMaterials]
  );

  return <MaterialContext.Provider value={value}>{children}</MaterialContext.Provider>;
};
