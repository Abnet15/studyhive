import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMaterials } from '../context/MaterialContext';
import { useBadges, isBadgeEarned } from '../hooks/useBadges';
import MaterialCard from '../components/MaterialCard';
import Badge from '../components/Badge';

const Profile = () => {
  const { user } = useAuth();
  const { materials, loading: matLoading } = useMaterials();
  const { badges, loading: badgeLoading } = useBadges();

  const userMaterials = useMemo(
    () => materials.filter((m) => m.uploader_id === user?.id),
    [materials, user]
  );

  const stats = useMemo(() => {
    const totalUploads = userMaterials.length;
    const avgRating = totalUploads
      ? (userMaterials.reduce((s, m) => s + (m.rating || 0), 0) / totalUploads).toFixed(1)
      : '0.0';
    const totalDownloads = userMaterials.reduce((s, m) => s + (m.downloads || 0), 0);
    return { totalUploads, avgRating, totalDownloads };
  }, [userMaterials]);

  const badgeList = useMemo(
    () =>
      badges.map((b) => ({
        ...b,
        earned: isBadgeEarned(b, stats.totalUploads, Number(stats.avgRating), stats.totalDownloads),
      })),
    [badges, stats]
  );

  if (!user) return null;

  return (
    <div className="min-h-screen px-4 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Profile Header */}
        <div className="card bg-gradient-to-r from-primary-600 via-primary-700 to-accent-600 text-white overflow-hidden relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 relative z-10">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/20 flex items-center justify-center text-2xl sm:text-3xl font-bold flex-shrink-0">
              {(user.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="text-center sm:text-left flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-1">
                <h1 className="text-xl sm:text-2xl font-bold truncate">{user.name}</h1>
                <Link to="/settings" className="inline-flex items-center gap-1 text-white/70 hover:text-white text-xs sm:text-sm transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                  Settings
                </Link>
              </div>
              <p className="text-white/80 text-sm sm:text-base">{user.dept} • Year {user.year || 'N/A'}</p>
              <p className="text-white/60 text-xs sm:text-sm">{user.email}</p>
            </div>
          </div>
          <div className="flex justify-center sm:justify-start gap-6 sm:gap-8 mt-4 pt-4 border-t border-white/20">
            <div className="text-center">
              <div className="text-lg sm:text-xl font-bold">{stats.totalUploads}</div>
              <div className="text-xs sm:text-sm text-white/70">Uploads</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-xl font-bold">{stats.avgRating}</div>
              <div className="text-xs sm:text-sm text-white/70">Avg Rating</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-xl font-bold">{stats.totalDownloads}</div>
              <div className="text-xs sm:text-sm text-white/70">Downloads</div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Uploads */}
          <div className="lg:col-span-2">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Your Uploads ({stats.totalUploads})
            </h2>

            {matLoading ? (
              <div className="text-center py-12 text-gray-500">Loading materials...</div>
            ) : userMaterials.length === 0 ? (
              <div className="card text-center py-10">
                <div className="text-4xl mb-3">📚</div>
                <p className="text-gray-600 dark:text-gray-400 font-medium mb-1">No uploads yet</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                  Start sharing your study materials with the community!
                </p>
                <Link to="/upload" className="btn-primary">Upload Your First Material</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {userMaterials.map((m) => (
                  <MaterialCard key={m.id} material={m} />
                ))}
              </div>
            )}
          </div>

          {/* Badges */}
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Your Badges</h2>
            {badgeLoading ? (
              <div className="text-center py-8 text-gray-500">Loading badges...</div>
            ) : badgeList.length === 0 ? (
              <div className="card text-center py-8">
                <p className="text-gray-500 text-sm">No badges available yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {badgeList.map((b) => (
                  <Badge key={b.id} name={b.name} icon={b.icon} description={b.description} earned={b.earned} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
