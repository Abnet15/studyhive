import { useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';

/**
 * Fetches badge definitions from the API.
 * Returns { badges, badgesLoading }.
 * Each badge has: id, code, name, description, icon, threshold.
 */
export const useBadges = () => {
    const [badges, setBadges] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        const fetchBadges = async () => {
            try {
                const data = await apiClient.get('/badges');
                if (!cancelled) {
                    setBadges(data.badges || []);
                }
            } catch (err) {
                console.warn('Failed to fetch badges:', err.message);
                if (!cancelled) setBadges([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        fetchBadges();
        return () => { cancelled = true; };
    }, []);

    return { badges, badgesLoading: loading };
};

/**
 * Determine whether a user has earned a badge, based on their stats.
 * @param {object} badge - badge object from the API (has .code)
 * @param {{ totalUploads: number, totalDownloads: number, avgRating: string|number }} stats
 */
export const isBadgeEarned = (badge, { totalUploads = 0, totalDownloads = 0, avgRating = 0 }) => {
    switch (badge.code) {
        case 'FIRST_UPLOAD':
            return totalUploads > 0;
        case 'POPULAR_CONTRIBUTOR':
            return totalDownloads >= (badge.threshold || 100);
        case 'TOP_RATED':
            return parseFloat(avgRating) >= 4.5 && totalUploads > 0;
        case 'HELPER':
            return totalUploads >= (badge.threshold || 5);
        default:
            return false;
    }
};
