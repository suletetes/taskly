import React from 'react';
import { motion } from 'framer-motion';
import { 
  ChartBarIcon, 
  CheckIcon, 
  ClockIcon,
  TrophyIcon 
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
            Dashboard
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400">
            Welcome back! Here's your productivity overview.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <div className="flex items-center">
            <div className="p-3 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
              <CheckIcon className="w-6 h-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                Total Tasks
              </p>
              <p className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
                24
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <div className="flex items-center">
            <div className="p-3 bg-success-100 dark:bg-success-900/20 rounded-lg">
              <TrophyIcon className="w-6 h-6 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                Completed
              </p>
              <p className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
                18
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6"
        >
          <div className="flex items-center">
            <div className="p-3 bg-warning-100 dark:bg-warning-900/20 rounded-lg">
              <ClockIcon className="w-6 h-6 text-warning-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                In Progress
              </p>
              <p className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
                6
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card p-6"
        >
          <div className="flex items-center">
            <div className="p-3 bg-info-100 dark:bg-info-900/20 rounded-lg">
              <ChartBarIcon className="w-6 h-6 text-info-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                Productivity
              </p>
              <p className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
                85%
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Tasks */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card p-6"
      >
        <h2 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
          Recent Tasks
        </h2>
        <div className="space-y-3">
          {[1, 2, 3].map((task) => (
            <div key={task} className="flex items-center justify-between p-3 bg-secondary-50 dark:bg-secondary-800 rounded-lg">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-primary-500 rounded-full mr-3"></div>
                <span className="text-secondary-900 dark:text-secondary-100">
                  Sample Task {task}
                </span>
              </div>
              <span className="text-sm text-secondary-500 dark:text-secondary-400">
                2 hours ago
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;