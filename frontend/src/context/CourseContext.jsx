import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { apiClient } from '../services/apiClient';

const CourseContext = createContext(null);

export const useCourses = () => {
  const ctx = useContext(CourseContext);
  if (!ctx) {
    throw new Error('useCourses must be used within CourseProvider');
  }
  return ctx;
};

const normalizeCourse = (course) => ({
  id: course.id,
  course_code: course.code || course.course_code,
  course_name: course.name || course.course_name,
  description: course.description || '',
  department_id: course.departmentId || course.department_id || null,
  department_name: course.departmentName || course.department_name || '',
  is_active: typeof course.active === 'boolean' ? course.active : course.is_active ?? true,
});

export const CourseProvider = ({ children }) => {
  // Start with empty array — real data only
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.get('/courses');
      const resolved = (data?.courses || []).map(normalizeCourse);
      setCourses(resolved);
    } catch (err) {
      console.warn('Failed to load courses from API:', err.message);
      setError(err.message);
      // No mock fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const value = useMemo(
    () => ({
      courses,
      loading,
      error,
      refresh: fetchCourses,
    }),
    [courses, loading, error, fetchCourses]
  );

  return <CourseContext.Provider value={value}>{children}</CourseContext.Provider>;
};
