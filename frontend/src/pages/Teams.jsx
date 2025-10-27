import React from 'react';
import { motion } from 'framer-motion';
import { UsersIcon, ClockIcon } from '@heroicons/react/24/outline';

const Teams = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
            Teams
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400">
            Collaborate with your team members and manage shared projects.
          </p>
        </div>
      </div>

      {/* Coming Soon Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-secondary-800 rounded-xl p-12 shadow-lg border border-secondary-200 dark:border-secondary-700 text-center"
      >
        <UsersIcon className="w-16 h-16 text-primary-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
          Team Collaboration Coming Soon
        </h2>
        <p className="text-secondary-600 dark:text-secondary-400 max-w-md mx-auto">
          We're building powerful team collaboration features including shared workspaces, 
          task assignments, and real-time collaboration tools.
        </p>
        <div className="mt-6 flex items-center justify-center text-sm text-secondary-500 dark:text-secondary-400">
          <ClockIcon className="w-4 h-4 mr-2" />
          Expected release: Coming soon
        </div>
      </motion.div>
    </div>
  );
};

export default Teams;