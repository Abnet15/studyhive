import React from 'react';

const Badge = ({ name, icon, description, earned = true }) => {
  return (
    <div
      className={`card p-4 text-center transition-all duration-300 ${
        earned
          ? 'hover:scale-105 cursor-pointer opacity-100'
          : 'opacity-50 grayscale'
      }`}
    >
      <div className="text-4xl mb-2">{icon}</div>
      <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
        {name}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {description}
      </p>
    </div>
  );
};

export default Badge;

