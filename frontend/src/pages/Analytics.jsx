import React from 'react';
import { motion } from 'framer-motion';
import { 
  ChartBarIcon, 
  ArrowTrendingUpIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const Analytics = () => {
  const stats = [
    {
      title: 'Tasks Completed',
      value: '142',
      change: '+12%',
      changeType: 'positive',
      icon: CheckCircleIcon,
      color: 'success'
    },
    {
      title: 'Average Completion Time',
      value: '2.4h',
      change: '-8%',
      changeType: 'positive',
      icon: ClockIcon,
      color: 'info'
    },
    {
      title: 'Productivity Score',
      value: '87%',
      change: '+5%',
      changeType: 'positive',
      icon: ArrowTrendingUpIcon,
      color: 'primary'
    },
    {
      title: 'Active Projects',
      value: '8',
      change: '+2',
      changeType: 'positive',
      icon: ChartBarIcon,
      color: 'warning'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      success: 'bg-success-100 dark:bg-success-900/20 text-success-600',
      info: 'bg-info-100 dark:bg-info-900/20 text-info-600',
      primary: 'bg-primary-100 dark:bg-primary-900/20 text-primary-600',
      warning: 'bg-warning-100 dark:bg-warning-900/20 text-warning-600'
    };
    return colors[color] || colors.primary;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
            Analytics
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400">
            Track your productivity and performance metrics.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-secondary-900 dark:text-secondary-100 mt-1">
                    {stat.value}
                  </p>
                  <div className="flex items-center mt-2">
                    <span className={`text-sm font-medium ${
                      stat.changeType === 'positive' 
                        ? 'text-success-600' 
                        : 'text-error-600'
                    }`}>
                      {stat.change}
                    </span>
                    <span className="text-sm text-secondary-500 dark:text-secondary-400 ml-1">
                      vs last month
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${getColorClasses(stat.color)}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productivity Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
            Productivity Trend
          </h3>
          <div className="h-64 flex items-center justify-center bg-secondary-50 dark:bg-secondary-800 rounded-lg">
            <div className="text-center">
              <ChartBarIcon className="w-12 h-12 text-secondary-400 mx-auto mb-2" />
              <p className="text-secondary-500 dark:text-secondary-400">
                Chart visualization would go here
              </p>
            </div>
          </div>
        </motion.div>

        {/* Task Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
            Task Distribution
          </h3>
          <div className="h-64 flex items-center justify-center bg-secondary-50 dark:bg-secondary-800 rounded-lg">
            <div className="text-center">
              <div className="w-12 h-12 bg-secondary-400 rounded-full mx-auto mb-2"></div>
              <p className="text-secondary-500 dark:text-secondary-400">
                Pie chart visualization would go here
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="card p-6"
      >
        <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
          Recent Activity
        </h3>
        <div className="space-y-4">
          {[
            { action: 'Completed task "Update documentation"', time: '2 hours ago', type: 'success' },
            { action: 'Created new project "Mobile App"', time: '4 hours ago', type: 'info' },
            { action: 'Updated task priority', time: '6 hours ago', type: 'warning' },
            { action: 'Assigned task to team member', time: '1 day ago', type: 'info' }
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-secondary-50 dark:bg-secondary-800 rounded-lg">
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-3 ${
                  activity.type === 'success' ? 'bg-success-500' :
                  activity.type === 'info' ? 'bg-info-500' :
                  activity.type === 'warning' ? 'bg-warning-500' : 'bg-secondary-500'
                }`}></div>
                <span className="text-secondary-900 dark:text-secondary-100">
                  {activity.action}
                </span>
              </div>
              <span className="text-sm text-secondary-500 dark:text-secondary-400">
                {activity.time}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Analytics;