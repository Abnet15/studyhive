import React from 'react';

const RatingStars = ({ rating, showNumber = false, size = 'md' }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  return (
    <div className="flex items-center space-x-1">
      <div className={`flex ${sizeClasses[size]}`}>
        {[...Array(fullStars)].map((_, i) => (
          <span key={i} className="text-yellow-400">⭐</span>
        ))}
        {hasHalfStar && <span className="text-yellow-400">⭐</span>}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={i} className="text-gray-300 dark:text-gray-600">⭐</span>
        ))}
      </div>
      {showNumber && (
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default RatingStars;

