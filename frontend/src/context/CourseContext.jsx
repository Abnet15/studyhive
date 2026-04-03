import React, { createContext, useContext, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../services/apiClient';

const CourseContext = createContext(null);

export const useCourses = () => {
  const ctx = useContext(CourseContext);
  if (!ctx) throw new Error('useCourses must be used within CourseProvider');
  return ctx;
};

const normalizeCourse = (course) => ({
  id: course.id || course._id,
  course_code: course.code || course.course_code,
  course_name: course.name || course.title || course.course_name,
  description: course.description || '',
  department_id: course.departmentId || course.department_id || null,
  department_name: course.departmentName || course.department_name || '',
  is_active: typeof course.active === 'boolean' ? course.active : course.is_active ?? true,
});

export const CourseProvider = ({ children }) => {
  const { data: courses = [], isLoading: loading, error, refetch: refresh } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const data = await apiClient.get('/courses');
      return (data?.courses || []).map(normalizeCourse);
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const value = useMemo(
    () => ({
      courses,
      loading,
      error: error?.message || null,
      refresh,
    }),
    [courses, loading, error, refresh]
  );

  return <CourseContext.Provider value={value}>{children}</CourseContext.Provider>;
};
