import React from 'react';
import { motion } from 'framer-motion';
import { CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';

const Calendar = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
            Calendar
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400">
            View and manage your tasks in calendar format.
          </p>
        </div>
      </div>

      {/* Coming Soon Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-secondary-800 rounded-xl p-12 shadow-lg border border-secondary-200 dark:border-secondary-700 text-center"
      >
        <CalendarIcon className="w-16 h-16 text-primary-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
          Calendar View Coming Soon
        </h2>
        <p className="text-secondary-600 dark:text-secondary-400 max-w-md mx-auto">
          We're working on an amazing calendar interface to help you visualize your tasks and deadlines. 
          Stay tuned for this exciting feature!
        </p>
        <div className="mt-6 flex items-center justify-center text-sm text-secondary-500 dark:text-secondary-400">
          <ClockIcon className="w-4 h-4 mr-2" />
          Expected release: Coming soon
        </div>
      </motion.div>
    </div>
  );
};

export default Calendar;