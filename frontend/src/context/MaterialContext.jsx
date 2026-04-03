import React, { createContext, useContext, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
    id: record.id || record._id,
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
    // AI fields
    aiSummary: record.aiSummary || null,
    aiKeyTerms: record.aiKeyTerms || [],
    aiQuiz: record.aiQuiz || [],
  };
};

export const useMaterials = () => {
  const ctx = useContext(MaterialContext);
  if (!ctx) throw new Error('useMaterials must be used within a MaterialProvider');
  return ctx;
};

export const MaterialProvider = ({ children }) => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const { data: materials = [], isLoading: loading, error, refetch: refreshMaterials } = useQuery({
    queryKey: ['materials', token],
    queryFn: async () => {
      const data = await apiClient.get('/materials?limit=100', { token });
      return (data.materials || []).map(normalizeMaterial);
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const addMaterialMutation = useMutation({
    mutationFn: async (formData) => {
      if (!token) throw new Error('You need to be logged in to upload materials.');
      return await apiClient.post('/materials', formData, { token, isFormData: true });
    },
    onSuccess: (data) => {
      if (data.material) {
        queryClient.setQueryData(['materials', token], (old) => {
          return [normalizeMaterial(data.material), ...(old || [])];
        });
      }
      queryClient.invalidateQueries(['materials']);
    },
  });

  const deleteMaterialMutation = useMutation({
    mutationFn: async (materialId) => {
      if (!token) throw new Error('Not authorized');
      return await apiClient.del(`/materials/${materialId}`, { token });
    },
    onSuccess: (_, materialId) => {
      queryClient.setQueryData(['materials', token], (old) => 
        (old || []).filter(m => m.id !== materialId)
      );
    },
  });

  const downloadMutation = useMutation({
    mutationFn: async (materialId) => apiClient.post(`/materials/${materialId}/download`, {}, { token }),
    onMutate: async (materialId) => {
      // Optimitic Update
      await queryClient.cancelQueries(['materials', token]);
      const previousMaterials = queryClient.getQueryData(['materials', token]);
      queryClient.setQueryData(['materials', token], (old) => 
        (old || []).map((m) => m.id === materialId ? { ...m, downloads: (m.downloads || 0) + 1 } : m)
      );
      return { previousMaterials };
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(['materials', token], context.previousMaterials);
    },
  });

  const rateMutation = useMutation({
    mutationFn: async ({ materialId, rating, comment }) => {
      if (!token) throw new Error('Login required to rate materials.');
      return apiClient.post(`/materials/${materialId}/rate`, { rating, comment }, { token });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['materials', token]);
    },
  });

  // Legacy wrappers for UI components
  const addMaterial = (formData) => addMaterialMutation.mutateAsync(formData);
  const deleteMaterial = (id) => deleteMaterialMutation.mutateAsync(id);
  const recordDownload = (id) => downloadMutation.mutateAsync(id);
  const rateMaterial = (id, rating, comment) => rateMutation.mutateAsync({ materialId: id, rating, comment });
  const updateMaterial = (id, updates) => {
    queryClient.setQueryData(['materials', token], (old) =>
      (old || []).map((item) => item.id === id ? normalizeMaterial({ ...item, ...updates }) : item)
    );
  };

  const value = useMemo(
    () => ({
      materials,
      materialsLoading: loading || addMaterialMutation.isLoading,
      materialsError: error?.message || addMaterialMutation.error?.message,
      addMaterial,
      updateMaterial,
      deleteMaterial,
      recordDownload,
      rateMaterial,
      refreshMaterials,
    }),
    [materials, loading, error, addMaterialMutation.isLoading, addMaterialMutation.error, refreshMaterials]
  );

  return <MaterialContext.Provider value={value}>{children}</MaterialContext.Provider>;
};
