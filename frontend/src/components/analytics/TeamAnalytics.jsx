import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UsersIcon,
  CalendarIcon,
  FlagIcon
} from '@heroicons/react/24/outline';
import { useTeam } from '../../context/TeamContext';
import { useProject } from '../../context/ProjectContext';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import StatCard from '../common/StatCard';
import Chart from '../common/Chart';
import ProgressBar from '../common/ProgressBar';
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';

const TeamAnalytics = ({ teamId, timeRange = '30d' }) => {
  const {
    currentTeam,
    teamStats,
    teamActivity,
    fetchTeam,
    fetchTeamStats,
    fetchTeamActivity,
    loading,
    errors
  } = useTeam();

  const { projects, fetchProjects } = useProject();

  const [analyticsData, setAnalyticsData] = useState({
    overview: {},
    productivity: {},
    collaboration: {},
    trends: {}
  });

  const [selectedMetric, setSelectedMetric] = useState('productivity');

  // Fetch data on mount
  useEffect(() => {
    if (teamId) {
      fetchTeam(teamId);
      fetchTeamStats(teamId, { timeRange });
      fetchTeamActivity(teamId, { timeRange });
      fetchProjects({ teamId });
    }
  }, [teamId, timeRange, fetchTeam, fetchTeamStats, fetchTeamActivity, fetchProjects]);

  // Process analytics data
  useEffect(() => {
    if (currentTeam && teamStats) {
      const overview = {
        totalMembers: currentTeam.members?.length || 0,
        activeProjects: projects?.filter(p => p.status === 'active').length || 0,
        totalTasks: teamStats.totalTasks || 0,
        completedTasks: teamStats.completedTasks || 0,
        completionRate: teamStats.totalTasks > 0 
          ? Math.round((teamStats.completedTasks / teamStats.totalTasks) * 100)
          : 0,
        averageTaskTime: teamStats.averageTaskTime || 0,
        overdueTasks: teamStats.overdueTasks || 0
      };

      const productivity = {
        tasksPerMember: overview.totalMembers > 0 
          ? Math.round(overview.totalTasks / overview.totalMembers)
          : 0,
        completionTrend: teamStats.completionTrend || 0,
        velocityTrend: teamStats.velocityTrend || 0,
        burndownData: generateBurndownData(teamStats.burndownData),
        memberProductivity: generateMemberProductivityData(currentTeam.members, teamStats.memberStats)
      };

      const collaboration = {
        commentsPerTask: teamStats.commentsPerTask || 0,
        collaborationScore: teamStats.collaborationScore || 0,
        mentionsCount: teamStats.mentionsCount || 0,
        activeDiscussions: teamStats.activeDiscussions || 0,
        responseTime: teamStats.averageResponseTime || 0
      };

      const trends = {
        weeklyProgress: generateWeeklyProgressData(teamStats.weeklyData),
        priorityDistribution: generatePriorityDistributionData(teamStats.tasksByPriority),
        statusDistribution: generateStatusDistributionData(teamStats.tasksByStatus),
        memberActivity: generateMemberActivityData(teamStats.memberActivity)
      };

      setAnalyticsData({
        overview,
        productivity,
        collaboration,
        trends
      });
    }
  }, [currentTeam, teamStats, projects]);

  // Generate chart data functions
  const generateBurndownData = (burndownData) => {
    if (!burndownData) return null;

    const days = eachDayOfInterval({
      start: subDays(new Date(), 30),
      end: new Date()
    });

    return {
      type: 'line',
      data: {
        labels: days.map(day => format(day, 'MMM dd')),
        datasets: [
          {
            label: 'Ideal Burndown',
            data: burndownData.ideal || [],
            borderColor: '#6B7280',
            backgroundColor: 'rgba(107, 114, 128, 0.1)',
            borderDash: [5, 5]
          },
          {
            label: 'Actual Burndown',
            data: burndownData.actual || [],
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Remaining Tasks'
            }
          }
        }
      }
    };
  };

  const generateMemberProductivityData = (members, memberStats) => {
    if (!members || !memberStats) return null;

    const productivityData = members.map(member => {
      const stats = memberStats[member.user._id] || {};
      return {
        name: member.user.name,
        completed: stats.completedTasks || 0,
        inProgress: stats.inProgressTasks || 0,
        total: (stats.completedTasks || 0) + (stats.inProgressTasks || 0)
      };
    });

    return {
      type: 'bar',
      data: {
        labels: productivityData.map(m => m.name),
        datasets: [
          {
            label: 'Completed Tasks',
            data: productivityData.map(m => m.completed),
            backgroundColor: '#10B981'
          },
          {
            label: 'In Progress Tasks',
            data: productivityData.map(m => m.inProgress),
            backgroundColor: '#F59E0B'
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            stacked: true
          },
          y: {
            stacked: true,
            beginAtZero: true
          }
        }
      }
    };
  };

  const generateWeeklyProgressData = (weeklyData) => {
    if (!weeklyData) return null;

    return {
      type: 'line',
      data: {
        labels: weeklyData.map(w => format(new Date(w.week), 'MMM dd')),
        datasets: [
          {
            label: 'Tasks Completed',
            data: weeklyData.map(w => w.completed),
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4
          },
          {
            label: 'Tasks Created',
            data: weeklyData.map(w => w.created),
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    };
  };

  const generatePriorityDistributionData = (tasksByPriority) => {
    if (!tasksByPriority) return null;

    return {
      type: 'doughnut',
      data: {
        labels: Object.keys(tasksByPriority),
        datasets: [{
          data: Object.values(tasksByPriority),
          backgroundColor: [
            '#EF4444', // high - red
            '#F59E0B', // medium - yellow
            '#10B981'  // low - green
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    };
  };

  const generateStatusDistributionData = (tasksByStatus) => {
    if (!tasksByStatus) return null;

    return {
      type: 'bar',
      data: {
        labels: Object.keys(tasksByStatus),
        datasets: [{
          label: 'Tasks by Status',
          data: Object.values(tasksByStatus),
          backgroundColor: [
            '#10B981', // completed - green
            '#3B82F6', // in-progress - blue
            '#F59E0B', // pending - yellow
            '#EF4444'  // overdue - red
          ]
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    };
  };

  const generateMemberActivityData = (memberActivity) => {
    if (!memberActivity) return null;

    return {
      type: 'radar',
      data: {
        labels: ['Tasks Completed', 'Comments Made', 'Projects Active', 'Collaboration Score', 'Response Time'],
        datasets: memberActivity.map((member, index) => ({
          label: member.name,
          data: [
            member.tasksCompleted || 0,
            member.commentsMade || 0,
            member.projectsActive || 0,
            member.collaborationScore || 0,
            member.responseTime || 0
          ],
          borderColor: `hsl(${index * 60}, 70%, 50%)`,
          backgroundColor: `hsla(${index * 60}, 70%, 50%, 0.2)`
        }))
      },
      options: {
        responsive: true,
        scales: {
          r: {
            beginAtZero: true
          }
        }
      }
    };
  };

  const getTrendIcon = (trend) => {
    if (trend > 0) return TrendingUpIcon;
    if (trend < 0) return TrendingDownIcon;
    return ChartBarIcon;
  };

  const getTrendColor = (trend) => {
    if (trend > 0) return 'text-green-600 dark:text-green-400';
    if (trend < 0) return 'text-red-600 dark:text-red-400';
    return 'text-secondary-600 dark:text-secondary-400';
  };

  if (loading.currentTeam || loading.stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (errors.currentTeam || errors.stats) {
    return (
      <ErrorMessage 
        message={errors.currentTeam || errors.stats} 
        onRetry={() => {
          fetchTeam(teamId);
          fetchTeamStats(teamId, { timeRange });
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
            Team Analytics
          </h2>
          <p className="text-secondary-600 dark:text-secondary-400 mt-1">
            {currentTeam?.name} - Performance insights and metrics
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-md bg-white dark:bg-secondary-700 text-secondary-900 dark:text-secondary-100"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Team Members"
          value={analyticsData.overview.totalMembers}
          icon={UsersIcon}
          color="blue"
        />
        <StatCard
          title="Active Projects"
          value={analyticsData.overview.activeProjects}
          icon={FlagIcon}
          color="purple"
        />
        <StatCard
          title="Completion Rate"
          value={`${analyticsData.overview.completionRate}%`}
          icon={CheckCircleIcon}
          color="green"
          trend={{
            value: analyticsData.productivity.completionTrend,
            isPositive: analyticsData.productivity.completionTrend > 0
          }}
        />
        <StatCard
          title="Overdue Tasks"
          value={analyticsData.overview.overdueTasks}
          icon={ExclamationTriangleIcon}
          color="red"
        />
      </div>

      {/* Metric Selection */}
      <div className="flex space-x-4 border-b border-secondary-200 dark:border-secondary-700">
        {[
          { key: 'productivity', label: 'Productivity', icon: ChartBarIcon },
          { key: 'collaboration', label: 'Collaboration', icon: UsersIcon },
          { key: 'trends', label: 'Trends', icon: TrendingUpIcon }
        ].map(metric => (
          <button
            key={metric.key}
            onClick={() => setSelectedMetric(metric.key)}
            className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors ${
              selectedMetric === metric.key
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-secondary-600 hover:text-secondary-900 dark:text-secondary-400 dark:hover:text-secondary-100'
            }`}
          >
            <metric.icon className="w-5 h-5" />
            <span>{metric.label}</span>
          </button>
        ))}
      </div>

      {/* Productivity Metrics */}
      {selectedMetric === 'productivity' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700 p-6">
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
              Team Burndown
            </h3>
            {analyticsData.productivity.burndownData && (
              <Chart {...analyticsData.productivity.burndownData} />
            )}
          </div>

          <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700 p-6">
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
              Member Productivity
            </h3>
            {analyticsData.productivity.memberProductivity && (
              <Chart {...analyticsData.productivity.memberProductivity} />
            )}
          </div>

          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Tasks per Member"
              value={analyticsData.productivity.tasksPerMember}
              icon={ChartBarIcon}
              color="blue"
            />
            <StatCard
              title="Velocity Trend"
              value={`${analyticsData.productivity.velocityTrend > 0 ? '+' : ''}${analyticsData.productivity.velocityTrend}%`}
              icon={getTrendIcon(analyticsData.productivity.velocityTrend)}
              color="purple"
              className={getTrendColor(analyticsData.productivity.velocityTrend)}
            />
            <StatCard
              title="Avg Task Time"
              value={`${analyticsData.overview.averageTaskTime}h`}
              icon={ClockIcon}
              color="yellow"
            />
          </div>
        </motion.div>
      )}

      {/* Collaboration Metrics */}
      {selectedMetric === 'collaboration' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Comments per Task"
              value={analyticsData.collaboration.commentsPerTask.toFixed(1)}
              icon={ChartBarIcon}
              color="blue"
            />
            <StatCard
              title="Collaboration Score"
              value={analyticsData.collaboration.collaborationScore}
              icon={UsersIcon}
              color="green"
            />
            <StatCard
              title="Active Discussions"
              value={analyticsData.collaboration.activeDiscussions}
              icon={ChartBarIcon}
              color="purple"
            />
            <StatCard
              title="Avg Response Time"
              value={`${analyticsData.collaboration.responseTime}h`}
              icon={ClockIcon}
              color="yellow"
            />
          </div>

          {analyticsData.trends.memberActivity && (
            <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700 p-6">
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
                Member Activity Comparison
              </h3>
              <Chart {...analyticsData.trends.memberActivity} />
            </div>
          )}
        </motion.div>
      )}

      {/* Trends */}
      {selectedMetric === 'trends' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700 p-6">
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
              Weekly Progress
            </h3>
            {analyticsData.trends.weeklyProgress && (
              <Chart {...analyticsData.trends.weeklyProgress} />
            )}
          </div>

          <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700 p-6">
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
              Priority Distribution
            </h3>
            {analyticsData.trends.priorityDistribution && (
              <Chart {...analyticsData.trends.priorityDistribution} />
            )}
          </div>

          <div className="lg:col-span-2 bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700 p-6">
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
              Task Status Distribution
            </h3>
            {analyticsData.trends.statusDistribution && (
              <Chart {...analyticsData.trends.statusDistribution} />
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default TeamAnalytics;