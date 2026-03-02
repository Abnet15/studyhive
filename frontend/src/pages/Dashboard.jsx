import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MaterialCard from '../components/MaterialCard';
import Badge from '../components/Badge';
import { useBadges, isBadgeEarned } from '../hooks/useBadges';
import { useMaterials } from '../context/MaterialContext';
import { useCourses } from '../context/CourseContext';

const Dashboard = () => {
  const { user } = useAuth();
  const { materials, materialsLoading } = useMaterials();
  const { courses } = useCourses();
  const { badges, badgesLoading } = useBadges();

  const sortedMaterials = [...materials].sort(
    (a, b) => new Date(b.upload_date).getTime() - new Date(a.upload_date).getTime()
  );
  const recentMaterials = sortedMaterials.slice(0, 4);
  const recommendedCourses = courses.slice(0, 3);
  const userMaterials = user ? materials.filter((m) => m.uploader_id === user.id) : [];
  const totalDownloads = userMaterials.reduce((sum, m) => sum + (m.downloads || 0), 0);
  const avgRating = userMaterials.length > 0
    ? (userMaterials.reduce((sum, m) => sum + (m.rating || 0), 0) / userMaterials.length).toFixed(1)
    : '0.0';
  const totalUploads = userMaterials.length;

  return (
    <div className="min-h-screen px-3 sm:px-4 py-4 sm:py-8 bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-10">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold gradient-text mb-2 sm:mb-3">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-sm sm:text-lg text-gray-600 dark:text-gray-400">
            {user?.dept || 'Department'} • Year {user?.year || 'N/A'} • {user?.email}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-10">
          <div className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl sm:text-3xl md:text-4xl font-bold mb-0.5">{totalUploads}</div>
                <div className="text-primary-100 text-xs sm:text-sm font-medium">Uploads</div>
              </div>
              <div className="text-2xl sm:text-4xl md:text-5xl opacity-80 hidden sm:block">📚</div>
            </div>
          </div>
          <div className="card bg-gradient-to-br from-accent-500 to-accent-600 text-white shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl sm:text-3xl md:text-4xl font-bold mb-0.5">{avgRating}</div>
                <div className="text-accent-100 text-xs sm:text-sm font-medium">Avg Rating</div>
              </div>
              <div className="text-2xl sm:text-4xl md:text-5xl opacity-80 hidden sm:block">⭐</div>
            </div>
          </div>
          <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl sm:text-3xl md:text-4xl font-bold mb-0.5">{totalDownloads.toLocaleString()}</div>
                <div className="text-green-100 text-xs sm:text-sm font-medium">Downloads</div>
              </div>
              <div className="text-2xl sm:text-4xl md:text-5xl opacity-80 hidden sm:block">📥</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Recent Uploads */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-2xl font-bold text-gray-800 dark:text-gray-200">
                Recent Uploads
              </h2>
              <Link to="/courses" className="text-primary-600 dark:text-primary-400 hover:underline font-medium text-sm">
                View All →
              </Link>
            </div>
            {materialsLoading ? (
              <div className="card text-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading materials...</p>
              </div>
            ) : recentMaterials.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {recentMaterials.map(material => (
                  <MaterialCard key={material.id} material={material} />
                ))}
              </div>
            ) : (
              <div className="card text-center py-12">
                <div className="text-5xl mb-4">📭</div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  No materials yet
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Be the first to upload study materials!
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recommended Courses */}
            <div>
              <h2 className="text-base sm:text-xl font-bold text-gray-800 dark:text-gray-200 mb-3 sm:mb-4">
                Recommended Courses
              </h2>
              <div className="space-y-3">
                {recommendedCourses.map(course => (
                  <Link
                    key={course.id}
                    to={`/courses?course=${course.id}`}
                    className="card block hover:border-primary-500 dark:hover:border-primary-400 transition-colors"
                  >
                    <div className="font-semibold text-sm sm:text-base text-gray-800 dark:text-gray-200">
                      {course.course_code}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      {course.course_name}
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Badges */}
            <div>
              <h2 className="text-base sm:text-xl font-bold text-gray-800 dark:text-gray-200 mb-3 sm:mb-4">
                Your Badges
              </h2>
              {badgesLoading ? (
                <div className="card text-center py-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500 mx-auto mb-3"></div>
                  <p className="text-sm text-gray-500">Loading badges...</p>
                </div>
              ) : badges.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {badges.map(badge => (
                    <Badge
                      key={badge.id}
                      name={badge.name}
                      icon={badge.icon}
                      description={badge.description}
                      earned={isBadgeEarned(badge, totalUploads, Number(avgRating), totalDownloads)}
                    />
                  ))}
                </div>
              ) : (
                <div className="card text-center py-6">
                  <p className="text-sm text-gray-500 dark:text-gray-400">No badges available.</p>
                </div>
              )}
            </div>

            {/* Quick Action */}
            <Link
              to="/upload"
              className="card bg-gradient-to-r from-primary-500 via-accent-500 to-primary-600 text-white text-center hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl block"
            >
              <div className="text-3xl sm:text-5xl mb-2 sm:mb-3">📤</div>
              <div className="font-bold text-base sm:text-xl mb-1">Upload Material</div>
              <div className="text-xs sm:text-sm text-white/90">Share with the community</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
