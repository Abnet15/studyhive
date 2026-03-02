import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-800 dark:bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center space-x-2">
              <span>🐝 StudyHive</span>
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Your one-stop platform for university study materials, past exams, and academic resources.
            </p>
          </div>

          <div>
            <h4 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-primary-400 transition-colors">Home</Link></li>
              <li><Link to="/courses" className="hover:text-primary-400 transition-colors">Courses</Link></li>
              <li><Link to="/upload" className="hover:text-primary-400 transition-colors">Upload Materials</Link></li>
              <li><Link to="/settings" className="hover:text-primary-400 transition-colors">Settings</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Connect</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-primary-400 transition-colors">About Us</Link></li>
              <li><a href="mailto:contact@studyhive.com" className="hover:text-primary-400 transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} StudyHive. All rights reserved. By Bekalu Temesgen</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
