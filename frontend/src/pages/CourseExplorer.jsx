import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import MaterialCard from '../components/MaterialCard';
import { useMaterials } from '../context/MaterialContext';
import { useCourses } from '../context/CourseContext';

const CourseExplorer = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCourse, setSelectedCourse] = useState(searchParams.get('course') || '');
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || '');
  const { materials } = useMaterials();
  const { courses } = useCourses();

  const filteredMaterials = useMemo(() => {
    let filtered = [...materials];

    // Filter by course
    if (selectedCourse) {
      const targetId = parseInt(selectedCourse, 10);
      filtered = filtered.filter(
        (m) => m.course_id === targetId || m.courseId === targetId
      );
    }

    // Filter by material type (exam/material)
    if (selectedType) {
      filtered = filtered.filter(m => m.material_type === selectedType);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((m) => {
        const courseId = m.course_id || m.courseId;
        const course = courses.find((c) => c.id === courseId);
        return (
          m.title.toLowerCase().includes(query) ||
          (m.desc || m.description || '').toLowerCase().includes(query) ||
          course?.course_code?.toLowerCase().includes(query) ||
          course?.course_name?.toLowerCase().includes(query)
        );
      });
    }

    return filtered;
  }, [materials, searchQuery, selectedCourse, selectedType, courses]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setSearchParams({ search: value, course: selectedCourse, type: selectedType });
  };

  const handleCourseChange = (e) => {
    const value = e.target.value;
    setSelectedCourse(value);
    setSearchParams({ search: searchQuery, course: value, type: selectedType });
  };

  const handleTypeChange = (e) => {
    const value = e.target.value;
    setSelectedType(value);
    setSearchParams({ search: searchQuery, course: selectedCourse, type: value });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCourse('');
    setSelectedType('');
    setSearchParams({});
  };

  return (
    <div className="min-h-screen px-3 sm:px-4 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-200 mb-1 sm:mb-2">
            Course Explorer 🔍
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Browse and search through all available study materials
          </p>
        </div>

        {/* Filters */}
        <div className="card mb-6 sm:mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="sm:col-span-2">
              <label htmlFor="search" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                Search Materials
              </label>
              <input
                type="text"
                id="search"
                value={searchQuery}
                onChange={handleSearchChange}
                className="input-field"
                placeholder="Search by title, description, or course..."
              />
            </div>
            <div>
              <label htmlFor="course" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                Filter by Course
              </label>
              <select
                id="course"
                value={selectedCourse}
                onChange={handleCourseChange}
                className="input-field"
              >
                <option value="">All Courses</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.course_code} - {course.course_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="type" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                Filter by Type
              </label>
              <select
                id="type"
                value={selectedType}
                onChange={handleTypeChange}
                className="input-field"
              >
                <option value="">All Types</option>
                <option value="exam">Exams</option>
                <option value="material">Materials</option>
              </select>
            </div>
          </div>

          {(searchQuery || selectedCourse || selectedType) && (
            <div className="mt-3 sm:mt-4 flex items-center space-x-2">
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                {filteredMaterials.length} material(s) found
              </span>
              <button
                onClick={clearFilters}
                className="text-xs sm:text-sm text-primary-600 dark:text-primary-400 hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        {/* Results */}
        {filteredMaterials.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredMaterials.map(material => (
              <MaterialCard key={material.id} material={material} />
            ))}
          </div>
        ) : (
          <div className="card text-center py-10 sm:py-12">
            <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🔍</div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
              No materials found
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseExplorer;

